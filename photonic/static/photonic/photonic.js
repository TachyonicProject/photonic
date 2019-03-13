function mxMultiplicityMax(type, max, validNeighbors, error) {
    this.type = type;
    this.min = 0;
    this.max = (max != null) ? max : 1;
    this.validNeighbors = validNeighbors;
    this.error = error;
    this.check = function(graph, edge, source, target, sourceOut, targetIn) {
        var error = '';
        var counter = 0;
        var valid = this.validNeighbors;
        var destinationTargetValue = graph.model.getValue(target);

        if (this.checkTerminal(graph, source, edge)) {
            edges = graph.model.getOutgoingEdges(source);
            for (var e = 0; e < edges.length; e++){
                var edgeTarget = graph.model.getTerminal(edges[e], false);
                var targetValue = graph.model.getValue(edgeTarget);
                for (var v = 0; v < valid.length; v++) {
                    if (this.checkType(graph, destinationTargetValue, valid[v])) {
                        counter++;
                    }
                    if (this.checkType(graph, targetValue, valid[v])) {
                        counter++;
                    }
                }
            }
            if (counter > this.max) {
                error = this.error + '\n';
            }
        }

        return (error.length > 0) ? error : null;
    }
    this.checkTerminal = function(graph, terminal, edge)
    {
        var value = graph.model.getValue(terminal);
        
        return this.checkType(graph, value, this.type, this.attr, this.value);
    };
    this.checkType = function(graph, value, type, attr, attrValue)
    {
        if (value != null)
        {
            if (!isNaN(value.nodeType)) // Checks if value is a DOM node
            {
                return mxUtils.isNode(value, type, attr, attrValue);
            }
            else
            {
                return value == type;
            }
        }
        
        return false;
    };
};

function mxMaxSymbol(model, parent, child, tagName, max) {
    function check(cell) {
        return(cell.getValue().tagName == tagName);
    }
    if (child.getValue().tagName == tagName) {
        cells = model.filterDescendants(check, model.getRoot(parent));
        if (cells.length >= max) {
            return(true);
        }
    }
    return(false);
}


