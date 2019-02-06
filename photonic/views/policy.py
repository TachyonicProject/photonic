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
from luxon import g
from luxon import router
from luxon import register
from luxon import render_template
from luxon.utils.files import is_file
from luxon.utils.pkg import Module
from luxon.exceptions import JSONDecodeError
from luxon import js

g.nav_menu.add('/System/Policy', href='/policy', feather='eye',
               tag='infrastructure:admin')


@register.resources()
class Tachyonic():
    def __init__(self):
        router.add('GET', '/policy', self.policy, tag='infrastructure:admin')

    def policy(self, req, resp):
        override_file = g.app.path + '/policy.json'
        luxon = Module('luxon')
        policy = luxon.read('policy.json')
        try:
            policy = js.loads(policy)
        except JSONDecodeError as exception:
            raise JSONDecodeError("Invalid Luxon 'policy.json' %s" %
                                  exception)
        if is_file(override_file):
            with open(override_file, 'r') as override:
                override = override.read()
                try:
                    override = js.loads(override)
                except JSONDecodeError as exception:
                    raise JSONDecodeError("Invalid Override 'policy.json' %s" %
                                          exception)
        else:
            override = {}

        policy.update(override)

        return render_template('photonic/policy.html',
                               policy=policy,
                               view="RBAC Policy Engine Rules")
