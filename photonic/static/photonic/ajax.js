/*
 * GLOBALS
 */

/* select counter */
var select_counter = 0;


/*
 * AJAX query with callback.
 */
function ajax_query(method, url, success, form) {
    loading();
    $('html, body').animate({ scrollTop: 0 }, 'fast');
    if (typeof(form) !== 'undefined' && form != null) {
        if (typeof(window.FormData) == 'undefined') {
            submit = $(form).serialize();
            pd = true;
            ct = 'application/x-www-form-urlencoded; charset=UTF-8'
        } else {
            submit = new FormData(form);
            pd = false;
            ct = false;
        }   
    } else {
        submit = null;
        pd = false;
        ct = false;
    }   
    $.ajax({url: url,
        type: method,
        async: true,
        cache: false,
        context: document.body,
        contentType: ct, 
        processData: pd, 
        data: submit,
        success: function(result, textStatus, XMLHttpRequest) {
            success(result);
        },  
        complete: function() {
           done_loading();
        },  
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            document.getElementById('loading').style.display = "none";
            if (XMLHttpRequest.status == 500) {
                error(XMLHttpRequest.responseText);
            } else {
                warning(XMLHttpRequest.responseText);
            }   
            done_loading();
        }   
    }); 
}


/*
 * Set Inner HTML
 */
function load_html(content) {
    view_section = focus();
    view_section.innerHTML = content;
    feather.replace();
    scripts = view_section.getElementsByTagName('script')
    for (i = 0; i < scripts.length; i++) {
        eval(scripts[i].innerHTML); 
    }   
    ajax(focus());
} 


/*
 * Bootstrap new Modal
 */
function load_modal(content) {
    new_modal = modal(content)
    feather.replace();
    scripts = new_modal.getElementsByTagName('script')
    for (i = 0; i < scripts.length; i++) {
        eval(scripts[i].innerHTML); 
    }   
    ajax(focus());
} 


/*
 * Link Handler triggered by event.
 */
function link_handler(e, element) {
    // IE Compatible.... just incase..
    e = e || window.event;

    if (typeof(element) == 'undefined') {
        element = e.target || e.srcElement;
        if (element.nodeType == 3) element = element.parentNode; // defeat Safari bug
    }

    if (!('noAjax' in element.dataset)) {
        if (element.href.endsWith("#")) {
            $('html, body').animate({ scrollTop: 0 }, 'fast');
        }
        if (element.href != window.location + '#' && !element.href.endsWith("#")) {
            if ('modal' in element.dataset) {
                ajax_query('get', element.href, load_modal);
            } else {
                ajax_query('get', element.href, load_html);
            }
            if (window.innerWidth <= 900) {
                document.getElementById('sidebar').style.display = "none";
            }
            remove_active_a(element);
            element.className = 'active';
            e.preventDefault();
        }
    }
}


/*
 * Form Handler triggered by event.
 */
function form_handler(e, element) {
    // IE Compatible.... just incase..
    e = e || window.event;

    if (typeof(element) == 'undefined') {
        element = e.target || e.srcElement;
        if (element.nodeType == 3) element = element.parentNode; // defeat Safari bug
    }

    if (!('noAjax' in element.dataset)) {
        if ('reload' in element.dataset) {
            ajax_query('post', element.action, reload, element);
        } else {
            ajax_query('post', element.action, load_html, element);
        }

        if (window.innerWidth <= 900) {
            document.getElementById('sidebar').style.display = "none";
        }
        e.preventDefault();
    }
}


/*
 * Display Loading
 */
function loading() {
    var display = document.getElementById('loading').style.display;
    if (display == "none" || display == "")
    {
        document.getElementById('loading').style.display = 'block';
    }
}


/*
 * Remove Loading
 */
function done_loading() {
    var display = document.getElementById('loading').style.display;
    if (display == "block")
    {
        $( "#loading" ).toggle( "fade", {}, 400 );
    }
}


/*
 * Function to turn a select into select2
 */
function toSelect2(element) {
    config = {}
    data = element.dataset;
    if ('noAjax' in data) {
        return;
    }

    if ('text' in data) {
        text_field = data.text;
    } else {
        text_field = 'name';
    }

    if ('searchField' in data) {
        search_field = data.searchField;
    } else {
        search_field = text_field;
    }

    if ('forSearch' in data) {
        config.minimumResultsForSearch = parseInt(data.forSearch);
    }

    if ('allowClear' in data) {
        config.allowClear = true;
    }

    if ('placeholder' in data) {
        config.placeholder = data.placeholder;
    }

    if ('url' in data) {
        config.ajax = {
            dataType: "json",
            url: app + "/apiproxy?url=" + data.url + '&search_field=' + search_field,
            processResults: function (data) {
                // Tranforms the top-level key of the response object to 'results'
                response = [];
                if (!'payload' in data) {
                    alert('broken');
                }
                payload = data.payload
                for (i=0; i < payload.length; i++) {
                    if (payload[i].constructor === String) {
                        id = payload[i];
                        text = payload[i];
                    }
                    else {
                        id = payload[i]["id"]; 
                        text = payload[i][text_field];
                    }
                    response.push({'id': id, 'text': text});
                }
                return {
                    results: response
                }
            }
        }
    }
    element.dataset = {}

    $(element).select2(config);
}


