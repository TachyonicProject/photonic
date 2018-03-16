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
function toSelect2(id, app, url, search_field, placeholder, text_field) {
    if (typeof text_field === 'undefined') {
        text_field = "name";
    }
    else if  (text_field.constructor === Array) {
        text_field = text_field.join(" ")
    };
    $(id).select2({
      allowClear: true,
      placeholder: placeholder,
      ajax: {
        dataType: "json",
        url: app + "/apiproxy?url=" + url + '&search_field=' + search_field,
        processResults: function (data) {
          // Tranforms the top-level key of the response object to 'results'
            response = [];
            for (var i=0,  tot=data.length; i < tot; i++) {
                if (data[i].constructor === String) {
                    id = data[i]
                    text = data[i]
                }
                else {
                    id = data[i]["id"]
                    text = data[i][text_field]

                }
                response.push({'id': id, 'text': text})
            }
            return {
                results: response
            }
        }
      }
    });
}

function ajax_query(method, url, form, success) {
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
        success: function(result) {
            success(result);
        },
        complete: function() {
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            document.getElementById('loading').style.display = "none";
            if (XMLHttpRequest.status == 500) {
                error(XMLHttpRequest.responseText);
            } else {
                warning(XMLHttpRequest.responseText);
            }
        }
    });
}

function save(result) {
    success('Succesfully saved!')
    document.getElementById('loading').style.display = "none";
}

function create(result) {
    var uri = String(window.location);
    var uri = uri.replace(/\/+$/g, '');
    var l = uri.lastIndexOf('/');
    var uri = uri.substring(0, l) + '/' + result.id;
    info('Redirecting to view!')
    window.location.replace(uri)
}

/**
 * Function to add new form when role has successfully been assigned
 */
function assign(result) {
    save(result);
    var countVal = $(form).parent().attr("data-count");
    var count = parseInt(countVal);
    count++;
    var toBeCopied = $(form).clone(true, true);
    $(form).parent().attr("data-count", count);
    $(form).attr("data-type", "revoke");
    $(form).attr("data-method", "DELETE");
    $(toBeCopied).attr('id', 'roleform' + String(count));
    $(toBeCopied).find('input').attr('data-form_id', 'roleform' + String(count));
    $(form).parent().append(toBeCopied);
    $(form).find(".btn:first").show();
    $(form).find(".btn:last").hide();
}

/**
 * Function to remove role from User.
 */
function revoke(result) {
    save(result);
    var countVal = $(form).parent().attr("data-count");
    var count = parseInt(countVal);
    count--;
    $(form).parent().attr("data-count",count)
    $(form).remove();
}

function submitForm(form, e, method) {
    if ("disabled" in form.dataset) {
        e.preventDefault();
    } else {
        document.getElementById('loading').style.display = "block";
        if (validate_form(form) == false) {
            e.preventDefault();
        }
        if ("type" in form.dataset) {
            if ("url" in form.dataset) {
                url = form.dataset.url;
                if (typeof method === 'undefined') {
                    if ("method" in form.dataset) {
                        method = form.dataset.method;
                    }
                }
                if (typeof method === 'undefined') {
                    log('form requires data-method');
                } else {
                    e.preventDefault();
                    if (form.dataset.type == 'save') {
                        ajax_query(method, url, form, save);
                    }
                    if (form.dataset.type == 'create') {
                        ajax_query(method, url, form, create);
                    }
                    if (form.dataset.type == 'assign') {
                        ajax_query(method, url, form, assign);
                    }
                    if (form.dataset.type == 'revoke') {
                        ajax_query(method, url, form, revoke);
                    }
                }
            } else {
                log('form requires data-url');
            }

            e.preventDefault();
        }
    }
}

var form;

$( document ).ready(function() {
    $("a").on("click", function(e) {
        if ("confirm" in this.dataset) {
            document.getElementById('confirmation').innerHTML = this.dataset.confirm;
            document.getElementById('confirm').style.display = 'block';
            $('[data-toggle="tooltip"]').tooltip();
			uri = this.getAttribute("href");
            document.getElementById('continue').onclick = function() {
                confirm = String(this.dataset.confirm);
                document.getElementById('confirm').style.display = 'none';
				window.location.replace(uri)
            };
            $('html, body').animate({ scrollTop: 0 }, 'fast');
            e.preventDefault();
        }
    });
    $("input").on("click", function(e) {
        if ("form_id" in this.dataset) {
            form = document.getElementById(this.dataset.form_id);
            if ("method" in this.dataset) {
                submitForm(form, e, this.dataset.method);
            } else {
                submitForm(form, e);
            }
        };
        if (String(this.type).toLowerCase() == 'checkbox') {
            var checkbox = $(this);
            parent = this.parentElement
            if( checkbox.is(':checked')) {
                checkbox.attr('value','1');
                parent.innerHTML = this.outerHTML;
            } else {
                checkbox.after().append(checkbox.clone().attr({type:'hidden', value:0}));
            }
        }
    });
    $("form").submit(function(e) {
        submitForm(this, e);
    });
});