var tachyon = {
    app: null,
    reTokenTime: 30,
    notices: 0,
    idleTime: 0,
    modals: [],
    cleanups: {"main": [], "sidebar": [], "header": []},

    init: function(app) {
        if (app == '/') {
            var app = '';
        }
        tachyon.app = app;
        tachyon.init = function() {
            tachyon.log('Cannot tachyon.init() javascript again!');
        }

        String.prototype.trimLeft = function(charlist) {
            if (charlist === undefined)
                charlist = "\s";
            return this.replace(new RegExp("^[" + charlist + "]+"), "");
        };

        String.prototype.trimRight = function(charlist) {
            if (charlist === undefined)
                charlist = "\s";
            return this.replace(new RegExp("[" + charlist + "]+$"), "");
        };

        String.prototype.trim = function(charlist) {
            return this.trimLeft(charlist).trimRight(charlist);
        };

        // MXGraph Global Configuration....
        mxUtils.alert = function (message) {
            message = message.trimRight('\n');
            message = message.replace("\n", "<BR>");
            tachyon.error("<B>Diagram ditor</B><BR><BR>" + message + '<BR>');
        }

        mxGraph.prototype.htmlLabels = true;

        mxGraph.prototype.isWrapping = function(cell)
        {
            return true;
        };

        mxConstants.DEFAULT_HOTSPOT = 1;

        // Enables guides
        mxGraphHandler.prototype.guidesEnabled = true;

        // Alt disables guides
        mxGuide.prototype.isEnabledForEvent = function(evt)
        {
            return !mxEvent.isAltDown(evt);
        };

        // Enables snapping waypoints to terminals
        mxEdgeHandler.prototype.snapToTerminals = true;

        origMxWindow = mxWindow;
        mxWindow = function (title,
                             content,
                             x,  
                             y,  
                             width,
                             height,
                             minimizable,
                             movable,
                             replaceNode,
                             style) {
            curwindow = tachyon.focus();
            div = document.createElement('div');
            div.id = 'mxWindows';
            curwindow.appendChild(div);
            return new origMxWindow(title,
                                content,
                                x,
                                y,
                                width,
                                height,
                                minimizable,
                                movable,
                                div,
                                style);
        }

        origMxGraphModel = mxGraphModel.prototype.add;
        mxGraphModel.prototype.add = function(parent, child, index) {
            if (mxMaxSymbol(this, parent, child, 'Event', 1)) {
                mxUtils.alert('Only one <B>Start Event</B> permitted.');
                return null;
            }
            if (mxMaxSymbol(this, parent, child, 'EventEnd', 1)) {
                mxUtils.alert('Only one <B>End Event</B> permitted.');
                return null;
            }
            
            return origMxGraphModel.call(this, parent, child, index);
        }


        /* Disable Enter Key for hyperlinks <A>*/
        function stopRKey(evt) {
          var evt = (evt) ? evt : ((event) ? event : null);
          var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);
          if (node.tagName.toUpperCase() == 'A')
          {
              if (evt.keyCode == 13) {return false;}
          }
        }
        document.onkeypress = stopRKey; 

        // BOOTSTRAP DATATABLES
        $.fn.dataTable.ext.errMode = 'none'

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
         * Global Ajax Error Handler
         */
        $( document ).ajaxError(function( event, XMLHttpRequest, settings, thrownError ) {
            if (XMLHttpRequest.getResponseHeader('X-Expired-Token')) {
                if ('token' in sessionStorage) {
                    tachyon.warning('<B>Window session (token) has expired</B>');
                    if (sessionStorage.getItem(login_request) == null) {
                        tachyon.setCookie('tachyonLogin', '{}', 365);
                    }
                    sessionStorage.clear();
                    tachyon.initWindow();
                }
            } else {
                document.getElementById('loading').style.display = "none";
                if (XMLHttpRequest.status == 500) {
                    tachyon.error(XMLHttpRequest.responseText);
                } else {
                    if (XMLHttpRequest.responseText) {
                        tachyon.warning(XMLHttpRequest.responseText);
                    } else {
                        if (thrownError != 'abort') {
                            tachyon.warning("AJAX: " + thrownError);
                        }
                    }
                }
                $('.photonic-checkbox').remove();
                tachyon.doneLoading();
            }
        });

        $.ajaxSetup({
            beforeSend: function(xhr) {
                token = sessionStorage.getItem("scoped_token");
                // Scoped Token
                if (token != null) {
                    xhr.setRequestHeader("X-Auth-Token", token);
                }
                // Unscoped Token - used for re-scoping
                token = sessionStorage.getItem("token");
                if (token != null) {
                    xhr.setRequestHeader("X-Auth-Unscoped-Token", token);
                }
                // X-Region Session
                region = sessionStorage.getItem("region");
                if (region != null) {
                    xhr.setRequestHeader("X-Region", region);
                }
                // X-Domain Session
                domain = sessionStorage.getItem("domain");
                if (domain != null) {
                    xhr.setRequestHeader("X-Domain", domain);
                }
                // X-Tenant-ID Session
                tenant_id = sessionStorage.getItem("tenant_id");
                if (tenant_id != null) {
                    xhr.setRequestHeader("X-Tenant-Id", tenant_id);
                }
            }
        });

        tachyon.registerEvent('html', null, 'click', tachyon.updateToken);
        tachyon.registerEvent('html', null, 'contextmenu', tachyon.updateToken);
        if (tachyon.initSession(true)) {
            tachyon.ajax(tachyon.getElementByTagName('header'));
            tachyon.ajax(document.getElementById('sidebar'));
            tachyon.ajax(tachyon.focus());
            tachyon.registerEvent('nav', 'a', 'click', tachyon.setNavActiveLink);
            tachyon.registerEvent('nav', 'a', 'click', tachyon.navToggleDropdown, 'dropdown');
            tachyon.registerEvent('sidebar', 'input', 'input', tachyon.navSearch, 'search-nav');
            tachyon.initNavActiveLink();
            tachyon.doneLoading();
        }
        setInterval(tachyon.reToken, 1000 * 5);
        setInterval(tachyon.initSession, 1000 * 5);
    },

    /*
     * Log Debug output to console.
     */
    log: function(msg) {
        if (window.console) {
            window.console.log("Tachyonic: " + msg)
        }
    },

    isNode: function(o){
        return (
            typeof Node === "object" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
        );
    },

    isfunction: function(o){
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
        );
    },

    /*
     * Get the Location of Element.
     */
    getOffset: function(el) {
        var _x = 0;
        var _y = 0;
        while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
            _x += el.offsetLeft - el.scrollLeft;
            _y += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
        }
        return { top: _y, left: _x };
    },

    /*
     * Get Element by Tag
     */
    getElementByTagName: function(tag) {
        elements = document.getElementsByTagName(tag);
        return elements[0];
    },

    /*
     * Get Element by Id or Tag
     */
    getElement: function(value) {
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
    },

    /*
     * Internal Insert Node after Reference Node
     */
    insertAfter: function(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    },

    /*
     * Reload Page
     */
    reload: function() {
        window.location.reload();
    },

    /*
     * Internal Callback Function Caller. (Use in the event of loops)
     */
    callfunc: function(callback, element) {
        return function(e){ callback(e, element);}
    },

    /* 
     * Register dom element toggle events.
     */
    registerEvent: function(root, tag, on, callback, event_name) {
        if ((typeof root) == 'string') {
            var root_node = tachyon.getElement(root);
        } else {
            var root_node = root
        }
		if (tag != null) {
			var elems = root_node.getElementsByTagName(tag);

			for (i=0; i < elems.length; i++){
				var element = elems[i]
				if (typeof event_name === 'undefined') {
					element.addEventListener(on, tachyon.callfunc(callback, element));
				}
				else {
					if ('event' in elems[i].dataset) {
						if (element.dataset.event == event_name) {
							element.addEventListener(on, tachyon.callfunc(callback, element));
						}
					}
				}
			}
        } else {
            root_node.addEventListener(on, tachyon.callfunc(callback, root));
        }
    },

    /*
     * Popup messages Below... 
     */
    notice: function(n, css) {
        n = n + '<BR><I>' + new Date().toLocaleString() + '</I>';
        tachyon.notices++;
        var divid = String("popup" + tachyon.notices);
        n = "<div id=\"" + divid + "\" class=\"popup " + css + "\"><div style='width: 270px; float:left;'>" + n + "</div><div style='float:left;'><button class=\"close\" type=\"button\" onclick=\"tachyon.closeNotice('"+divid+"');\">x</button></div></div>"
        $("#popup").prepend(n);
        if (css == 'error') {
            $('#'+divid).toggle( "shake" );
            setTimeout(function() { tachyon.closeNotice(divid); }, 30000);
        }
        else {
            $('#'+divid).toggle( "fold" );
            setTimeout(function() { tachyon.closeNotice(divid); }, 10000);
        }
    },

    /*
     * Information popup notification... 
     */
    info: function(n) {
        tachyon.notice(n, 'info')
    },


    /*
     * Success popup notification... 
     */
    success: function(n) {
        tachyon.notice(n, 'success')
    },

    /*
     * Error popup notification... 
     */
    error: function(n) {
        tachyon.notice(n, 'error')
    },

    /*
     * Warning popup notification... 
     */
    warning: function(n) {
        tachyon.notice(n, 'warning')
    },

    /*
     * close popup notification... 
     */
    closeNotice: function(n) {
        $('#'+n).toggle( "fold" );
        setTimeout(function() { tachyon.deleteNotice(n); }, 1000)
    },

    /*
     * delete popup notification... 
     */
    deleteNotice: function(n) {
        popup = document.getElementById(n);
        if (popup != null)
        {
            if(typeof popup.remove === 'function') {
                popup.remove()
            } else {
                popup.style.display = "none";
            }
        }
    },

    /*
     * Toggle Navigation
     */
    toggleSidebar: function() {
        var display = document.getElementById('sidebar').style.display;
        if (display == "none" || display == "") {
            document.getElementById('sidebar').style.display = "block";
        }   
        else {
            document.getElementById('sidebar').style.display = "none";
        }   
    },

    /**
      * Validate form for browser that does not support HTML5 required
      */
    validateForm: function(form) {
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
    },

    /*
     * Create Modal
     */
    modal: function(content) {
        var modal = document.createElement('div');
        modal.className = "modal";
        var modal_window = document.createElement('div');
        modal_window.innerHTML = content;
        modal.appendChild(modal_window);
        tachyon.modalDRag(modal_window);

        if (tachyon.modals.length == 0) {
            tachyon.getElementByTagName('body').appendChild(modal);
        } else {
            var last = tachyon.modals[tachyon.modals.length - 1].parentNode;
            tachyon.insertAfter(modal, last)
        }

        modal_window.style.top = String(3 + tachyon.modals.length) + 'rem';
        modal_window.id = "model_" + tachyon.modals.length;
        tachyon.modals.push(modal_window);
        tachyon.cleanups[modal_window.id] = [];
        tachyon.getElementByTagName('body').style="overflow: hidden"

        return modal_window;
    },

    /*
     * Make modal dragable
     */
    modalDRag: function(modal_window) {
        if (modal_window.firstElementChild != null) {
            if (modal_window.firstElementChild.nodeName == 'H1') {
                var heading = modal_window.firstElementChild;
                tachyon.drag(modal_window, heading);
            }
        }
    },

    /*
     * Make node draggable...
     */
    drag: function(elmnt, hook) {
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
    },

    /*
     * Get current focus
     */
    focus: function() {
        if (tachyon.modals.length == 0) {
            return document.getElementById('main');
        } else {
            return tachyon.modals[tachyon.modals.length - 1];
        }
    },

    /*
     * Close window / modal
     */
    closeWindow: function() {
        tachyon.cleanup();
        if (tachyon.modals.length == 0) {
            tachyon.cleanup(document.getElementById('main'));
            tachyon.navClearActiveLinks()
        } else {
            if (tachyon.modals.length == 1) {
                tachyon.getElementByTagName('body').style=""
            }

            var modal = tachyon.modals.pop();
            modal.parentNode.parentNode.removeChild(modal.parentNode);

            tachyon.datatableReload();
        }
    },

    /*
     * Close all modals
     */
    closeWindows: function() {
        if (tachyon.modals.length == 1) {
            tachyon.getElementByTagName('body').style="";
        }

        while (tachyon.modals.length > 0) {
            tachyon.cleanup();

            var modal = tachyon.modals.pop();
            modal.parentNode.parentNode.removeChild(modal.parentNode);
        }

        tachyon.datatableReload();
    },

    /*
     * Close all 
     */
    closeAll: function() {
        if (tachyon.modals.length == 1) {
            tachyon.getElementByTagName('body').style="";
        }

        while (tachyon.modals.length > 0) {
            tachyon.cleanup();
            var modal = tachyon.modals.pop();
            modal.parentNode.parentNode.removeChild(modal.parentNode);
        }
        tachyon.cleanup(document.getElementById('main'));
        tachyon.cleanup(document.getElementById('header'));
        tachyon.cleanup(document.getElementById('sidebar'));
    },

    redirect: function(site) {
        window.location.href = site;
    },

    /*
     * AJAX query with callback.
     */
    ajaxQuery: function(method, url, success, error, form, xmldoc, raw, content_type) {
        tachyon.loading();
        $('html, body').animate({ scrollTop: 0 }, 'fast');
        if (typeof(raw) !== 'undefined' && raw != null) {
            submit = raw;
            pd = false;
            if (typeof(content_type) !== 'undefined' && content_type != null) {
                ct = content_type;
            } else {
                ct = 'application/json; charset=utf-8';
            }
        } else if (tachyon.isNode(xmldoc)) {
            var serializer = new XMLSerializer();
            submit = serializer.serializeToString(xmldoc);
            pd = false;
            ct = 'application/xml; charset=utf-8';
        } else if (typeof(form) !== 'undefined' && form != null) {
            inputs = form.getElementsByTagName('input');
            for (a = 0; a < inputs.length; a++) {
                if ('boolean' in inputs[a].dataset) {
                    if (inputs[a].type == 'checkbox') {
                        checkbox = $(inputs[a]);
                        if(!(checkbox.is(':checked'))) {
                            checkbox.after().append(checkbox.clone().attr({type:'hidden', value:'False', class:'photonic-checkbox'}));
                        }
                    }
                }
            }
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
                if (typeof(success) !== 'undefined' && success != null) {
                    success(result);
                } else if (typeof(form) !== 'undefined' && form != null) {
                    if ('msg' in form.dataset) {
                        tachyon.notice(form.dataset.msg, 'success');
                    }
                }
            },
            error: function(event, XMLHttpRequest, settings, thrownError) {
                if (typeof(error) !== 'undefined' && error != null) {
                    error(event, XMLHttpRequest, settings, thrownError);
                }

            },
            complete: function() {
               tachyon.doneLoading();
            }   
        }); 
    },

    registerCleanup: function(func, root) {
        if (typeof(root) !== 'undefined' && root != null) {
            var current = root;
        } else {
            var current = tachyon.focus();
        }
        tachyon.cleanups[current.id].push(func);
    },

    cleanup: function(root) {
        if (typeof(root) !== 'undefined' && root != null) {
            var current = root;
        } else {
            var current = tachyon.focus();
        }

        clean = tachyon.cleanups[current.id];
        for (zz = 0; zz < clean.length; zz++) {
            clean[zz]();
        }
        tachyon.cleanups[current.id] = []
        current.innerHTML = '';
    },

    /*
     * Set Inner HTML
     */
    loadHtml: function(content) {
        tachyon.cleanup();
        view_section = tachyon.focus();
        view_section.innerHTML = content;
        scripts = view_section.getElementsByTagName('script')
        for (i = 0; i < scripts.length; i++) {
            eval(scripts[i].innerHTML); 
        }   
        $(view_section).animate({ scrollTop: 0 }, 'fast');
        tachyon.datatableReload();
        tachyon.ajax(tachyon.focus());
        tachyon.modalDRag(tachyon.focus());
    },

    /*
     * Set Inner HTML
     */
    loadSection: function(content, element) {
        element.innerHTML = content;
        scripts = element.getElementsByTagName('script')
        for (i = 0; i < scripts.length; i++) {
            eval(scripts[i].innerHTML); 
        }   
        tachyon.ajax(element);
    },

    /*
     * Bootstrap new Modal
     */
    loadModal: function(content) {
        new_modal = tachyon.modal(content)
        scripts = new_modal.getElementsByTagName('script')
        for (i = 0; i < scripts.length; i++) {
            eval(scripts[i].innerHTML); 
        }
        tachyon.ajax(tachyon.focus());
    },

    nowTimestamp: function() {
        return(Math.floor(Date.now() / 1000));
    },

    setCookie: function(cname, cvalue, exdays) {
        var site = tachyon.app
        if (site == null || site == '') {
            site = '/';
        }
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        cvalue = btoa(cvalue);
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=" + site + ';domain=' + window.location.hostname;
    },

    getCookie: function(cname) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(';');
      for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return atob(c.substring(name.length, c.length));
        }
      }
      return null;
    },

    session: function(content, login) {
        var current = tachyon.getCookie('tachyonLogin');
        if (current != null) {
            try {
                var cookie = JSON.parse(current);
            } catch(err) {
                tachyon.error('Session cookie was corrupted.');
                var cookie = {};
            }

        } else {
            var cookie = {};
        }

        if ('token' in content && content.token != null) {
            if (login == true) {
                sessionStorage.setItem("loginat", tachyon.nowTimestamp());
                sessionStorage.setItem("token", content.token);
                cookie['token'] = content.token;
                cookie['loginat'] = tachyon.nowTimestamp();
            }
            cookie['scoped_token'] = content.token;
            sessionStorage.setItem("scoped_token", content.token);
        }

        if ('region' in content && content.region != null) {
            sessionStorage.setItem("region", content.region);
            cookie['region'] = content.region;
        } else {
            cookie['region'] = null;
        }

        if ('domain' in content && content.domain != null) {
            sessionStorage.setItem("domain", content.domain);
            cookie['domain'] = content.domain;
        } else if (login == false) {
            sessionStorage.removeItem("domain");
            cookie['domain'] = null;
        }

        if ('tenant_id' in content && content.tenant_id != null) {
            sessionStorage.setItem("tenant_id", content.tenant_id);
            cookie['tenant_id'] = content.tenant_id;
        } else if (login == false) {
            sessionStorage.removeItem("tenant_id");
            cookie['tenant_id'] = null;
        }
            
        cookie = JSON.stringify(cookie);
        tachyon.setCookie('tachyonLogin', cookie, 365);
    },

    updateToken: function(init) {
        var tachyonLogin = tachyon.getCookie('tachyonLogin');

        if (tachyonLogin != null) {
            try {
                var cookie = JSON.parse(tachyonLogin);
            } catch(err) {
                tachyon.error('<B>Session cookie was corrupted.</B>');
                var cookie = {};
                tachyon.setCookie('tachyonLogin', '{}', 365);
            }
        } else {
            var cookie = {};
        }
        if ('token' in cookie) {
            var sessionForTokenItems = ['token', 'domain', 'loginat', 'region', 'scoped_token', 'tenant_id'];

            for (var i = 0; i < sessionForTokenItems.length; i++) {
                value = sessionStorage.getItem(sessionForTokenItems[i])
                if (value != null) {
                    cookie[sessionForTokenItems[i]] = value;
                } else {
                    delete cookie[sessionForTokenItems[i]];
                }
            }
        }
        cookie = JSON.stringify(cookie);
        tachyon.setCookie('tachyonLogin', cookie, 365);
    },

    initSession: function(init) {
        var init = typeof init !== 'undefined' ? init : false;
        var tachyonLogin = tachyon.getCookie('tachyonLogin');

        if (tachyonLogin != null) {
            try {
                var cookie = JSON.parse(tachyonLogin);
            } catch(err) {
                tachyon.error('<B>Session cookie was corrupted.</B>');
                var cookie = {};
                tachyon.setCookie('tachyonLogin', '{}', 365);
            }
        } else {
            var cookie = {};
        }

        if (sessionStorage.getItem('token') != null) {
            if (!(('token' in cookie))) {
                sessionStorage.clear();
                if (init == false) {
                    tachyon.warning('<B>Session logout or expired.</B>');
                }
                tachyon.initWindow(tachyon.app + '/');
                return(false);
            } else if (init == true) {
                tachyon.initWindow();
                return(false);
            }
        } else {
            if ('token' in cookie) {
                tachyon.session(cookie, true);
                tachyon.success('<B>New session for window.</B>');
                if (init == false) {
                    tachyon.initWindow();
                    return(false);
                }
            }
        }
        return(true);
    },

    reToken: function() {
        var login_request = sessionStorage.getItem('login_request');
        var loginat = sessionStorage.getItem("loginat");
        if (login_request != null) {
            if ((tachyon.nowTimestamp() - parseInt(loginat, 10)) >= (tachyon.reTokenTime * 60)) {
                var login_request = atob(sessionStorage.getItem('login_request'));
                var tenant_id = sessionStorage.getItem("tenant_id");
                var domain = sessionStorage.getItem("domain");
                var region = sessionStorage.getItem("region");
                tachyon.ajaxQuery('post',
                                  tachyon.app + '/login',
                                  function(content) {
                                      tachyon.session(content, true);
                                      var scope = { tenant_id: tenant_id,
                                                    domain: domain}
                                      json = JSON.stringify(scope);
                                      tachyon.ajaxQuery('post',
                                                        tachyon.app + '/scope',
                                                        function(content) {
                                                            tachyon.session(content, false);
                                                            tachyon.success('Session extended ' + tachyon.reTokenTime + ' minutes.');
                                                        },
                                                        function() {
                                                            tachyon.logout();
                                                        },
                                                        null,
                                                        null,
                                                        json);
                                  },
                                  function() {
                                    tachyon.logout();
                                  },
                                  null,
                                  null,
                                  login_request);
            }
        }
    },

    login: function(content) {
        tachyon.session(content, true);
        tachyon.initWindow();
    },

    scope: function(content) {
        tachyon.session(content, false);
        tachyon.initWindow();
    },

    logout: function(content) {
        tachyon.setCookie('tachyonLogin', '{}', 365);
        sessionStorage.clear();
        tachyon.initWindow(req.app + '/');
        tachyon.success('Session logout.');
    },

    initWindow: function(url) {
        var url = typeof url !== 'undefined' ? url : window.location.href;
        tachyon.loading();
        tachyon.closeAll();
        tachyon.ajaxQuery('get', tachyon.app + '/sidebar',
            function(content) {
                tachyon.loadSection(content,
                                     document.getElementById('sidebar'));
                tachyon.registerEvent('nav', 'a', 'click', tachyon.setNavActiveLink);
                tachyon.registerEvent('nav', 'a', 'click', tachyon.navToggleDropdown, 'dropdown');
                tachyon.registerEvent('sidebar', 'input', 'input', tachyon.navSearch, 'search-nav');
                tachyon.initNavActiveLink();
            });
        tachyon.ajaxQuery('get', tachyon.app + '/header',
            function(content) {
                tachyon.loadSection(content,
                                     tachyon.getElementByTagName('header'));
            });
        tachyon.ajaxQuery('get', url,
            function(content) { 
                tachyon.loadSection(content, tachyon.focus());
            });
    },

    /*
     * Link Handler triggered by event.
     */
    linkHandler: function(e, element) {
        // IE Compatible.... just in case..
        e = e || window.event;

        if (typeof(element) == 'undefined') {
            element = e.target || e.srcElement;
            if (element.nodeType == 3) element = element.parentNode; // defeat Safari bug
        }

        form = document.getElementById(element.dataset.form);
        if (element.href != window.location + '#' && !element.href.endsWith("#")) {
            url = element.href;
        } else if ('form' in element.dataset) {
            url = form.action;
        } else {
            url = null;
        }

        if (!('noAjax' in element.dataset)) {
            if ('confirm' in element.dataset) {
                e.preventDefault();
                confirm = '<h1>Please confirm?</h1>';
                confirm += '<div class="confirm">';
                confirm += element.dataset.confirm;
                confirm += '</div>';
                confirm += '<div class="buttons">';
                confirm += '<a href="#" onclick="tachyon.closeWindow()" class="btn">Cancel</a>'
                confirm += '<a href="' + element.href + '" class="btn btn-danger"'
                for (option in element.dataset) {
                    if (option != 'confirm') {
                        confirm += "data-" + option + '="' + element.dataset[option] + '"';
                    }
                }
                confirm += '>Continue</a>'
                confirm += '</div>';
                tachyon.loadModal(confirm);
            } else {
                nav = tachyon.getElementByTagName('nav')
                if (element.href.endsWith("#")) {
                    $('html, body').animate({ scrollTop: 0 }, 'fast');
                }
                if (!'form' in element.dataset) {
                    form = null;
                }

                var success = function(content) {
                    if ('closeAll' in element.dataset) {
                        tachyon.closeWindows();
                    }
                    if ('closeall' in element.dataset) {
                        tachyon.closeWindows();
                    }
                    if ('close' in element.dataset) {
                        tachyon.closeWindow();
                    }
                    if ('modal' in element.dataset) {
                        if ((!typeof content === 'undefined' || content != null) && content.trim() != '') {
                            tachyon.loadModal(content);
                        } else {
                            tachyon.log('No content for modal');
                        }
                    } else {
                        if ((!typeof content === 'undefined' || content != null) && content.trim() != '') {
                            tachyon.loadHtml(content);
                        }
                    }
                }

                if ('logout' in element.dataset) {
                    tachyon.logout();
                    e.preventDefault();
                } else if (url != null) {
                    tachyon.clearNavSearch(element);
                    if (form != null && 'noAjax' in form.dataset) {
                        tachyon.ajaxQuery('get', element.href, success, null, null);
                        tachyon.formHandler(e, form);
                    } else {
                        tachyon.ajaxQuery('get', element.href, success, null, form);
                    }

                    if (window.innerWidth <= 900) {
                        document.getElementById('sidebar').style.display = "none";
                    }
                    e.preventDefault();
                } else {
                    success();
                    e.preventDefault();
                }
            }
        } else {
            if ('form' in element.dataset) {
                form = document.getElementById(element.dataset.form);
                form.target="_blank";

                if (form.action == window.location + '#' || form.action.endsWith("#")) {
                    form.action = url;
                }

                tachyon.formHandler(e, form);
                if ('closeAll' in element.dataset) {
                    tachyon.closeWindows();
                }
                if ('closeall' in element.dataset) {
                    tachyon.closeWindows();
                }
                if ('close' in element.dataset) {
                    tachyon.closeWindow();
                }
                e.preventDefault();
            } else {
                element.target="_blank";
            }
            
        }
    },

    /*
     * Form Handler triggered by event.
     */
    formHandler: function(e, element) {
        // IE Compatible.... just incase..
        e = e || window.event;
        if (typeof(element) == 'undefined') {
            element = e.target || e.srcElement;
            if (element.nodeType == 3) element = element.parentNode; // defeat Safari bug
        }

        if (!('noAjax' in element.dataset)) {
            if ('reload' in element.dataset) {
                tachyon.ajaxQuery('post', element.action, tachyon.reload, null, element);
            } else if ('datatable' in element.dataset) {
                tachyon.ajaxQuery('post', element.action, tachyon.datatableReload, null, element);
            } else if ('redirect' in element.dataset) {
                tachyon.ajaxQuery('post', element.action,
                    function () {
                        tachyon.redirect(element.dataset.redirect);
                    },
                    null,
                    element);
            } else if ('api' in element.dataset) {
                json = tachyon.jsonForm(element);
                if ((!(element.dataset['api'] == '' || element.dataset['api'] == null)) && (!(element.dataset['api'] in tachyon))) {
                    tachyon.log('form data-api tachyon.' + element.dataset['api'] + ' handler not found!');
                }
                tachyon.ajaxQuery('post', element.action, tachyon[element.dataset['api']], null, null, null, json);
            } else if ('login' in element.dataset) {
                var json = tachyon.jsonForm(element);
                var loginForm = JSON.parse(json)
                if ('username' in loginForm && loginForm.username != null) {
                    localStorage.setItem("tachyonic_username", loginForm.username);
                }
                if ('domain' in loginForm && loginForm.domain != null) {
                    localStorage.setItem("tachyonic_domain", loginForm.domain);
                } else {
                    localStorage.removeItem('tachyonic_domain');
                }

                if ('region' in loginForm && loginForm.region != null) {
                    localStorage.setItem("tachyonic_region", loginForm.region);
                } else {
                    localStorage.removeItem('tachyonic_region');
                }

                if ('extend' in loginForm) {
                    sessionStorage.setItem('login_request', btoa(json));
                }
                tachyon.ajaxQuery('post', tachyon.app + '/login', tachyon.login, null, null, null, json);
            } else {
                var success = function(content) {
                    if ('closeAll' in element.dataset) {
                        tachyon.closeWindows();
                    }
                    if ('closeall' in element.dataset) {
                        tachyon.closeWindows();
                    }
                    if ('close' in element.dataset) {
                        tachyon.closeWindow();
                    }
                    if ('modal' in element.dataset) {
                        if ((!typeof content === 'undefined' || content != null) && content.trim() != '') {
                            tachyon.loadModal(content);
                        } else {
                            tachyon.log('No content for modal');
                        }
                    } else {
                        if ((!typeof content === 'undefined' || content != null) && content.trim() != '') {
                            tachyon.loadHtml(content);
                        }
                    }
                }
                tachyon.ajaxQuery('post', element.action, success, null, element);
            }

            if (window.innerWidth <= 900) {
                document.getElementById('sidebar').style.display = "none";
            }
            e.preventDefault();
        } else {
            if ('closeAll' in element.dataset) {
                tachyon.closeWindows();
            }
            if ('closeall' in element.dataset) {
                tachyon.closeWindows();
            }
            if ('close' in element.dataset) {
                tachyon.closeWindow();
            }
            element.target="_blank";
            element.submit();
            e.preventDefault();
        }
    },

    /*
     * Display Loading
     */
    loading: function() {
        var display = document.getElementById('loading').style.display;
        if (display == "none" || display == "")
        {
            document.getElementById('loading').style.display = 'block';
        }
    },

    /*
     * Remove Loading
     */
    doneLoading: function() {
        document.getElementById('loading').style.display = "none";
    },


    /*
     * Function to turn a select into select2
     */
    select: function(root, element) {
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
                    tachyon.log('Select API responded with error!');
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

        function select2_urlhelper(element) {
            data = element.dataset;

            endpoint = "";

            if ('text' in data) {
                var text_field = data.text;
            } else {
                var text_field = 'name';
            }

            if ('endpoint' in data) {
                var endpoint = "&endpoint=" + data.endpoint;
            }

            if ('searchField' in data) {
                var search_field = data.searchField;
            } else {
                var search_field = text_field;
            }
            return tachyon.app + "/apiproxy?url=" + data.url + '&search_field=' + search_field + endpoint
        }


        config = {}
        data = element.dataset;
        if ('noAjax' in data) {
            return;
        }

        if ('id' in data) {
            var id_field = data.id;
        } else {
            var id_field = 'id';
        }

        if ('text' in data) {
            var text_field = data.text;
        } else {
            var text_field = 'name';
        }

        if ('searchField' in data) {
            var search_field = data.searchField;
        } else {
            var search_field = text_field;
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

        if ('tags' in data) {
            config.tags = (data.tags == 'true');
        }

        select2ProcessResults = genS2ProcessFunc(id_field, text_field);

        endpoint = "";

        if ('endpoint' in data) {
            endpoint = "&endpoint=" + data.endpoint;
        }

        if ('url' in data) {
            config.ajax = {
                dataType: "json",
                delay: 1000,
                processResults: select2ProcessResults,
                url: function () {
                    return select2_urlhelper(element);
                }
            }
        }
        element.dataset = {}

        $(element).select2(config);
        tachyon.registerCleanup(function() {
            $(element).select2("close");
        }, root);

    },

    /*
     * Function to turn a table into datatables
     */
    datatable: function(root, element) {
        /*
         * Internal function MRender for DataTables.
         */
        function mrenderLink(href, css, title, dataset) {
            return function (data, type, row) {
                link = '<a href="' + tachyon.app + href + '/' + row.id + '"';
                link += ' onclick="tachyon.linkHandler(event, this)"';
                if (css != null) {
                    link += ' class="' + css + '"';
                }
                for (option in dataset) {
                    link += "data-" + option + '="' + dataset[option] + '"';
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

        var link = null;
        var config = {}
        var data = element.dataset;
        if ('noAjax' in data) {
            return;
        }

        if (window.innerHeight > 550) {
            config.pageLength = 10;
        } else {
            config.pageLength = 5;
        }
        config.lengthMenu = [[5, 10, 25, 50], [5, 10, 25, 50]];

        var table_columns = element.getElementsByTagName('th');
        if (table_columns.length == 0) {
            tachyon.log('DataTable expecting <th> in <thead>!');
            return;
        }
        config.drawCallback = function( settings ) {
            feather.replace();
        }
        if ('url' in data) {
            endpoint = "";
            if ('endpoint' in data) {
                endpoint = "&endpoint=" + data.endpoint;
            }
            config.on = {
                'error.dt': function ( e, settings, techNote, message ) {
                    tachyon.log('An error has been reported by DataTables (' + message + ')');
                }
            }
            config.searchDelay = 1000;
            config.ajax = {
                url: tachyon.app + "/apiproxy?url=" + data.url + endpoint,
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

                        config.columns.push({ "mRender": mrenderLink(href, css, title, table_columns[i].dataset) })
                    } else if ('tick' in table_columns[i].dataset) {
                        if ('css' in table_columns[i].dataset) {
                            css = table_columns[i].dataset.css
                        } else {
                            css = null;
                        }
                        if (element.id == '' || element.id == null) {
                            tachyon.log("DataTable expecting 'id' on <table> when using tick/checkbox. The 'id' is used as the <input> 'name'!");
                            return; 
                        }

                        config.columnDefs.push( { "searchable": false, "width": "2rem", "orderable": false, "className": "text-center", "targets": i } );

                        config.columns.push({ "mRender": mrenderTick(element.id, css)});
                    } else {
                        tachyon.log("DataTable expecting 'data-href' for link or 'data-tick' for tick box on custom column <th>!");
                        return;
                    }
                }
                
            }
            if (config.columns.length == 0) {
                tachyon.log("Datatable expecting atleast one column <th>!");
                return;
            }
        }
        $(element).on('error.dt', function(e, settings, techNote, message) {
           tachyon.log('An error has been reported by DataTables (' + message + ')');
        });
        dt = $(element).DataTable(config);
        tachyon.registerCleanup(dt.destroy, root);
    },

	visible: function(){
		var stateKey, 
			eventKey, 
			keys = {
					hidden: "visibilitychange",
					webkitHidden: "webkitvisibilitychange",
					mozHidden: "mozvisibilitychange",
					msHidden: "msvisibilitychange"
		};
		for (stateKey in keys) {
			if (stateKey in document) {
				eventKey = keys[stateKey];
				break;
			}
		}
		return function(c) {
			if (c) document.addEventListener(eventKey, c);
			return !document[stateKey];
		}
	},

    /*
     * AJAX Init
     */
    ajax: function(element) {
        tachyon.registerEvent(element, 'a', 'click', tachyon.linkHandler);
        tachyon.registerEvent(element, 'form', 'submit', tachyon.formHandler);

        var selects = element.getElementsByTagName('select');
        for (var i = 0; i < selects.length; i++) {
            tachyon.select(element, selects[i]);
        }

        var tables = element.getElementsByTagName('table');
        for (var j = 0; j < tables.length; j++) {
            tachyon.datatable(element, tables[j]);
        }

        var divs = element.getElementsByTagName('div');
        for (var j = 0; j < divs.length; j++) {
            dataset = divs[j].dataset;
            if ('url' in dataset) {
                url = dataset.url;
            } else {
                url = null;
            }

            // Rendering types..
            if ('graph' in dataset) {
                tachyon.graph(dataset['graph'], url, divs[j]);
            }
        }
        feather.replace();
    },

    /* 
     * Reload Datatable
     */
    datatableAdjust: function() {
        $.fn.dataTable
            .tables( { visible: true, api: true } )
            .columns.adjust().draw();
    },
    datatableReload: function() {
        $.fn.dataTable
            .tables( { visible: true, api: true } )
            .ajax.reload(tachyon.datatableAdjust, false );
    },

    /*
     * Draw graph
     */
    graph: function(config, url, element) {
        var editor = null;

        try
        {
            if (!mxClient.isBrowserSupported())
            {
                mxUtils.error('Browser is not supported!', 200, false);
            }
            else
            {
                mxObjectCodec.allowEval = true;
                var configDoc = mxUtils.load(config);
                var config = configDoc.getDocumentElement();
                editor = new mxEditor();
                // Set Toolbar Container does not work.... 
                // using code to override in tachyon.init
                // editor.setToolbarContainer(tachyon.focus());
                editor.setGraphContainer(element);
                editor.configure(config);
                mxObjectCodec.allowEval = false;
                
                // Adds active border for panning inside the container
                editor.graph.createPanningManager = function()
                {
                    var pm = new mxPanningManager(this);
                    pm.border = 30;
                    
                    return pm;
                };


                editor.graph.allowAutoPanning = true;
                editor.graph.timerAutoScroll = true;

                // Rules for bpmn Nodes
                editor.graph.multiplicities.push(new mxMultiplicity(
                  false, 'task', null, null, 0, 1, ['error', 'task', 'fork', 'event'],
                  '<B>Task:</B> only one source permitted.',
                  '<B>Task:</B> only <I>Start Event Start/Task/Fork/Error</I> sources permitted.'));

                editor.graph.multiplicities.push(new mxMultiplicityMax(
                  'task', 1, ['error'],
                  '<B>Task:</B> only one of <I>Error</I> target permitted.'));

                editor.graph.multiplicities.push(new mxMultiplicityMax(
                  'task', 1, ['task', 'fork', 'eventend', 'merge'],
                  '<B>Task:</B> only one of <I>Task/Fork/Event End/Merge</I> target permitted.'));

                editor.graph.multiplicities.push(new mxMultiplicity(
                  true, 'task', null, null, null, null, ['error', 'task', 'fork', 'eventend', 'merge'],
                  null,
                  '<B>Task:</B> only <I>Task/Fork/End/Merge/Error/Event End</I> targets permitted.'));

                editor.graph.multiplicities.push(new mxMultiplicity(
                  true, 'error', null, null, 0, 1, ['task', 'eventend', 'fork'],
                  '<B>Error:</B> only one target permitted',
                  '<B>Error:</B> only one of <I>Task/Fork/Event End</I> target permitted.'));

                editor.graph.multiplicities.push(new mxMultiplicity(
                  true, 'event', null, null, 0, 1, ['task', 'fork'],
                  '<B>Event start:</B> only one target permitted.',
                  '<B>Event start:</B> only <I>Task/Fork</I> target permitted.'));

                editor.graph.multiplicities.push(new mxMultiplicity(
                  false, 'merge', null, null, null, null, ['task'],
                  null,
                  '<B>Merge:</B>: only <I>Task</I> source permitted.'));

                editor.graph.multiplicities.push(new mxMultiplicity(
                  false, 'event', null, null, null, null, [],
                  null,
                  '<B>Event start:</B> no sources permitted.'));

                editor.graph.multiplicities.push(new mxMultiplicity(
                  false, 'fork', null, null, null, null, ['event', 'task', 'merge'],
                  null,
                  '<B>Fork:</B> only <I>Event Start/Task/Merge</I> source permitted.'));

                editor.graph.multiplicities.push(new mxMultiplicity(
                  true, 'fork', null, null, null, null, ['task'],
                  null,
                  '<B>Fork:</B> only <I>Task</I> target permitted.'));

                editor.graph.multiplicities.push(new mxMultiplicity(
                  true, 'merge', null, null, 0, null, ['task', 'fork', 'eventend'],
                  null,
                  '<B>Merge:</B> only <I>Task/Fork/Event End</I> target permitted.'));

                editor.graph.multiplicities.push(new mxMultiplicity(
                  true, 'eventend', null, null, 0, 0, [],
                  '<B>Event End:</B> no targets permitted',
                  '<B>Event End:</B> no targets permitted'));

                //editor.open(url);
                tachyon.ajaxQuery('GET', url,
                           function (result, textStatus, XMLHttpRequest) {
                                var parser = new DOMParser();
                                var xmlDoc = parser.parseFromString(result,
                                    "text/xml"); 
                                editor.readGraphModel(xmlDoc.documentElement);
                                editor.graph.model.addListener(mxEvent.CHANGE, function(sender, evt)
                                {
                                  var nodes = [];
                                  var codec = new mxCodec();
                                  var changes = evt.getProperty('edit').changes;
                                  var xmlString = "<changes></changes>";
                                  var parser = new DOMParser();
                                  var xmlDoc = parser.parseFromString(xmlString, "text/xml"); 
                                  var update = xmlDoc.getElementsByTagName('changes');
                                  for (var i = 0; i < changes.length; i++)
                                  {
                                      update[0].appendChild(codec.encode(changes[i]));
                                  }
                                  tachyon.ajaxQuery('PUT', url, null, null, null, xmlDoc);
                                });
                           });
            }
        }
        catch (e)
        {
            // Shows an error message if the editor cannot start
            tachyon.log('MXGraph cannot start (' + e.message + ')');
            throw e; // for debugging
        }

        tachyon.registerCleanup(editor.destroy);
        return editor;
    },

    /*
     * Toggle NAV Dropdown
     */
    navToggleDropdown: function(e, element) {
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
    },

    /*
     * Set all links unactive
     */
    navRemoveActiveLinks: function(clicked_a) {
        nav = tachyon.getElementByTagName('nav');
        if (nav.contains(clicked_a)) {
            links = nav.getElementsByTagName("a"); 
            for (z=0; z < links.length; z++){
                if (links[z].className == 'active') {
                    links[z].className = '';
                }
            }
        }
    },

    /*
     * Display parent ul for link
     */
    navViewParentDropDowns: function(element) {
        parent = element.parentElement;
        if (parent.nodeName != 'NAV') {
            if (parent.nodeName == 'UL') {
                parent.style.display = 'block';
            }
            if (parent.nodeName == 'LI') {
                parent.style.display = 'block';
            }
            tachyon.navViewParentDropDowns(parent)
        }
    },

    /*
     * Clear active links
     */
    navClearActiveLinks: function() {
        nav = tachyon.getElementByTagName('nav');
        links = nav.getElementsByTagName("a"); 
        for (z=0; z < links.length; z++){
            links[z].style.display = 'block';
            links[z].className = '';
        }
    },

    setNavActiveLink: function(e, element) {
        tachyon.navRemoveActiveLinks(element); 
        element.className = 'active';
    },

    initNavActiveLink: function() {
        nav = tachyon.getElementByTagName('nav');
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
                tachyon.navViewParentDropDowns(links[z]);
            }    
        }    
    },

    /*
     * Navigation Search triggered by event.
     */
    navSearch: function(e, element) {
        navmenu = tachyon.getElementByTagName('nav');
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
                        tachyon.navViewParentDropDowns(links[a]);
                    }
                }
            }
        }
    },

    clearNavSearch: function(e) {
        navmenu = tachyon.getElementByTagName('nav');
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
    },

    jsonForm: function(form) {
        object = {}
        var inputs = form.getElementsByTagName("input"); 
        var selects = form.getElementsByTagName("select"); 

        function append(elements) {
            for (var i = 0; i < elements.length; i++){
                if (elements[i].type == 'checkbox') {
                    if (elements[i].checked == true) {
                        object[elements[i].name] = value;
                    }
                } else {
                    if (elements[i].value == "") {
                        value = null;
                    } else {
                        value = elements[i].value;
                    }
                    object[elements[i].name] = value;
                }
            }
        }

        append(inputs);
        append(selects);
        return(JSON.stringify(object));
    },

    onChange: function(evt, element) {
        tachyon.formHandler(evt, element);
    }
}

// Deprecated use functions now under tachyon
// Please update your code! for future.
var close_window = tachyon.closeWindow
var close_windows = tachyon.closeWindows
