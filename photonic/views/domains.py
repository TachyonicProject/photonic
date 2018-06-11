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

from photonic.models.domains import luxon_domain

g.nav_menu.add('/System/Domains',
               href='/system/domains',
               tag='admin',
               feather='at-sign')


@register.resources()
class Domains():
    def __init__(self):
        router.add('GET',
                   '/system/domains',
                   self.list,
                   tag='domains:view')

        router.add('GET',
                   '/system/domains/{id}',
                   self.view,
                   tag='domains:view')

        router.add('GET',
                   '/system/domains/delete/{id}',
                   self.delete,
                   tag='domains:admin')

        router.add(('GET', 'POST',),
                   '/system/domains/add',
                   self.add,
                   tag='domains:admin')

        router.add(('GET', 'POST',),
                   '/system/domains/edit/{id}',
                   self.edit,
                   tag='domains:admin')

    def list(self, req, resp):
        return render_template('photonic/domains/list.html',
                               view='Domains')

    def delete(self, req, resp, id):
        g.client.execute('DELETE', '/v1/domain/%s' % id)
        resp.redirect('/system/domains')

    def view(self, req, resp, id):
        domain = g.client.execute('GET', '/v1/domain/%s' % id)
        html_form = form(luxon_domain, domain.json, readonly=True)
        return render_template('photonic/domains/view.html',
                               view='View Domain',
                               form=html_form,
                               id=id)

    def edit(self, req, resp, id):
        domain = g.client.execute('GET', '/v1/domain/%s' % id)
        html_form = form(luxon_domain, domain.json)
        return render_template('photonic/domains/edit.html',
                               view='Edit Domain',
                               form=html_form,
                               id=id)

    def add(self, req, resp):
        html_form = form(luxon_domain)
        return render_template('photonic/domains/add.html',
                               view='Add Domain',
                               form=html_form)
