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
    return render_template('photonic/env.html',
                           view='Environment')


@register.resource('GET', '/header')
def header(req, resp):
    return render_template('photonic/header.html')


@register.resource('GET', '/sidebar')
def sidebar(req, resp):
    return render_template('photonic/sidebar.html')


@register.resource('POST', '/login')
def login(req, resp):
    username = req.json.get('username')
    password = req.json.get('password')
    domain = g.app.config.get('identity', 'domain', fallback=None)
    if domain is None:
        domain = req.json.get('domain')
    region = g.app.config.get('identity', 'region', fallback=None)
    if region is None:
        region = req.json.get('region')
    req.context.api.collect_endpoints(region, req.context_interface)
    result = req.context.api.password(username, password, domain)
    result.json['region'] = region
    return result.json


@register.resource('POST', '/scope')
def scope(req, resp):
    if req.credentials.authenticated:
        if 'region' in req.json:
            region = req.json.get('region')
            domain = g.app.config.get('identity', 'domain', fallback=None)
            tenant_id = None
        else:
            region = req.context_region
            tenant_id = req.json.get('tenant_id')

            domain = g.app.config.get('identity', 'domain',
                                      fallback=req.json.get(
                                          'domain',
                                          req.context_domain))

        # Set Unscoped Token
        token = req.get_header('X-Auth-Unscoped-Token')
        token = req.context.api.token(token).json

        token = req.context.api.scope(domain, tenant_id).json

        token['region'] = region
        return token
