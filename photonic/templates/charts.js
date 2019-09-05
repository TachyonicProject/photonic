

new Chart(document.getElementById("{{chart_id}}"),
    {
        type: "{{chart_type}}",
        options: {
            maintainAspectRatio: false,
            {% if chart_ysuffix %}
            scales: {
                yAxes: [
                    {
                        ticks: {
                            callback: function(value, index, values) {
                                return value + "{{ chart_ysuffix }}";
                            }
                        }
                    }
                ]
            },
            {% endif %}
            {% if not chart_legend %}
            legend: false,
            {% endif %}
            {% if chart_type == 'pie' %}
            legend: {
                position: 'right'
            },
            {% endif %}

            {% if chart_title %}
            title: {
                padding: 3,
                display: true,
                text: "{{chart_title}}"
            },
            {% endif %}
            responsive: true,
            layout: {
                padding: {
                    top: 5,
                    bottom: 5,
                    left: 5,
                    right: 5
                }
            }
        },
        data: {
            datasets: [
                {% for dataset in chart_datasets %}
                {
                    {% if dataset['fill'] %}
                    fill: {{ dataset['fill'] }},
                    {% endif %}

                    {% if dataset['border_color'] %}
                    borderColor: {{dataset['border_color']}},
                    {% endif %}

                    {% if dataset['background_color'] %}
                    backgroundColor: {{dataset['background_color']}},
                    {% endif %}

                    {% if dataset['label'] %}
                    label: "{{dataset['label']}}",
                    {% endif %}
                    data: [ {{ dataset['data'] }} ]
                },
                {% endfor %}
            ],
            labels: tachyonUtils.formatChartLabels([ {{ chart_labels }} ])
        }
    }
)
