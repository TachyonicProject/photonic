# -*- coding: utf-8 -*-
# Copyright (c) 2018-2019 Christiaan Frans Rademan.
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
from luxon import register
from luxon import render_template
from luxon import GetLogger
from luxon import g

log = GetLogger()


@register.resource('GET', '/env')
def env(req, resp):
    if req.host in req.cookies:
        session_id = req.cookies[req.host].strip()
    else:
        session_id = False

    cookies = {}
    for cookie in req.cookies:
        cookies[cookie] = len(req.cookies[cookie])

    return render_template('photonic/env.html',
                           view='Environment',
                           session_id=session_id,
                           cookies=cookies)


@register.resource('POST', '/login')
def login(req, resp):
    username = req.get_first('username')
    password = req.get_first('password')
    domain = g.app.config.get('identity', 'domain', fallback=None)
    if domain is None:
        domain = req.get_first('domain')
    region = g.app.config.get('identity', 'region', fallback=None)
    if region is None:
        region = req.get_first('region')
    req.context.api.collect_endpoints(region, req.context_interface)
    token = req.context.api.password(username, password, domain)
    token = token.json['token']
    req.user_token = token
    req.context_region = region
    _home = req.app if req.app else '/'
    resp.redirect(_home)


@register.resource('GET', '/logout')
def logout(req, resp):
    req.credentials.clear()
    req.session['tenant_name'] = None
    req.session['tenant_id'] = None
    req.session['domain'] = None
    req.user_token = None
    req.scope_token = None
    _home = req.app if req.app else '/'
    resp.redirect(_home)


@register.resource('POST', '/scope')
def scope(req, resp):
    if req.credentials.authenticated:
        if 'X-Region' in req.form_dict:
            x_region = req.get_first('X-Region')
            req.session['region'] = x_region
            x_domain = g.app.config.get('identity', 'domain', fallback=None)
            x_tenant_id = None
        else:
            x_tenant_id = req.get_first('X-Tenant-Id')

            x_domain = g.app.config.get('identity', 'domain',
                                        fallback=req.get_first('X-Domain'))

        # Only require a scoped token when domain or tenant_id is received.
        # api.unscope() will remove our scoped_token, and set_context is called
        # in PRE in psychokinetic middleware.client, which will set token to
        # auth_token
        req.context.api.unscope()
        req.session['domain'] = None
        req.session['tenant_id'] = None

        if x_domain or x_tenant_id:
            # WE scope the token and set session to scoped token context...
            token = req.context.api.scope(x_domain, x_tenant_id).json
            req.scope_token = token['token']
            req.session['domain'] = token.get('domain')
            req.session['tenant_id'] = token.get('tenant_id')

        req.session.save()

    _home = req.app if req.app else '/'
    resp.redirect(_home)
