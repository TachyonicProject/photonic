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
import re

from luxon import g
from luxon import GetLogger
from luxon.exceptions import AccessDenied
from luxon.utils.imports import get_class
from luxon.utils.html import select

log = GetLogger(__name__)

STATIC_REGEX = re.compile('^/' + g.app.config.get('application',
                                                  'static').strip('/')
                          + '.*$')

class Token(object):
    """Tokens Responders / Views.

    Luxon tokens use PKI. Its required to have the private key to sign
    new tokens on the tachyonic api. Endpoints will require the public cert
    to validate tokens authenticity.

    The tokens should be stored in the application root. Usually where the wsgi
    file is located.

    Creating token:
        openssl req  -nodes -new -x509  -keyout token.key -out token.cert

    """
    __slots__ = ()

    def pre(self, req, resp):
        token = req.session.get('token')
        region = req.session.get('region')
        scoped = req.session.get('scoped')
        domain = req.session.get('domain')
        tenant_id = req.session.get('tenant_id')

        # SHORT-CIRCUIT TOKEN VALIDATION FOR STATIC
        if STATIC_REGEX.match(req.route):
            return None

        if token is not None:
            try:
                if scoped is not None:
                    req.token.parse_token(scoped)
                else:
                    req.token.parse_token(token)

                g.client.set_context(token,
                                     scoped,
                                     domain,
                                     tenant_id,
                                     region,
                                     g.config.get('application', 'interface'))

                req.token.domain = domain
                req.token.tenant_id = tenant_id

                _selected_tenant = {}
                if tenant_id is not None:
                    _tenant = g.client.execute('GET',
                                     '/v1/tenant/%s' % tenant_id)
                    _tenant_name = _tenant.json['name']
                    _selected_tenant = {tenant_id: _tenant_name}

                req.context.regions_html = select('X-Region',
                                                  g.client.endpoints.regions,
                                                  region,
                                                  True,
                                                  'select',
                                                  'this.form.submit()')

                domains = g.client.execute('GET', '/v1/rbac/domains').json

                req.context.domains_html = select('X-Domain',
                                                  domains,
                                              domain,
                                              True,
                                              'select',
                                              'this.form.submit()')
                req.context.tenants_html = select('X-Tenant-Id',
                                                  _selected_tenant,
                                                  tenant_id,
                                                  True,
                                                  'select2 form-control',
                                                  'this.form.submit()')
            except AccessDenied:
                req.session.clear()
                req.session.save()
                raise
