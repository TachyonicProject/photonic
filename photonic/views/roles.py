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

from photonic.models.roles import luxon_role
from photonic.views.datatable import datatable

g.nav_menu.add('/System/Roles', href='/system/roles', view='admin')


@register.resources()
class Roles():
    def __init__(self):
        router.add('GET',
                   '/system/roles',
                   self.list,
                   tag='role:root')

        router.add('GET',
                   '/system/roles/delete/{id}',
                   self.delete,
                   tag='role:root')

        router.add('GET',
                   '/system/roles/{id}',
                   self.view,
                   tag='role:root')

        router.add(('GET', 'POST',),
                   '/system/roles/add',
                   self.add,
                   tag='role:root')

        router.add(('GET', 'POST',),
                   '/system/roles/edit/{id}',
                   self.edit,
                   tag='role:root')

    def list(self, req, resp):
        list_html = datatable(req, 'roles_view',
                              '/v1/roles',
                              ('name',),
                              view_button=True)
        return render_template('photonic/roles/list.html',
                               datatable=list_html,
                               view='Roles')

    def delete(self, req, resp, id):
        g.client.execute('DELETE', '/v1/role/%s' % id)
        resp.redirect('/system/roles')

    def view(self, req, resp, id):
        role = g.client.execute('GET', '/v1/role/%s' % id)
        html_form = form(luxon_role, role.json, readonly=True)
        return render_template('photonic/roles/view.html',
                               view='View Role',
                               form=html_form,
                               id=id)

    def edit(self, req, resp, id):
        role = g.client.execute('GET', '/v1/role/%s' % id)
        html_form = form(luxon_role, role.json)
        return render_template('photonic/roles/edit.html',
                               view='Edit Role',
                               form=html_form,
                               id=id)

    def add(self, req, resp):
        html_form = form(luxon_role)
        return render_template('photonic/roles/add.html',
                               view='Add Role',
                               form=html_form)
