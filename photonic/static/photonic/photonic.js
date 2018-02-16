


/**
  * Disable Error popup for Datatables.
  * It will throw a javascript error rather.
  */
$.fn.dataTable.ext.errMode = 'throw';

/**
 * Log Debug output to console.
 */
function log(msg) {
    if (window.console) {
        window.console.log("Tachyonic UI " + msg)
    }
}


/**
  * Reload css for theme updates
  */
function reloadStylesheets() {
	var queryString = '?reload=' + new Date().getTime();
    $('link[rel="stylesheet"]').each(function () {
    	this.href = this.href.replace(/\?.*|$/, queryString);
    });
    return false;
}


/**
  * Function to load content into div and submit form
  *
  * @param string element (HTML Element to populate with result)
  * @param string url (URL to open)
  * @param string form_id Serialize Data from Form to post
  *
  */
function ajax_query(element, url, form, form_save, load_window, save, headers) {
    // DEFAULT PARAMTER NOT SUPPPORTED BY IE
    if (!form) searchMap = null;
    if (!form_save) form_save = false;
    if (!load_window) load_window= false;
    if (!save) save = 'Succesfully saved';
    if (!headers) headers = {}

    $('html, body').animate({ scrollTop: 0 }, 'fast');
    document.getElementById('confirm').style.display = 'none';

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
        typ = 'POST';
    }
    else {
        typ = 'GET';
        pd = false;
        ct = false;
        submit = null;
    }
    document.getElementById('loading').style.display = "block";
    $.ajax({url: url,
        type: typ,
        async: true,
        cache: false,
        context: document.body,
        contentType: ct,
        processData: pd,
        data: submit,
        headers: headers,
        success: function(result) {
            if (form_save == false) {
                $(element).html(result);
                document.getElementById('loading').style.display = "none";
                $("#window_content button").on("click", function(e) {
                    link(this);
                    e.preventDefault()
                });
                $("#window_content a").on("click", function(e) {
                    if ("url" in this.dataset) {
                        link(this);
                        e.preventDefault()
                    }
                });
                $("#service a").on("click", function(e) {
                    if ("url" in this.dataset) {
                        link(this);
                        e.preventDefault()
                    }
                });
                $("#service button").on("click", function(e) {
                    if ("url" in this.dataset) {
                        link(this);
                        e.preventDefault()
                    }
                });
                $("#window_content form").submit(function( e )  {
                    link(this);
                    e.preventDefault()
                });
                $("#service form").submit(function( e )  {
                    if ("url" in this.dataset) {
                        link(this);
                        e.preventDefault()
                    }
                });
            }
            else
            {
                success(save)
            }
            done_loading()
        },
        complete: function() {
            if (load_window == true) {
                open_window();
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            if (XMLHttpRequest.status == 500) {
                error(XMLHttpRequest.responseText);
            }
            else {
                warning(XMLHttpRequest.responseText);
            }
            if (load_window == true) {
                document.getElementById('locked').style.display = "none";
                load_window = false;
            }
            done_loading()
        }
    });
    return false;
}

/**
  * Clear Assign
  */
function clear_assign() {
    document.getElementById('tenant_assignment').value = '';
    document.getElementById('tenant_id').value = '';
}

/**
  * Delete role used by users
  */
function delete_role(domain,tenant_id,role) {
    document.getElementById('assign_domain_id').value = domain;
    if (tenant_id == 'None') {
        document.getElementById('tenant_id').value = '';
    } else {
        document.getElementById('tenant_id').value = tenant_id;
    }
    document.getElementById('remove').value = "True";
    document.getElementById('role').value = role;
}

/**
  * Display or hide Admin Window
  */
function toggle_window() {
    var display = document.getElementById('window').style.display;
    if (display == "none" || display == "")
    {
        windowed = true;
        document.getElementById('window').style.display = "block";
    }   
    else
    {   
        windowed = false;
        document.getElementById('window').style.display = "none";
    }   
}

