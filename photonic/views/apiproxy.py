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
from luxon import register_resource
from luxon.constants import TEXT_HTML
from luxon import g

from photonic.utils.form import parse_form

@register_resource('POST', '/scope')
def scope(req, resp):
    if req.token.authenticated:
        if 'X-Region' in req.form:
            x_region = req.get_first('X-Region')
            req.session['region'] = x_region

        if 'X-Domain' in req.form:
            x_domain = req.get_first('X-Domain')
        else:
            x_domain = req.session.get('domain')

        if 'X-Tenant-Id' in req.form:
            x_tenant_id = req.get_first('X-Tenant-Id')
        else:
            x_tenant_id = req.session.get('tenant_id')

        g.client.unscope()
        scoped = g.client.scope(x_domain, x_tenant_id).json
        scoped = scoped['token']
        req.session['scoped'] = scoped
        req.session['domain'] = x_domain
        req.session['tenant_id'] = x_tenant_id

        req.session.save()
    resp.redirect('/')

@register_resource(['GET', 'POST', 'PATCH', 'DELETE', 'PUT'], '/apiproxy')
def apiproxy(req, resp):
    endpoint = req.query_params.get('endpoint')
    term = req.query_params.get('term')
    search_field = req.query_params.get('search_field')
    url = req.query_params.get('url')
    url += '?'

    if req.query_string:
        url += req.query_string

    url += '&range=5'
    if term is not None and search_field is not None:
        url += '&search=%s:%s' % (search_field, term,)

    parsed = parse_form(req.form_dict)

    response = g.client.execute(req.method, url, parsed,
                                endpoint=endpoint)
    resp.set_headers(response.headers)
    resp.status = response.status_code
    resp.content_type = response.content_type
    return response.body
