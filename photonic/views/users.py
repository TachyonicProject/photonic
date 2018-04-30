# -*- coding: utf-8 -*-
# Copyright (c) 2018 Christiaan Frans Rademan.
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
# * Redistributions of source code must retain the above copyright notice, this
#   list of conditions and the following disclaimer.
#
# * Redistributions in binary form must reproduce the above copyright notice,
#   this list of conditions and the following disclaimer in the documentation
#   and/or other materials provided with the distribution.
#
# * Neither the name of the copyright holders nor the names of its
#   contributors may be used to endorse or promote products derived from
#   this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
# LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
# CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
# SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
# INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
# CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
# ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
# THE POSSIBILITY OF SUCH DAMAGE.
import os

from luxon import g
from luxon import GetLogger
from luxon.exceptions import AccessDenied
from luxon.utils.imports import get_class
from luxon import register_resources
from luxon import render_template
from luxon.constants import TEXT_HTML
from luxon.utils.theme import Theme
from luxon.utils.html import form
from luxon.utils.html import select

from photonic.models.users import luxon_user
from photonic.models.user_roles import luxon_user_role
from photonic.views.datatable import datatable

g.nav_menu.add('/System/Users', href='/system/users', view='admin')


def none_to_blank(lst):
    """Replaces all None values with ""
    
    Args:
        lst (list): list of list or dict objects to parse.

    Return:
        the list with the parsed objects
    """
    for j, object in enumerate(lst):
        if isinstance(object, list):
            for i,v in enumerate(object):
                if v is None:
                    object[i] = ""
            lst[j] = object
        elif isinstance(object, dict):
            for v in object:
                if object[v] is None:
                    object[v] = ""
            lst[j] = object
    return lst


@register_resources()
class Users():
    def __init__(self):
        g.router.add('GET',
                     '/system/users',
                     self.list,
                     tag='role:root')

        g.router.add('GET',
                     '/system/users/delete/{id}',
                     self.delete,
                     tag='role:root')

        g.router.add('GET',
                     '/system/users/{id}',
                     self.view,
                     tag='role:root')

        g.router.add(('GET', 'POST',),
                     '/system/users/add',
                     self.add,
                     tag='role:root')

        g.router.add(('GET', 'POST',),
                     '/system/users/edit/{id}',
                     self.edit,
                     tag='role:root')

    def list(self, req, resp):
        list_html = datatable(req, 'users_view',
                              '/v1/users',
                              ('username', 'name',),
                              view_button=True)
        return render_template('photonic/users/list.html',
                               datatable=list_html,
                               view='Users')

    def delete(self, req, resp, id):
        g.client.execute('DELETE', '/v1/user/%s' % id)
        resp.redirect('/system/users')

    def view(self, req, resp, id):
        user = g.client.execute('GET', '/v1/user/%s' % id)
        html_form = form(luxon_user, user.json, readonly=True)
        assignments = g.client.execute('GET', '/v1/rbac/user/%s' % id).json
        assignments = none_to_blank(assignments)
        num_roles = len(assignments)
        return render_template('photonic/users/view.html',
                               view='View User',
                               form=html_form,
                               id=id,
                               num_roles=num_roles,
                               assignments=assignments)

    def edit(self, req, resp, id):
        user = g.client.execute('GET', '/v1/user/%s' % id)
        html_form = form(luxon_user, user.json)
        assignments = g.client.execute('GET', '/v1/rbac/user/%s' % id).json
        assignments = none_to_blank(assignments)
        num_roles = len(assignments)
        selected = ""
        tenants = {}
        if req.token.tenant_id is not None:
            tenant = g.client.execute('GET', '/v1/tenant/' +
                                      req.token.tenant_id).json
            selected = req.token.tenant_id
            tenants[req.token.tenant_id] = tenant['name']

        domain_select = select("domain",[],"",True,'select2')
        tenant_select = select("tenant_id",tenants,selected,True,'select2')
        role_select = select("role",[],"",False,'select2')
        app = g.current_request.app.strip('/').strip()
        if app != '':
            app = '/' + app
        add_docready = "toSelect2('#role','%s','/v1/roles','name','Select " \
                       "Role'); " % app
        add_docready += "toSelect2('#domain','%s','/v1/domains','name'," \
                        "'Select Domain'); " % app
        add_docready += "toSelect2('#tenant_id','%s','/v1/tenants','name'," \
                        "'Select Tenant');" % app
        return render_template('photonic/users/edit.html',
                               view='Edit User',
                               form=html_form,
                               id=id,
                               resource='User',
                               domain_select=domain_select,
                               tenant_select=tenant_select,
                               role_select=role_select,
                               num_roles=num_roles,
                               assignments=assignments,
                               additional_docready=add_docready)

    def add(self, req, resp):
        html_form = form(luxon_user)
        role_form = form(luxon_user_role)
        return render_template('photonic/users/add.html',
                               view='Add User',
                               form=html_form,
                               role_form=role_form)
