/*
 * GLOBALS
 */

/* App Path for following links, this gets set in template base.html */
var app = ''

/* Notices - POP Up counter for new id incrementing */
var notices = 0

/* Set Initial Idle Time for Auto-Logout */
var idleTime = 0;

/* List of Modals Open */
var modals = [];

var dt = null;

/*
 * Log Debug output to console.
 */
function log(msg) {
    if (window.console) {
        window.console.log("Photonic " + msg)
    }
}


/*
 * Get the Location of Element.
 */
function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}


/*
 * Get Element by Tag
 */
function getElementByTagName(tag) {
    elements = document.getElementsByTagName(tag);
    return elements[0];
}


/*
 * Get Element by Id or Tag
 */
function getElement(value) {
    try {
        try {
            element = document.getElementById(value);
            if (typeof element === 'undefined' || element == null) {
                throw "getElement not found";
            }
        } catch(err) {
            element = document.getElementsByTagName(value);
            if (typeof element === 'undefined' || element == null) {
                throw "getElement not found";
            }
            if (element.length == 0) {
                throw "getElement not found";
            }
            element = element[0]
        }
    } catch(err) {
        throw "getElement not found";
    }

    return element;
}


/*
 * Internal Insert Node after Reference Node
 */
function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}


/*
 * Reload Page
 */
function reload() {
    window.location.reload();
}


/*
 * Internal Callback Function Caller. (Use in the event of loops)
 */
function callfunc(callback, element) {
    return function(e){ callback(e, element);}
}


/* 
 * Register dom element toggle events.
 */
function register_event(root, tag, on, callback, event_name) {
    if ((typeof root) == 'string') {
        var root_node = getElement(root);
    } else {
        var root_node = root
    }
    var elems = root_node.getElementsByTagName(tag);

    for (i=0; i < elems.length; i++){
        var element = elems[i]
        if (typeof event_name === 'undefined') {
            element.addEventListener(on, callfunc(callback, element));
        }
        else {
            if ('event' in elems[i].dataset) {
                if (element.dataset.event == event_name) {
                    element.addEventListener(on, callfunc(callback, element));
                }
            }
        }
    }
}


/*
 * Responsive sidebar
 */
window.onresize = function() {
    if (window.innerWidth > 900) {
        document.getElementById('sidebar').style.display = "block";
    }
    else {
        document.getElementById('sidebar').style.display = "none";
    }
}


/*
 * Toggle Navigation
 */
function toggle_sidebar() {
    var display = document.getElementById('sidebar').style.display;
    if (display == "none" || display == "") {
        document.getElementById('sidebar').style.display = "block";
    }   
    else {
        document.getElementById('sidebar').style.display = "none";
    }   
}


/*
 * Lock or Unlock background
 */
function toggle_locked() {
    var display = document.getElementById('locked').style.display;
    if (display == "none" || display == "")
    {
        document.getElementById('locked').style.display = "block";
    }   
    else
    {   
        document.getElementById('locked').style.display = "none";
    }   
}


/*
 * POPUPS Below... 
 */
function notice(n, css) {
    notices++;
    var divid = String("popup" + notices);
    n = "<div id=\"" + divid + "\" class=\"popup " + css + "\"><div style='width: 270px; float:left;'>" + n + "</div><div style='float:left;'><button class=\"close\" type=\"button\" onclick=\"close_notice('"+divid+"');\">x</button></div></div>"
    $("#popup").prepend(n);
    if (css == 'error') {
        $('#'+divid).toggle( "shake" );
        setTimeout(function() { close_notice(divid); }, 30000);
    }
    else {
        $('#'+divid).toggle( "fold" );
        setTimeout(function() { close_notice(divid); }, 10000);
    }

}


/*
 * Information popup notification... 
 */
function info(n) {
    notice(n, 'info')
}


/*
 * Success popup notification... 
 */
function success(n) {
    notice(n, 'success')
}

/*
 * Error popup notification... 
 */
function error(n) {
    notice(n, 'error')
}


/*
 * Warning popup notification... 
 */
function warning(n) {
    notice(n, 'warning')
}


/*
 * close popup notification... 
 */
function close_notice(n) {
    //$('#'+n).fadeOut('slow',function() { delete_notice(n) })
    $('#'+n).toggle( "fold" );
    setTimeout(function() { delete_notice(n); }, 1000)
}


/*
 * delete popup notification... 
 */
function delete_notice(n) {
    popup = document.getElementById(n);
    if (popup != null)
    {
        if(typeof popup.remove === 'function') {
            popup.remove()
        } else {
            popup.style.display = "none";
        }
    }
}


/*
 * Actions for messages received from webui /messaging view. 
 */
function action(data) {
    for (i=0; i < data.length; i++){
        // if type is 'goto' then redirect to 'link'
        if (data[i].type == 'goto') {
            window.location.replace(data[i].link);
        }
    }
}


