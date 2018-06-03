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


$( document ).ready(function() {
    feather.replace()
});


function modal(content) {
    var modal = document.createElement('div');
    modal.className = "modal";
    var modal_window = document.createElement('div');
    modal_window.innerHTML = content;
    modal.appendChild(modal_window);
    if (modal_window.firstElementChild.nodeName == 'H1') {
        var heading = modal_window.firstElementChild;
        drag(modal_window, heading);
    }
    if (modals.length == 0) {
        getElementByTagName('body').appendChild(modal);
    } else {
        var last = modals[modals.length - 1];
        insertAfter(modal, last)
    }

    modals.push(modal_window);


    return modal_window;
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
        var modal = modals.pop();
        modal.parentNode.parentNode.removeChild(modal.parentNode);

    }
}