/*
 * Internal function MRender for DataTables.
 */
function mrenderLink(href, css, title) {
    return function (data, type, row) {
        link = '<a href="' + app + href + '/' + row.id + '"';
        link += ' onclick="link_handler(event, this)"';
        if (css != null) {
            link += ' class="' + css + '"';
        }
        link += '>';
        link += title;
        link += '</a>';
        return link;
    }
}

/*
 * Internal function MRender Tick
 */
function mrenderTick(id, css) {
    return function (data, type, row) {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.id = element.id;
        input.value = row.id;
        if (css != null) {
            input.className = css;
        }
        return input.outerHTML;
    }
}

/*
 * Function to turn a table into datatables
 */
function toDataTables(element) {
    var link = null;
    var config = {}
    var data = element.dataset;
    if ('noAjax' in data) {
        return;
    }

    var table_columns = element.getElementsByTagName('th');
    if (table_columns.length == 0) {
        alert('Expecting <th> in <thead> for Datatable');
        return;
    }

    if ('url' in data) {
        config.ajax = {
            url: app + "/apiproxy?url=" + data.url,
            dataSrc: function (json) {
                json.recordsTotal = json.metadata.records;
                json.recordsFiltered = json.metadata.records;
                return json.payload;
            },
            data: function (q) {
                // Modify query params here...
                // However we cant sent multiple of the same param.
                // So we do this work in the API Proxy...
            },
        }
        config.processing = true;
        config.serverSide = true;
        config.columns = [];
        config.columnDefs = [];
        for (i = 0; i < table_columns.length; i++) {
            if ((table_columns[i].id != null) && (table_columns[i].id != '')) {
                config.columns.push({ "data": table_columns[i].id, "title": table_columns[i].innerHTML});
            } else {
                title = table_columns[i].innerHTML;
                if ('href' in table_columns[i].dataset) {
                    href = table_columns[i].dataset.href
                    if ('css' in table_columns[i].dataset) {
                        css = table_columns[i].dataset.css
                    } else {
                        css = null;
                    }
                    if (table_columns[i].width != '' && table_columns[i].width != null) {
                        config.columnDefs.push(
                            { "width": table_columns[i].width,
                              "orderable": false,
                              "className": "text-center",
                              "searchable": false,
                              "targets": i
                            }
                        );
                    } else {
                        config.columnDefs.push( { "orderable": false, "className": "text-center", "targets": i } );
                    }

                    config.columns.push({ "mRender": mrenderLink(href, css, title) })
                } else if ('tick' in table_columns[i].dataset) {
                    if ('css' in table_columns[i].dataset) {
                        css = table_columns[i].dataset.css
                    } else {
                        css = null;
                    }
                    if (element.id == '' || element.id == null) {
                        alert("Expecting 'id' on <table> when using tick/checkbox. The 'id' is used as the <input> 'name'");
                        return; 
                    }

                    config.columnDefs.push( { "searchable": false, "width": "2rem", "orderable": false, "className": "text-center", "targets": i } );

                    config.columns.push({ "mRender": mrenderTick(element.id, css)});
                } else {
                    alert("Expecting 'data-href' for link or 'data-tick' for tick box on custom column <th>");
                    return;
                }
            }
            
        }
        if (config.columns.length == 0) {
            alert("Expecting atleast one column <th>");
            return;
        }
    }

    $(element).DataTable(config);
}


/*
 * Replace all select with select2 :-)
 */
function select(root) {
    selects = root.getElementsByTagName('select');
    for (i = 0; i < selects.length; i++) {
        toSelect2(selects[i]);
    }
}


/*
 * Replace all table with DataTables :-)
 */
function table(root) {
    tables = root.getElementsByTagName('table');
    for (i = 0; i < tables.length; i++) {
        toDataTables(tables[i]);
    }
}



/*
 * AJAX Init
 */
function ajax(focus) {
    register_event(focus, 'a', 'click', link_handler);
    register_event(focus, 'form', 'submit', form_handler);
    select(focus);
    table(focus);
}


$( document ).ready(function() {
    ajax(getElementByTagName('body'));
});
