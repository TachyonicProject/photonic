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
from uuid import uuid4

from luxon import Model
from luxon.utils.timezone import now


class luxon_user(Model):
    id = Model.Uuid(default=uuid4, internal=True)
    tag = Model.String(hidden=True, max_length=30, null=False)
    domain = Model.Fqdn(internal=True)
    tenant_id = Model.Uuid(internal=True)
    username = Model.Username(placeholder="john", max_length=100, null=False)
    password = Model.String(max_length=100, null=True, ignore_null=True,
                            password=True)
    confirm_password = Model.Confirm(password)
    email = Model.Email(placeholder="john.doe@acmecorp.org", max_length=255)
    name = Model.String(placeholder="John Doe", max_length=100)
    phone_mobile = Model.Phone(placeholder="+1-202-555-0103")
    phone_office = Model.Phone(placeholder="+1-202-555-0105")
    designation = Model.Enum('', 'Mr', 'Mrs', 'Ms', 'Dr', 'Prof')
    last_login = Model.DateTime(readonly=True)
    enabled = Model.Boolean(default=True)
    creation_time = Model.DateTime(default=now, readonly=True)
    primary_key = id
