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
from luxon import g
from luxon import router
from luxon import register
from luxon import render_template
from luxon.utils.bootstrap4 import form
from luxon.utils.html5 import select

from photonic.models.users import luxon_user
from photonic.models.user_roles import luxon_user_role

g.nav_menu.add('/Accounts/Users',
               href='/accounts/users',
               tag='admin',
               feather='users')


def none_to_blank(lst):
    """Replaces all None values with ""

    Args:
        lst (list): list of list or dict objects to parse.

    Return:
        the list with the parsed objects
    """
    for j, object in enumerate(lst):
        if isinstance(object, list):
            for i, v in enumerate(object):
                if v is None:
                    object[i] = ""
            lst[j] = object
        elif isinstance(object, dict):
            for v in object:
                if object[v] is None:
                    object[v] = ""
            lst[j] = object
    return lst


@register.resources()
class Users():
    def __init__(self):
        router.add('GET',
                   '/accounts/users',
                   self.list,
                   tag='users:view')

        router.add('GET',
                   '/accounts/users/{id}',
                   self.view,
                   tag='users:view')

        router.add('GET',
                   '/accounts/users/delete/{id}',
                   self.delete,
                   tag='users:admin')

        router.add(('GET', 'POST',),
                   '/accounts/users/add',
                   self.add,
                   tag='users:admin')

        router.add(('GET', 'POST',),
                   '/accounts/users/edit/{id}',
                   self.edit,
                   tag='users:admin')

    def list(self, req, resp):
        return render_template('photonic/users/list.html',
                               view='Users')

    def delete(self, req, resp, id):
        req.context.api.execute('DELETE', '/v1/user/%s' % id)

    def view(self, req, resp, id):
        user = req.context.api.execute('GET', '/v1/user/%s' % id)
        html_form = form(luxon_user, user.json, readonly=True)
        assignments = req.context.api.execute('GET', '/v1/rbac/user/%s' % id).json
        assignments = none_to_blank(assignments)
        return render_template('photonic/users/view.html',
                               form=html_form,
                               id=id,
                               view="View User",
                               assignments=assignments)

    def edit(self, req, resp, id):
        user = req.context.api.execute('GET', '/v1/user/%s' % id)
        html_form = form(luxon_user, user.json)
        assignments = req.context.api.execute('GET', '/v1/rbac/user/%s' % id).json
        assignments = none_to_blank(assignments)
        num_roles = len(assignments)
        return render_template('photonic/users/edit.html',
                               form=html_form,
                               id=id,
                               view="Edit User",
                               num_roles=num_roles,
                               assignments=assignments)


    def add(self, req, resp):
        if req.method == 'POST':
            data = req.form_dict
            data['tag'] = "tachyonic"
            response = req.context.api.execute('POST', '/v1/user',
                                               data=data)
            return self.view(req, resp, response.json['id'])
        else:
            html_form = form(luxon_user)
            return render_template('photonic/users/add.html',
                                   view='Add User',
                                   form=html_form)
