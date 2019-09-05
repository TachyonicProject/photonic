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

from luxon import render_template
from luxon.utils.unique import string_id
from luxon.utils.metrics import unit_metric, bytes_metric
from luxon.structs.htmldoc import HTMLDoc

graph_colors = [
    '#FF7F50',
    '#90EE90',
    '#87CEFA',
    '#DDA0DD',
    '#FAFAD2',
    '#00FA9A',
    '#FFE4B5',
    '#9370DB',
    '#7B68EE',
    '#B0E0E6',
    '#AFEEEE',
    '#40E0D0',
    '#FFDAB9',
    '#FFA500',
    '#6495ED',
]


def chart(chart, c_type="pie", title=None, legend=True, ysuffix=None):
    chart_id = string_id()
    c_type = chart.get('type', c_type)
    chart_labels = chart.get('labels')
    for no, chart_label in enumerate(chart_labels):
        if isinstance(chart_label, str):
            chart_labels[no] = "\"" + chart_label + "\""

    chart_labels = ','.join([str(i) for i in chart_labels])

    dom = HTMLDoc()
    canvas = dom.create_element('canvas')
    canvas.set_attribute('id', chart_id)
    script = dom.create_element('script')

    datasets = chart.get('datasets', [])
    for no, dataset in enumerate(datasets):
        if c_type in ["bar", "line"]:
            dataset['background_color'] = "\"" + graph_colors[no] + "\""

        if c_type in ["pie", "doughnut"]:
            dataset['background_color'] = "[ " + ','.join(
                ["\"" + str(i) + "\"" for i in graph_colors]) + " ]"

        if c_type in ["line"]:
            dataset['border_color'] = "\"" + graph_colors[no] + "\""
            dataset['fill'] = "false"

        dataset['data'] = ','.join([str(i) for i in dataset['data']])

    script.append(
        render_template('photonic/charts.js',
                        chart_title=chart.get('title', title),
                        chart_id=chart_id,
                        chart_type=c_type,
                        chart_labels=chart_labels,
                        chart_legend=legend,
                        chart_ysuffix=ysuffix,
                        chart_datasets=datasets))

    return dom