/**
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

/**
  * Display or hide Loading
  */
function toggle_loading() {
    $( "#loading" ).toggle( "fade", {}, 2000 );
    /*
    var display = document.getElementById('loading').style.display;
    if (display == "none" || display == "")
    {
        document.getElementById('loading').style.display = "block";
    }   
    else
    {   
        document.getElementById('loading').style.display = "none";
    }
    */
}

/**
  * Display Loading
  */
function loading() {
    var display = document.getElementById('loading').style.display;
    if (display == "none" || display == "")
    {
        $( "#loading" ).toggle( "fade", {}, 2000 );
    }
}

/**
  * Remove Loading
  */
function done_loading() {
    var display = document.getElementById('loading').style.display;
    if (display == "block")
    {
        $( "#loading" ).toggle( "fade", {}, 1000 );
    }
}


/**
  * Close window
  */
function close_window() {
    window_display = document.getElementById('window').style.display;
    if (window_display == "block") {
        $( "#window" ).toggle( "puff", 1000 );
        windowed = false;
        document.getElementById('locked').style.display = "none";
        document.getElementById('confirm').style.display = 'none';
    }
}

/**
  * Open window
  */
function open_window() {
    window_display = document.getElementById('window').style.display;
    document.getElementById('locked').style.display = "block";
    if (window_display == "none" || window_display == "") {
        windowed = true;
        $( document ).ready(function() {
            $( "#window" ).toggle( "clip", {}, 1000 );
        });
    }
}


/*
  * This is function is automatically triggerd on any button / form within window or service
  *
  * Open link in admin window or service and or submit form
  * depending on which is active...
  * requires data-url for link
  * optional data-name for title
  *          if not specified gets from button text
  * optional data-save set this to any value to save form and not open link in window
  *          you should see success or errors popup
  * optional data-confirm causes a pop to appear to confirm.. 
  *          set this value to the confirmation question...
  *
  * for example button: <button data-url='/ui/users' data-name='Edit Users'>
  * for example link: <a href="#" data-url="/ui/users">
  * for example form: <form data-url="/ui/users">
  * for example form save: <form data-url="/ui/users" data-save="yes">
  */
function link(element) {
    window_display = document.getElementById('window').style.display;
    if ("url" in element.dataset) {
        url = element.dataset.url;
        name = element.dataset.name;
        tag = element.tagName.toLowerCase();
        if ("save" in element.dataset) {
            save = true;
        }
        else {
            save = false;
        }
        if ("confirm" in element.dataset) {
            document.getElementById('confirmation').innerHTML = element.dataset.confirm;
            document.getElementById('confirm').style.display = 'block';
            $('[data-toggle="tooltip"]').tooltip();
            document.getElementById('continue').onclick = function() {
                confirm = String(element.dataset.confirm);
                document.getElementById('confirm').style.display = 'none';
                delete element.dataset.confirm;
                link(element);
                element.dataset.confirm = confirm;
            }
            $('html, body').animate({ scrollTop: 0 }, 'fast');
        }
        else
            {
            if (window_display == "none" || window_display == "")
            {
                // Inside Customer area
                if (save == false) {
                    //document.getElementById('service').innerHTML = '';
                }
                if (tag != "form") {
                    document.getElementById('title').innerHTML = element.innerHTML;
                }
                if ("name" in element.dataset) {
                    document.getElementById('title').innerHTML = name;
                }
                if (tag == "form") {
                    if (validate_form(element)) {
                        ajax_query("#service", url, element, save); 
                    }
                }
                else {
                    ajax_query("#service", url); 
                }
            }   
            else
            {   
                // Inside Admin Window
                if (save == false) {
                    //document.getElementById('window_content').innerHTML = '';
                }
                if (tag == "form") {
                    if (validate_form(element)) {
                        ajax_query("#window_content", url, element, save); 
                    }
                }
                else {
                    ajax_query("#window_content", url); 
                }
                document.getElementById('locked').style.display = "block";
                if (tag != "form") {
                    document.getElementById('window_title').innerHTML = element.innerHTML;
                }
                if ("name" in element.dataset) {
                    document.getElementById('window_title').innerHTML = name;
                }
                windowed = true;
                document.getElementById('window').style.display = "block";
            }   
        }
        return false;
    }
}

