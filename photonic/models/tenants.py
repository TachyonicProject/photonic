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
from luxon import Model
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

from photonic.models.domains import luxon_domain

@database_model()
class luxon_tenant(SQLModel):
    id = Uuid(default=uuid4, internal=True)
    domain = Fqdn(internal=True)
    tenant_id = Uuid(internal=True)
    name = String(max_length=100, null=False)
    enabled = Boolean(default=True)
    creation_time = DateTime(default=now, readonly=True)
    unique_tenant = UniqueIndex(domain, name)
    tenants = Index(id, domain)
    tenants_search_name = Index(domain, name)
    tenants_per_domain = Index(domain)
    primary_key = id
    tenant_domain_ref = ForeignKey(domain, luxon_domain.name)
    tenant_parent_ref = ForeignKey(tenant_id, id)
