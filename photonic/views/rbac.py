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

from luxon import register_resources


@register_resources()
class UserRole():
    def __init__(self):
        g.router.add(['POST', 'DELETE'],
                     '/system/rbac/user/{id}',
                     self.userrole,
                     tag='admin')

    def userrole(self, req, resp, id):
        """View to assign Role to User.
        View to assign Role to User.

        URL Args:
            id (str): UUID of User.

        Form Args:
            role (str): UUID of role.
            domain (str): Optional Name of domain.
            tenant_id (str): Optional UUID of tenant.
        """
        url = 'v1/rbac/user/%s/' % id
        values = req.form_dict
        if not values['tenant_id']:
            values['tenant_id'] = req.token.tenant_id
        url += values['role']
        if values['domain']:
            url += '/' + values['domain']
        if values['tenant_id'] and not values['domain']:
            url += '/none/' + values['tenant_id']
        elif values['tenant_id']:
            url += '/' + values['tenant_id']
        g.client.execute(req.method, url)