function open_tenant(site, id) {
    headers = { "X-Tenant-Id": id };
    ajax_query("#service", site + "/tenant", form=null, form_save=false, load_window=false, save='<B>Open Tenant Account</B>', headers=headers);
    return false;
}

function close_tenant(site) {
    if (tenant_selected == true) {
        headers = { "X-Tenant-Id": "NULL" };
        ajax_query("#service", site + "/", form=null, form_save=true, load_window=false, save='<B>Closed Tenant Account</B>', headers=headers);
        tenant_selected = false;
        document.getElementById('open_tenant').value = ''
        document.getElementById('service').innerHTML = '<H1>Tenant Closed</H1>'
    }
    else {
        warning('<B>Account already closed</B>')
    }
    return false;
}

function open_domain(site, id) {
    headers = { "X-Tenant-Id": "NULL", "X-Domain": id };
    ajax_query("#service", site + "/", form=null, form_save=true, load_window=false, save='<B>Domain selected</B>', headers=headers);
    tenant_selected = false;
    document.getElementById('open_tenant').value = ''
    document.getElementById('service').innerHTML = '<H1>Switched domain</H1>'

    return false;
}


tenant_selected = false;

/**
  * Open service/customer view for menu
  */
function service(a) {
    if (tenant_selected == true) {
        document.getElementById('service').innerHTML = '';
        ajax_query("#service", a.href); 
        document.getElementById('title').innerHTML = a.innerHTML;
        document.getElementById('locked').style.display = "none";
        document.getElementById('window').style.display = "none";
    }
    else
    {
        warning('<B>Please select tenant account</B>')
    }
    return false
}

/**
  * Open admin view for menu
  */
function admin(a) {
    window_display = document.getElementById('window').style.display;
    if (window_display == "block") {
        $( "#window" ).toggle( "puff", 1000, function () { admin(a) } );
    }
    else {
        document.getElementById('window_content').innerHTML = '';
        ajax_query("#window_content", a.href, null, false, true); 
        document.getElementById('locked').style.display = "block";
        document.getElementById('window_title').innerHTML = a.innerHTML;
        //if (window_display == "none" || window_display == "") {
        //    $( "#window" ).toggle( "clip", {}, 1000 );
        //}
    }
    return false
}

/**
  * Open Window view for menu
  * Currently shortcut to admin(a)
  */
function popup(a) {
    return admin(a);
}

/**
  * Set title
  */
function title(title) {
    var display = document.getElementById('window').style.display;
    //if (display == "none" || display == "")
    if (windowed == false)
    {
        document.getElementById('title').innerHTML = title;
    }
    else
    {
        document.getElementById('window_title').innerHTML = title;
    }
}

/**
  * POPUPS Below... 
  */
notices = 0

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

/**
  * Information popup notification... 
  */
function info(n) {
    notice(n, 'info')
}

/**
  * Success popup notification... 
  */
function success(n) {
    notice(n, 'success')
}

/**
  * Error popup notification... 
  */
function error(n) {
    notice(n, 'error')
}

/**
  * Warning popup notification... 
  */
function warning(n) {
    notice(n, 'warning')
}

/**
  * close popup notification... 
  */
function close_notice(n) {
    //$('#'+n).fadeOut('slow',function() { delete_notice(n) })
    $('#'+n).toggle( "fold" );
    setTimeout(function() { delete_notice(n); }, 1000)
}

/**
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


/**
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


/**
  * AJAX Polling function
  */
var poll_running = false;

