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
import re

from luxon import register

DT_COL_NAMES_RE = re.compile(r'^columns\[(.*)\]\[data\]$')


@register.resource(['GET', 'POST', 'PATCH', 'DELETE', 'PUT'], '/apiproxy')
def apiproxy(req, resp):
    endpoint = req.query_params.get('endpoint')
    url = req.query_params.get('url')
    if url is None:
        raise ValueError('Requre url param')
    url = url.split('?')[0]

    params = req.query_params.copy()

    # Following used by Select2.
    search_field = req.query_params.get('search_field')
    term = req.query_params.get('term')
    if term is not None and search_field is not None:
        params['search'] = "%s:%s" % (search_field, term,)

    # Detect Datatables....
    if 'order[0][column]' in params:

        # Following used by Datatables Paging.
        if 'length' in params:
            params['limit'] = params['length']

        if 'start' in params:
            limit = int(params['limit'])
            start = int(params['start'])
            params['page'] = str(int((start / limit) + 1))

        # Following used by Datatables Order.
        dt_col = params['order[0][column]']
        dt_dir = params['order[0][dir]']
        dt_col_name = params.get('columns[' + dt_col + '][data]')
        if dt_col_name is not None:
            params['sort'] = "%s:%s" % (dt_col_name, dt_dir,)

        # Following used by Datatables Search.
        if 'search' not in params:
            dt_search = params.get('search[value]')
            params['search'] = []
            if dt_search is not None and dt_search.strip() != '':
                for param in params:
                    match = DT_COL_NAMES_RE.match(param)
                    if match:
                        index = match.groups()
                        searchable = params.get(
                            "columns[%s][searchable]" % index)
                        if searchable == 'true':
                            dt_field = params[param]
                            params['search'].append(
                                '%s:%s' % (dt_field, dt_search,))

    # MUST REMOVE SOME HEADERS
    req_headers = {}
    for hdr in req.headers:
        if hdr.lower() not in ['host']:
            req_headers[hdr] = req.headers[hdr]

    if 'json' in str(req.content_type).lower():
        response = req.context.api.execute(
            req.method, url, params=params,
            data=req.read(), endpoint=endpoint,
            headers=req_headers
        )
    elif 'xml' in str(req.content_type).lower():
        response = req.context.api.execute(
            req.method, url, params=params,
            data=req.read(), endpoint=endpoint,
            headers=req_headers
        )
    else:
        response = req.context.api.execute(
            req.method, url, params=params,
            data=req.form_dict, endpoint=endpoint,
            headers=req_headers
        )

    resp.set_headers(response.headers)
    resp.status = response.status_code
    resp.content_type = response.content_type

    return response.content
