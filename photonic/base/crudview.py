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
from luxon import render_template
from luxon.structs.htmldoc import HTMLDoc
from luxon.exceptions import RestClientError

class CRUDView(object):
    base_resource = ''
    view_role = None
    update_role = None

    def __init__(self):
        self.base_resource = self.base_resource.strip('/')
        self.base_resource = '/' + self.base_resource

        g.router.add('GET', self.base_resource, self.list,
                     tag=self.view_role)
        g.router.add('GET', self.base_resource + '/{id}', self.view,
                     tag=self.view_role)
        g.router.add('GET', self.base_resource + '/create', self.create,
                     tag=self.update_role)
        g.router.add('POST', self.base_resource + '/create', self.create,
                     tag=self.update_role)
        g.router.add('GET', self.base_resource + '/update/{id}', self.update,
                     tag=self.update_role)
        g.router.add('POST', self.base_resource + '/update/{id}', self.update,
                     tag=self.update_role)
        g.router.add('POST', self.base_resource + '/delete/{id}', self.update,
                     tag=self.update_role)

    @property
    def name(self):
        return '/photonic/' + self.__class__.__name__.lower()

    @property
    def tvals(self):
        tvals = {}
        tvals.update(g.current_request.route_kwargs)
        tvals.update(g.current_request.form_dict)
        tvals['delete'] = self.base_resource + '/delete/' + tvals['id']
        tvals['update'] = self.base_resource + '/update/' + tvals['id']
        tvals['create'] = self.base_resource + '/create'
        tvals['list'] = self.base_resource
        tvals['view'] = self.base_resource + '/' + tvals['id']
        return tvals

    def create(self, req, resp, form):
        if req.method == 'POST':
            id = self.create_pre(req, resp)

        if req.method == 'POST' and id is not None:
            resp.redirect(self.base_resource + '/' + id)
        else:
            template = render_template(self.name + '/create.html',
                                       **self.tvals)
            return template

    def list(self, req, resp):
        values = self.list_pre(req, resp)

        template = render_template(self.name + '/list.html', **values)

        return template

    def view(self, req, resp, id):
        values = self.view_pre(req, resp, id)

        template = render_template(self.name + '/view.html', **values)

        return template

    def update(self, req, resp, form, id):
        tvals = self.tvals
        if req.method == 'POST':
            values = self.update_pre(req, resp, id)
            if values is not None:
                tvals.update(values)

        template = render_template(self.name + '/update.html',
                                   tvals)

        return template

    def delete(self, req, resp, form, id):
        if req.method == 'POST':
            self.delete_pre(req, resp, id)

        resp.redirect(self.base_resource)