function poll(site) {

    // If logged in start polling.
    if (poll_running == true) {
        // If Server side polling ended.
        if (xhReq.readyState === xhReq.DONE) {
            poll_running = false;
            log("Poller: Lost Connection to " + site);
            setTimeout(function() { poll(site); }, 5000);
            return(false);
        }
    }

    // If need to connect to server stream.
    if (poll_running == false) {
        log("Poller: Connecting to stream " + site);
        poll_running = true;
        xhReq = new XMLHttpRequest();
        xhReq.open("GET", site, true);
        xhReq.send(null);
        log("Poller: Connected to stream " + site);

        // Start Position.
        nextReadPos = 0;
    }

    do {
        var allMessages = xhReq.responseText;
        var unprocessed = allMessages.substring(nextReadPos);
        var messageXMLEndIndex = unprocessed.indexOf("</msg>");
        if (messageXMLEndIndex!=-1) {
            var endOfFirstMessageIndex = messageXMLEndIndex + "</msg>".length;
            var anUpdate = unprocessed.substring(0, endOfFirstMessageIndex);
            nextReadPos += endOfFirstMessageIndex;

            // Remove message from xml package. <msg>message</msg>
            var message = unprocessed.substring(5, endOfFirstMessageIndex-6)

            // Log Keep-Alive
            if (message == 'Keep-Alive') {
                log("Poller: Received Server Keep-Alive");
            }
            else {
                // Log Other Messages
                log("Poller: Received message: " + message);
            }
        }
    } while (messageXMLEndIndex != -1);

    setTimeout(function() { poll(site); }, 100);
}

/**
  * Show menu item you clicked on.
  */
$( document ).ready(function() {
    $(".nav-stacked .nav-link").on("click", function() {
        $(".nav li").removeClass("active");
        $(this).addClass("active");
    });
    $(".navbar-fixed-top .nav-link").on("click", function() {
        $(".navbar-fixed-top .nav-link").removeClass("active");
        $(this).addClass("active");
    });
});

/**
  * Inactive user auto logout
  */
var idleTime = 0;

function autoLogout(site, idleTimeout, timeCounter) {
    idleTimeCounter = timeCounter
    //Increment the idle time counter every second
    var idleInterval = setInterval(function() { countDownTimer(site, idleTimeout, timeCounter); }, 1000); 
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
function countDownTimer(site, idleTimeout, timeCounter) {
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

/**
 * Function to turn a Select div into select2
 */
function toSelect2(id,url) {
    $(id).select2({
      allowClear: true,
      placeholder: "",
      ajax: {
        dataType: "json",
        url: "/apiproxy?url=" + url,
        processResults: function (data) {
          // Tranforms the top-level key of the response object from to 'results'
            response = [];
            var isArr = false;
            if (data.constructor === Array) {
                isArr = true
            }
            for (var key in data) {
                if (isArr) {
                    id = data[key]
                }
                else {
                    id = key
                }
                response.push({'id': id, 'text': data[key]})
            }
            return {
                results: response
            }
        }
      }
    });
}

$( document ).ready(function() {
    $("form").submit(function(e) {
        if (validate_form(this) == false) {
            e.preventDefault()
        }
    });
    toSelect2('#X-Domain','v1/domains');
    toSelect2('#X-Tenant-Id','v1/tenants');
});


/**
  * TENANT FORM
  */
function update_tenant_form(tenant_type) {
    if (tenant_type == 'organization') {
        $( ".organization" ).show();
        $( ".individual" ).hide();
    }
    if (tenant_type == 'individual') {
        $( ".organization" ).hide();
        $( ".individual" ).show();
    }
}
function tenant_form() {
    $( "#tenant_type" ).change(function() {
        tenant_type = document.getElementById('tenant_type').value;
        update_tenant_form(tenant_type);
    })
    tenant_type = document.getElementById('tenant_type').value
    update_tenant_form(tenant_type);
}