/*
 * Internal Function for auto-logout interval 
 */
function countDownTime(site, idleTimeout, timeCounter) {
    idleTime = idleTime + 1;
    if (idleTime == idleTimeout) { 
        document.getElementById('logout').style.display = "block";
    }
    if (idleTime >= idleTimeout) {
        idleTimeCounter = timeCounter - (idleTime - idleTimeout);
        document.getElementById('timer').innerHTML = idleTimeCounter;

    }
    if (idleTimeCounter == 0)
    {
        idleTimeCounter = 60;
        idleTime = 0;
        window.location.href = site;
    }
}


/**
  * Inactive user auto logout
  */
function autoLogout(site, idleTimeout, timeCounter) {
    idleTimeCounter = timeCounter
    //Increment the idle time counter every second
    var idleInterval = setInterval(function() { countDownTime(site, idleTimeout, timeCounter); }, 1000); 
    //Zero the idle timer on mouse movement.
    $(this).mousemove(function (e) {
        l = document.getElementById('logout').style.display
        if (l == "none" || l == '') {
            idleTime = 0;
        }
    });
    $(this).keypress(function (e) {
        l = document.getElementById('logout').style.display
        if (l == "none" || l == '') {
            idleTime = 0;
        }
    });
}


/**
  * Validate form for browser that does not support HTML5 required
  */
function validate_form(form) {
    var ref = $(form).find("[required]");
    var valid = true;

    $(ref).each(function(){
        if ( $(this).val() == '' ) {
            this.style.borderColor = 'red';
            valid = false;
        }
        else
        {
            this.style.borderColor = null;
        }
    });
    if (valid == false) {
        warning("Required fields empty");
    }
    return valid;
}


/*
 * Create Modal
 */
function modal(content) {
    var modal = document.createElement('div');
    modal.className = "modal";
    var modal_window = document.createElement('div');
    modal_window.innerHTML = content;
    modal.appendChild(modal_window);
    modal_drag(modal_window);
    if (modals.length == 0) {
        getElementByTagName('body').appendChild(modal);
    } else {
        var last = modals[modals.length - 1].parentNode;
        insertAfter(modal, last)
    }
    modal_window.style.top = String(3 + modals.length) + 'rem';
    modals.push(modal_window);
    getElementByTagName('body').style="overflow: hidden"

    return modal_window;
}


/*
 * Make modal dragable
 */
function modal_drag(modal_window) {
    if (modal_window.firstElementChild != null) {
        if (modal_window.firstElementChild.nodeName == 'H1') {
            var heading = modal_window.firstElementChild;
            drag(modal_window, heading);
        }
    }
}


/*
 * Make node draggable...
 */
function drag(elmnt, hook) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
 
    hook.onmousedown = dragMouseDown;
    hook.style.cursor = 'move';

	function dragMouseDown(e) {
		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		// set the element's new position:
		elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
		elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
	}

	function closeDragElement() {
	/* stop moving when mouse button is released:*/
		document.onmouseup = null;
		document.onmousemove = null;
	}
}


/*
 * Get current focus
 */
function focus() {
    if (modals.length == 0) {
        return document.getElementById('main');
    } else {
        return modals[modals.length - 1];
    }
}


/*
 * Close window / modal etc
 */
function close_window() {
    if (modals.length == 0) {
        main = document.getElementById('main');
        main.innerHTML = '';
    } else {
        if (modals.length == 1) {
            getElementByTagName('body').style=""
        }
        var modal = modals.pop();
        modal.parentNode.parentNode.removeChild(modal.parentNode);
        reload_dt();
    }
}


/*
 * Close all windows / modals etc
 */
function close_windows() {
    if (modals.length == 1) {
        getElementByTagName('body').style=""
    }

    while (modals.length > 0) {
        var modal = modals.pop();
        modal.parentNode.parentNode.removeChild(modal.parentNode);
    }

    reload_dt();

}


/*
 * AJAX query with callback.
 */
