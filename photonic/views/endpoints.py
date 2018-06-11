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

from photonic.models.endpoints import luxon_endpoint

g.nav_menu.add('/System/Endpoints',
               href='/system/endpoints',
               tag='role:root',
               feather='grid')


@register.resources()
class Endpoints():
    def __init__(self):
        router.add('GET',
                   '/system/endpoints',
                   self.list,
                   tag='login')

        router.add('GET',
                   '/system/endpoints/{id}',
                   self.view,
                   tag='login')

        router.add('GET',
                   '/system/endpoints/delete/{id}',
                   self.delete,
                   tag='admin')

        router.add(('GET', 'POST',),
                   '/system/endpoints/add',
                   self.add,
                   tag='admin')

        router.add(('GET', 'POST',),
                   '/system/endpoints/edit/{id}',
                   self.edit,
                   tag='admin')

    def list(self, req, resp):
        return render_template('photonic/endpoints/list.html',
                               view='Endpoints')

    def delete(self, req, resp, id):
        g.client.execute('DELETE', '/v1/endpoint/%s' % id)
        resp.redirect('/system/endpoints')

    def view(self, req, resp, id):
        endpoint = g.client.execute('GET', '/v1/endpoint/%s' % id)
        html_form = form(luxon_endpoint, endpoint.json, readonly=True)
        return render_template('photonic/endpoints/view.html',
                               view='View Endpoint',
                               form=html_form,
                               id=id)

    def edit(self, req, resp, id):
        endpoint = g.client.execute('GET', '/v1/endpoint/%s' % id)
        html_form = form(luxon_endpoint, endpoint.json)
        return render_template('photonic/endpoints/edit.html',
                               view='Edit Endpoint',
                               form=html_form,
                               id=id)

    def add(self, req, resp):
        html_form = form(luxon_endpoint)
        return render_template('photonic/endpoints/add.html',
                               view='Add Endpoint',
                               form=html_form)
