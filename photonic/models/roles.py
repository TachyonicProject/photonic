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

from luxon import database_model
from luxon import SQLModel
from luxon import Uuid
from luxon import String
from luxon import Text
from luxon import DateTime
from luxon import Boolean
from luxon import Email
from luxon import Phone
from luxon import Enum
from luxon import Index
from luxon import ForeignKey
from luxon import UniqueIndex
from luxon import Username
from luxon import Fqdn
from luxon.utils.timezone import now

ROLES = [
    ('00000000-0000-0000-0000-000000000000', 'Root', None, now()),
    (str(uuid4()), 'Operations', None, '0000-00-00 00:00:00'),
    (str(uuid4()), 'Administrator', None, '0000-00-00 00:00:00'),
    (str(uuid4()), 'Account Manager', None, '0000-00-00 00:00:00'),
    (str(uuid4()), 'Billing', None, '0000-00-00 00:00:00'),
    (str(uuid4()), 'Customer', None, '0000-00-00 00:00:00'),
    (str(uuid4()), 'Support', None, '0000-00-00 00:00:00'),
]

@database_model()
class luxon_role(SQLModel):
    id = Uuid(default=uuid4, internal=True)
    name = String(max_length=64, null=False)
    description = Text()
    creation_time = DateTime(default=now, readonly=True)
    primary_key = id
    unique_role = UniqueIndex(name)
    db_default_rows = ROLES
    roles = Index(name)
