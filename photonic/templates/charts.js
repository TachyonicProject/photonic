
new Chart(document.getElementById("{{chart_id}}"),
    {
        type: "{{chart_type}}",
        options: {
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
                    data: [
                        {% for dataset in 
                    ]
                }
                {% endfor %}
            ],
            labels: [
                'Red',
                'Yellow',
                'Blue'
            ]
        }
    }
)