function ajax_query(method, url, success, form) {
    loading();
    $('html, body').animate({ scrollTop: 0 }, 'fast');
    if (typeof(form) !== 'undefined' && form != null) {
        if (method.toLowerCase() == 'get') {
            method = 'post';
        }
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
    modal_drag(focus());
    reload_dt();
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
    reload_dt();
} 

/**
 * Function to add new form when role has successfully been assigned
 */
function assign(result) {
    var countVal = $(form).parent().attr("data-count");
    var count = parseInt(countVal);
    count++;
    var toBeCopied = $(form).clone(true, true);
    var remover = document.createElement('input');
    $(remover).attr('type', 'hidden');
    $(remover).attr('name','remove');
    $(remover).attr('value','True');
    $(form).append(remover);
    $(form).parent().attr("data-count", count);
    $(toBeCopied).attr('id', 'roleform' + String(count));
    $(toBeCopied).find("a").attr('data-form', 'roleform' + String(count));
    $(toBeCopied).find("a").attr('onclick', 'link_handler(event, this)');
    $(toBeCopied).attr('data-select2-id','roleform' + String(count));
    // as per https://github.com/select2/select2/issues/5269
    // $(form).find("select").select2('destroy') is not working properly,
    // so doing it manually, before rerunning select2 on it.
    $(toBeCopied).find('span').remove();
    $(toBeCopied).find('select').removeAttr('data-select2-id');
    $(toBeCopied).find('select').removeAttr('tabindex');
    $(toBeCopied).find('select').removeAttr('class');
    $(toBeCopied).find('select').removeAttr('aria-hidden');
    $(toBeCopied).find('option').removeAttr('data-select2-id');
    $(toBeCopied).find('div').removeAttr('data-select2-id');
    $(toBeCopied).find('select').each(function () {
        toSelect2(this);
    });
    $(form).find("a:first").show();
    $(form).find("a:last").hide();
    $(form).parent().append(toBeCopied);
}

/**
 * Function to remove role from User.
 */
function revoke(result) {
    // var countVal = $(form).parent().attr("data-count");
    // var count = parseInt(countVal);
    // count--;
    // $(form).parent().attr("data-count",count)
    $(form).remove();
}

/*
 * Link Handler triggered by event.
 */
function link_handler(e, element) {
    // IE Compatible.... just in case..
    e = e || window.event;

    if (typeof(element) == 'undefined') {
        element = e.target || e.srcElement;
        if (element.nodeType == 3) element = element.parentNode; // defeat Safari bug
    }

    if (!('noAjax' in element.dataset)) {
        if ('confirm' in element.dataset) {
            e.preventDefault();
            confirm = '<h1>Please confirm?</h1>';
            confirm += '<div class="confirm">';
            confirm += element.dataset.confirm;
            confirm += '</div>';
            confirm += '<div class="buttons">';
            confirm += '<a href="#" onclick="close_window()" class="btn">Cancel</a>'
            confirm += '<a href="' + element.href + '" data-close-all class="btn btn-danger">Continue</a>'
            confirm += '</div>';
            load_modal(confirm);
        } else {
            nav = getElementByTagName('nav')
            if (nav.contains(element)) {
                dt = null;
            }
            if (element.href.endsWith("#")) {
                $('html, body').animate({ scrollTop: 0 }, 'fast');
            }
            form = document.getElementById(element.dataset.form);
            if (element.href != window.location + '#' && !element.href.endsWith("#")) {
                clear_search(element);
                if ('closeAll' in element.dataset) {
                    ajax_query('get', element.href, close_windows, form);
                }
                else if ('close' in element.dataset) {
                    ajax_query('get', element.href, close_window, form);
                } else if ('modal' in element.dataset) {
                    ajax_query('get', element.href, load_modal, form);
                } else if ('assign' in element.dataset) {
                    ajax_query('get', element.href, assign, form);
                } else if ('revoke' in element.dataset) {
                    ajax_query('get', element.href, revoke, form);
                } else {
                    ajax_query('get', element.href, load_html, form);
                }
                if (window.innerWidth <= 900) {
                    document.getElementById('sidebar').style.display = "none";
                }
                e.preventDefault();
            }
        }
    }
}


/* 
 * Reload Datatable
 */
function reload_dt() {
    try {
        dt.ajax.reload( null, false ); // user paging is not reset on reload
    } catch(err) {
        log('No Datatable to reload');
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
 * A function to generate a function to use
 * in select2's ajax.processResults.
 * (@vuader): Without this, the id_field and text_field
 * are not expanded correctly during run time.
 */
function genS2ProcessFunc(id_field, text_field) {
    function select2ProcessResults(data) {
        // Tranforms the top-level key of the select2 response object to 'results'
        response = [];
        if (!'payload' in data) {
            alert('API responded with error');
        }
        payload = data.payload
        for (i = 0; i < payload.length; i++) {
            if (payload[i].constructor === String) {
                id = payload[i];
                text = payload[i];
            }
            else {
                id = payload[i][id_field];
                text = payload[i][text_field];
            }
            response.push({'id': id, 'text': text});
        }
        return {
            results: response
        }
    };
    return select2ProcessResults;
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

    if ('id' in data) {
        id_field = data.id;
    } else {
        id_field = 'id';
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

    select2ProcessResults = genS2ProcessFunc(id_field, text_field);

    if ('url' in data) {
        config.ajax = {
            dataType: "json",
            delay: 250,
            url: app + "/apiproxy?url=" + data.url + '&search_field=' + search_field,
            processResults: select2ProcessResults
        }
    }
    element.dataset = {}

    $(element).select2(config);
}


/*
 * Internal function MRender for DataTables.
 */
function mrenderLink(href, css, title, dataset) {
    return function (data, type, row) {
        link = '<a href="' + app + href + '/' + row.id + '"';
        link += ' onclick="link_handler(event, this)"';
        if (css != null) {
            link += ' class="' + css + '"';
        }
        if ('modal' in dataset) {
            link += ' data-modal';
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
    config.drawCallback = function( settings ) {
        feather.replace();
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
        if (window.innerHeight > 550) {
            config.pageLength = 10;
        } else {
            config.pageLength = 5;
        }
        config.lengthMenu = [[5, 10, 25, 50], [5, 10, 25, 50]];
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

                    config.columns.push({ "mRender": mrenderLink(href, css, title, table_columns[i].dataset) })
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

    dt = $(element).DataTable(config);
    
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


/*
 * Toggle NAV Dropdown
 */
function toggle_menu_dropdown(e, element) {
    children = element.parentElement.childNodes; 
    for (i=0; i < children.length; i++){
        if (children[i] != element) {
            if (children[i].style.display == "block") {
                children[i].style.display = "none";
            } else {
                children[i].style.display = "block";
            }
        }
    }
}


/*
 * Set all links unactive
 */
function remove_active_a(clicked_a) {
    nav = getElementByTagName('nav');
    if (nav.contains(clicked_a)) {
        links = nav.getElementsByTagName("a"); 
        for (z=0; z < links.length; z++){
            if (links[z].className == 'active') {
                links[z].className = '';
            }
        }
    }
}


/*
 * Display parent ul for link
 */
function view_parent_dropdowns(element) {
    parent = element.parentElement;
    if (parent.nodeName != 'NAV') {
        if (parent.nodeName == 'UL') {
            parent.style.display = 'block';
        }
        if (parent.nodeName == 'LI') {
            parent.style.display = 'block';
        }
        view_parent_dropdowns(parent)
    }
}


/*
 * Set all active links
 */
function set_active_a() {
    nav = getElementByTagName('nav');
    links = nav.getElementsByTagName("a"); 
    for (z=0; z < links.length; z++){
        if (window.location.href.endsWith("#")) {
            current_location = window.location.href.substr(0, window.location.href.indexOf('#'))
        }
        else
        {
            current_location = window.location.href
        }
        if (current_location == links[z].href) {
            links[z].style.display = 'block';
            links[z].className = 'active';
            view_parent_dropdowns(links[z]);
        }
    }
}


function clear_search(e) {
    navmenu = getElementByTagName('nav');
    if (navmenu.contains(e)) {
        div = navmenu.firstChild;
        ul = div.firstChild;
        children = ul.getElementsByTagName('*');
        search_input = document.getElementById('search-nav');
        if (search_input.value.length > 0) {
            for (a = 0; a < children.length; a++) {
                if (!children[a].contains(e)) {
                    if (children[a].nodeName == 'UL') {
                        children[a].style.display = "none";
                    }
                }
                if (children[a].nodeName == 'LI') {
                    children[a].style.display = "block";
                }
            }
        }
        search_input.value = ''
    }
}


/*
 * Navigation Search triggered by event.
 */
function search_nav(e, element) {
    navmenu = getElementByTagName('nav');
    div = navmenu.firstChild;
    ul = div.firstChild;
    if (element.value.length < 2) {
        children = ul.getElementsByTagName('*');
        for (a = 0; a < children.length; a++) {
            if (children[a].nodeName == 'UL') {
                children[a].style.display = "none";
            }
            if (children[a].nodeName == 'LI') {
                children[a].style.display = "block";
            }
        }
    } else if (element.value.length >= 2) {
        children = ul.getElementsByTagName('*');
        for (a = 0; a < children.length; a++) {
            if (children[a].nodeName == 'UL') {
                children[a].style.display = "none";
            }
            if (children[a].nodeName == 'LI') {
                children[a].style.display = "none";
            }
        }
        links = navmenu.getElementsByTagName('A');
        for (a = 0; a < links.length; a++) {
            link_name = links[a].textContent.toLowerCase()
            search = element.value.toLowerCase()
            if (!links[a].href.endsWith("#")) {
                if (link_name.includes(search.trim())) {
                    view_parent_dropdowns(links[a]);
                }
            }
        }
    }
}


function link(e, element) {
    remove_active_a(element); 
    element.className = 'active';
}


$( document ).ready(function() {
    set_active_a();
    register_event('nav', 'a', 'click', link);
    register_event('nav', 'a', 'click', toggle_menu_dropdown, 'dropdown');
    register_event('sidebar', 'input', 'input', search_nav, 'search-nav');
    ajax(getElementByTagName('body'));
    feather.replace();
});
