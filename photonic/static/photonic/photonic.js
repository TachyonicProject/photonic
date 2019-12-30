/*
 * Copyright (c) 2018-2020 Christiaan Frans Rademan <chris@fwiw.co.za>.
 * All rights reserved.
 *
 * Copyright (c) 2018-2019 Dave Kruger.
 * All rights reserved.
 *
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * # Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 *
 * # Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * # Neither the name of the copyright holders nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * The Number.isInteger() function in JavaScript is used to check whether the
 * value passed to it is an integer or not. It returns true if the passed value
 * is an integer, otherwise it return false.
 */
Number.isInteger = Number.isInteger || function(value) {
    return typeof value === "number" && 
           isFinite(value) && 
           Math.floor(value) === value;
};

// Photonic Colors are list of colors availible to graphs for example.
var photonicColors = [
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
    '#6495ED'
]

/*
 * Jquery DateTime Picker to use Moment Timezone aware datetime.
 * https://momentjs.com/
 */
$.datetimepicker.setDateFormatter('moment');

/*
 * Function to Check if storage is supported.
 * Supported argument values sessionStorage and localStorage.
 * returns true or false.
 */
function isStorageSupported(storage) {
    try {
        const key = "__some_random_key_you_are_not_going_to_use__";
        storage.setItem(key, key);
        storage.removeItem(key);
        return true;
    } catch (e) {
        return false;
    }
}

/*
 * Custom MXGraph mxMultiplicity defines max connections to targets with the
 * error messages that they produce. To add or remove rules on a graph, you
 * must add/remove instances of this class to mxGraph.multiplicities.
 */
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

/*
 * Custom MXGraph function defines max specific symbols used within custom
 * mxGraphModel.prototype.add.
 */
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


var photonicInit = {
    init: function(app) {
        photonicDom.loading();
        if (app == '/') {
            photonic.app = '';
        } else {
            photonic.app = app;
        }

        photonic.colors = photonicUtils.colors;
        photonic.localize = photonicUtils.localize;
        photonic.tz = photonicUtils.timezone();
        photonic.getElement = photonicDom.getElement;
        photonic.getElementByTagName = photonicDom.getElementByTagName;
        photonic.loading = photonicDom.loading;
        photonic.doneLoading = photonicDom.doneLoading;
        photonic.registerEvent = photonicDom.registerEvent;
        photonic.registerCleanup = photonicWindows.registerCleanup;
        photonic.onChange = photonicDom.onChange;
        photonic.closeWindow = photonicWindows.closeWindow;
        photonic.closeWindows = photonicWindows.closeWindows;

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

        window.alert = function(message) {
            message = String(message);
            message = message.replace(/\n/gm, '<BR>');
            photonicNotice.error(message);
        }

        // MXGraph Global Configuration....
        mxUtils.alert = function (message) {
            message = message.trimRight('\n');
            message = message.replace(/\n/gm, '<BR>');
            photonicNotice.error("<B>Diagram Editor.</B><BR>" + message);
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
            curwindow = photonicWindows.focus();
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
                photonicNotice.warning('<B>Window session (token) has expired</B>');
                photonicSession.logout();
                photonicDom.initWindow(photonic.app + '/');
            } else {
                document.getElementById('loading').style.display = "none";
                if (XMLHttpRequest.status == 500) {
                    photonicNotice.error(XMLHttpRequest.responseText);
                } else {
                    if (XMLHttpRequest.responseText) {
                        photonicNotice.warning(XMLHttpRequest.responseText);
                    } else {
                        if (thrownError == 'parsererror') {
                            photonicNotice.UIError("AJAX: Parsing Response failed.");
                        } else if (thrownError == 'timeout') {
                            photonicNotice.UIError("AJAX: Request Timeout.");
                        } else if (thrownError == 'abort') {
                            photonicUtils.log("AJAX: Request was aborted by server.");
                        } else {
                            photonicNotice.UIError("AJAX: No response from server.");
                        }
                    }
                }
                $('.photonic-checkbox').remove();
                photonicDom.doneLoading();
            }
        });

        $.ajaxSetup({
            beforeSend: function(xhr) {
                photonicSession.headers(xhr, 'scoped');
            }
        });

        photonicDom.registerEvent('html', null, 'click', photonicSession.tjsl);
        photonicDom.registerEvent('html', null, 'contextmenu', photonicSession.tjsl);
        $(document).ready(function(){
            $('[data-toggle="tooltip"]').tooltip();
        });

        if (photonicSession.initSession(true)) {
            photonicDom.ajax(photonicDom.getElementByTagName('header'));
            photonicDom.ajax(document.getElementById('sidebar'));
            photonicDom.ajax(photonicWindows.focus());
            photonicDom.registerEvent('nav', 'a', 'click', photonicNav.setNavActiveLink);
            photonicDom.registerEvent('nav', 'a', 'click', photonicNav.navToggleDropdown, 'dropdown');
            photonicDom.registerEvent('sidebar', 'input', 'input', photonicNav.navSearch, 'search-nav');
            photonicNav.initNavActiveLink();
            photonicDom.doneLoading();
        }
        photonic.init = function() {
            photonicUtils.log('Cannot photonic.init() javascript again!');
        }
    }
}

var photonicWindows = {
    modals: [],
    cleanups: {"main": [], "sidebar": [], "header": []},

    /*
     * Create Modal
     */
    modal: function(content) {
        var modal = document.createElement('div');
        modal.className = "modal";
        var modal_window = document.createElement('div');
        modal_window.innerHTML = content;
        modal.appendChild(modal_window);
        photonicWindows.modalDrag(modal_window);

        if (photonicWindows.modals.length == 0) {
            photonicDom.getElementByTagName('body').appendChild(modal);
        } else {
            var last = photonicWindows.modals[photonicWindows.modals.length - 1].parentNode;
            photonicDom.insertAfter(modal, last)
        }

        modal_window.style.top = String(5 + photonicWindows.modals.length) + 'rem';
        modal_window.id = "model_" + photonicWindows.modals.length;
        photonicWindows.modals.push(modal_window);
        photonicWindows.cleanups[modal_window.id] = [];
        photonicDom.getElementByTagName('body').style="overflow: hidden";

        return modal_window;
    },

    /*
     * Make modal dragable
     */
    modalDrag: function(modal_window) {
        if (modal_window.firstElementChild.firstElementChild != null) {
            if (modal_window.firstElementChild.firstElementChild.nodeName == 'H1') {
                var heading = modal_window.firstElementChild.firstElementChild;
                photonicDom.drag(modal_window, heading);
            }
        }
    },

    /*
     * Get current focus
     */
    focus: function() {
        if (photonicWindows.modals.length == 0) {
            return document.getElementById('main');
        } else {
            return photonicWindows.modals[photonicWindows.modals.length - 1];
        }
    },

    /*
     * Close window / modal
     */
    closeWindow: function(qty) {
        var qty = typeof qty !== 'undefined' ? qty : 1;
        var qty = qty || 1;

        photonicWindows.closeWindows(qty);
    },

    /*
     * Close windows
     */
    closeWindows: function(qty) {
        photonicDom.loading();
        var qty = typeof qty !== 'undefined' ? qty : photonicWindows.modals.length + 1;
        var qty = qty || photonicWindows.modals.length + 1;

        for (var i = 0; i < qty; i++) {
            if (photonicWindows.modals.length == 0) {
                photonicWindows.cleanup(document.getElementById('main'));
                photonicNav.navClearActiveLinks();
                photonicDom.getElementByTagName('body').style="overflow: visible";
            } else {
                if (photonicWindows.modals.length == 1) {
                    photonicDom.getElementByTagName('body').style="overflow: visible";
                }
                photonicWindows.cleanup();
                var modal = photonicWindows.modals.pop();
                modal.parentNode.parentNode.removeChild(modal.parentNode);
            }
        }

        photonicDom.doneLoading();

    },

    /*
     * Close all 
     */
    closeAll: function() {
        if (photonicWindows.modals.length == 1) {
            photonicDom.getElementByTagName('body').style="overflow: visible";
        }

        while (photonicWindows.modals.length > 0) {
            photonicWindows.cleanup();
            var modal = photonicWindows.modals.pop();
            modal.parentNode.parentNode.removeChild(modal.parentNode);
        }
        photonicWindows.cleanup(document.getElementById('main'));
        photonicWindows.cleanup(document.getElementById('header'));
        photonicWindows.cleanup(document.getElementById('sidebar'));
    },

    /*
     * Set Inner HTML
     */
    loadHtml: function(content) {
        photonicWindows.cleanup();
        viewSection = photonicWindows.focus();
        viewSection.innerHTML = content;
        photonicDom.evalJS(viewSection);
        $(viewSection).animate({ scrollTop: 0 }, 'fast');
        photonicDom.ajax(photonicWindows.focus());
        photonicWindows.modalDrag(photonicWindows.focus());
    },

    /*
     * Set Inner HTML
     */
    loadSection: function(content, element) {
        element.innerHTML = content;
        photonicDom.evalJS(element);
        photonicDom.ajax(element);
    },

    /*
     * Bootstrap new Modal
     */
    loadModal: function(content) {
        newModal = photonicWindows.modal(content)
        photonicDom.evalJS(newModal);
        photonicDom.ajax(photonicWindows.focus());
        //photonicWindows.modalDrag(photonicWindows.focus());
    },

    registerCleanup: function(func, root) {
        if (typeof(root) !== 'undefined' && root != null) {
            var current = root;
        } else {
            var current = photonicWindows.focus();
        }
        photonicWindows.cleanups[current.id].push(func);
    },

    cleanup: function(root) {
        if (typeof(root) !== 'undefined' && root != null) {
            var current = root;
        } else {
            var current = photonicWindows.focus();
        }

        clean = photonicWindows.cleanups[current.id];
        for (zz = 0; zz < clean.length; zz++) {
            clean[zz]();
        }
        photonicWindows.cleanups[current.id] = []
        current.innerHTML = '';
    },
}

var photonicUtils = {
    /*
     * Log Debug output to console.
     */
    log: function(msg) {
        if (window.console) {
            window.console.log("Photonic: " + msg)
        }
    },

    /*
     * Reload Page
     */
    reload: function() {
        window.location.reload();
    },

    redirect: function(site) {
        window.location.href = site;
    },

    /*
     * Internal Callback Function Caller. (Use in the event of loops)
     */
    callfunc: function(callback, element) {
            return function(e){
                try {
                    callback(e, element);
                } catch (err) {
                    photonicNotice.JSError(err);
                    e.preventDefault();
                    photonicDom.doneLoading();
                    throw (err);
                }
            }
    },

    formatChartLabels: function(labels) {
        formatted = []
        for (var a = 0; a < labels.length; a++) {
            if (Number.isInteger(labels[a])) {
                formatted.push(photonicUtils.localize(labels[a]));
            } else {
                formatted.push(labels[a]);
            }
        }
        return formatted;
    },

    nowTimestamp: function() {
        return(Math.floor(Date.now() / 1000));
    },


    localize: function(datetime) {
        datetime = moment(datetime)
        if (datetime.isValid()) {
            return datetime.format('YYYY-MM-DD HH:mm:ss');
        }
        return('');

    },

    localizeEvent: function(datetime) {
        datetime = moment(datetime)
        if (datetime.isValid()) {
            return datetime.format('MMM DD, YYYY @ HH:mm:ss.SSS');
        }
        return('');

    },

    timezone: function() {
        return(moment.tz.guess());
    },

    colors: function(no) {
        no = no % photonicColors.length
        return photonicColors[no]
    }
}


var photonicDom = {
    evalJS: function(element) {
        scripts = element.getElementsByTagName('script')
        for (i = 0; i < scripts.length; i++) {
            try {
                eval(scripts[i].innerHTML); 
            } catch(err) {
                var errMsg = err + '\n';
                scriptLoc = element.id || element.tagName;
				if (typeof err.lineNumber !== 'undefined') {
                    errMsg = errMsg + 'Line: ' + err.lineNumber + ' ';
                }
                errMsg = errMsg + 'Location: ' + scriptLoc + '\n';
                photonicUtils.log(errMsg + String(scripts[i].innerHTML));
                errMsg = errMsg + 'View console log for more details.';
                errMsg = errMsg.replace(/\n/gm, '<BR>');
                photonicNotice.JSError(errMsg);
            }
        }
    },

    /* 
     * Register dom element toggle events.
     */
    registerEvent: function(root, tag, on, callback, event_name) {
        if ((typeof root) == 'string') {
            var root_node = photonicDom.getElement(root);
        } else {
            var root_node = root
        }
		if (tag != null) {
			var elems = root_node.getElementsByTagName(tag);

			for (i=0; i < elems.length; i++){
				var element = elems[i]
				if (typeof event_name === 'undefined') {
					element.addEventListener(on, photonicUtils.callfunc(callback, element));
				}
				else {
					if ('event' in elems[i].dataset) {
						if (element.dataset.event == event_name) {
							element.addEventListener(on, photonicUtils.callfunc(callback, element));
						}
					}
				}
			}
        } else {
            root_node.addEventListener(on, photonicUtils.callfunc(callback, root));
        }
    },

    isNode: function(o){
        return (
            typeof Node === "object" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
        );
    },

    isElement: function(o){
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
        );
    },

    /*
     * Get the Location of Element.
     */
    getLocation: function(element) {
        var _x = 0;
        var _y = 0;
        while( element && !isNaN( element.offsetLeft ) && !isNaN( element.offsetTop ) ) {
            _x += element.offsetLeft - element.scrollLeft;
            _y += element.offsetTop - elmenet.scrollTop;
            element = elment.offsetParent;
        }
        return { top: _y, left: _x };
    },

    /*
     * Get Element by Tag
     */
    getElementByTagName: function(tag, parentElement) {
        var parentElement = typeof parentElement !== 'undefined' ? parentElement : document;

        elements = parentElement.getElementsByTagName(tag);
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
     * Toggle Sidebar
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
     * AJAX query with callback.
     */
    ajaxQuery: function(method, url, success, error, form, xmldoc, raw, content_type, token) {
        photonicDom.loading();
        // Breaks logger scroll for yoshii. We should only scroll to top when calling new html.
        // $('html, body').animate({ scrollTop: 0 }, 'fast');
        if (typeof(raw) !== 'undefined' && raw != null) {
            submit = raw;
            pd = false;
            if (typeof(content_type) !== 'undefined' && content_type != null) {
                ct = content_type;
            } else {
                ct = 'application/json; charset=utf-8';
            }
        } else if (photonicDom.isNode(xmldoc)) {
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
            token: token,
            type: method,
            async: true,
            cache: false,
            context: document.body,
            contentType: ct, 
            processData: pd, 
            data: submit,
            beforeSend: function(xhr) {
                photonicSession.headers(xhr, token);
            },
            success: function(result, textStatus, XMLHttpRequest) {
                if (typeof(success) !== 'undefined' && success != null) {
                    success(result);
                } else if (typeof(form) !== 'undefined' && form != null) {
                    if ('msg' in form.dataset) {
                        photonicNotice.notice(form.dataset.msg, 'success');
                    }
                }
            },
            error: function(event, XMLHttpRequest, settings, thrownError) {
                if (typeof(error) !== 'undefined' && error != null) {
                    error(event, XMLHttpRequest, settings, thrownError);
                }

            },
            complete: function() {
               photonicDom.doneLoading();
            }   
        }); 
    },

    initWindow: function(url) {
        var url = typeof url !== 'undefined' ? url : window.location.href;
        photonicWindows.closeAll();
        photonicDom.ajaxQuery('get', photonic.app + '/header',
            function(content) {
                photonicWindows.loadSection(content,
                                     photonicDom.getElementByTagName('header'));
                photonicDom.ajaxQuery('get', photonic.app + '/sidebar',
                    function(content) {
                        photonicWindows.loadSection(content,
                                             document.getElementById('sidebar'));
                        photonicDom.registerEvent('nav', 'a', 'click', photonicNav.setNavActiveLink);
                        photonicDom.registerEvent('nav', 'a', 'click', photonicNav.navToggleDropdown, 'dropdown');
                        photonicDom.registerEvent('sidebar', 'input', 'input', photonicNav.navSearch, 'search-nav');
                        photonicNav.initNavActiveLink(url);
                        photonicDom.ajaxQuery('get', url,
                            function(content) { 
                                photonicWindows.loadSection(content, photonicWindows.focus());
                            });
                    });
            });
    },

    windowHandler: function(e, element) {
        if ('closeWindows' in element.dataset) {
            if (element.dataset.closeWindows == '') {
                qty = null;
            } else {
                qty = element.dataset.closeWindows;
            }
            photonicWindows.closeWindows(qty);
        }
        if ('closeWindow' in element.dataset) {
            if (element.dataset.close == '') {
                qty = null;
            } else {
                qty = element.dataset.closeWindow;
            }
            photonicWindows.closeWindow(qty);
        }
        if ('table' in element.dataset) {
            photonicDom.datatableReload()
        }
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
                confirm += '<a href="#" onclick="photonicWindows.closeWindow()" class="btn">Cancel</a>'
                confirm += '<a href="' + element.href + '" class="btn btn-danger"'
                for (option in element.dataset) {
                    setoption = option.replace(/[A-Z]/g,
                                               function(x) {
                                                return '-' + x.toLowerCase();
                                               }); 
                    if (option != 'confirm') {
                        confirm += "data-" + setoption + '="' + element.dataset[option] + '"';
                    }
                }
                confirm += '>Continue</a>'
                confirm += '</div>';
                photonicWindows.loadModal(confirm);
            } else {
                nav = photonicDom.getElementByTagName('nav')
                if (element.href.endsWith("#")) {
                    $('html, body').animate({ scrollTop: 0 }, 'fast');
                }
                if (!'form' in element.dataset) {
                    form = null;
                }

                var success = function(content) {
                    try {
                        photonicDom.windowHandler(e, element);
                        if ('modal' in element.dataset) {
                            if ((!typeof content === 'undefined' || content != null) && content.trim() != '') {
                                photonicWindows.loadModal(content);
                            } else {
                                photonicUtils.log('No content for modal');
                            }
                        } else {
                            if ((!typeof content === 'undefined' || content != null) && content.trim() != '') {
                                photonicWindows.loadHtml(content);
                            }
                        }
                    } catch(err) {
                        photonicNotice.JSError(err);
                        photonicDom.doneLoading();
                        throw(err);
                    }
                }

                if ('logout' in element.dataset) {
                    photonicSession.logout();
                    photonicNotice.success('<B>Session logout.</B>');
                    photonicDom.initWindow(photonic.app + '/');
                    e.preventDefault();
                } else if (url != null) {
                    photonicNav.navClearSearch(element);
                    if (form != null && 'noAjax' in form.dataset) {
                        photonicDom.ajaxQuery('get', element.href, success, null, null);
                        photonicDom.formHandler(e, form);
                    } else {
                        photonicDom.ajaxQuery('get', url, success, null, form);
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
            e.preventDefault();
        } else {
            if ('form' in element.dataset) {
                form = document.getElementById(element.dataset.form);
                form.target="_blank";

                if (form.action == window.location + '#' || form.action.endsWith("#")) {
                    form.action = url;
                }

                photonicDom.formHandler(e, form);
                photonicDom.windowHandler(e, element);
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

        if ('noSubmit' in element.dataset) {
            e.preventDefault();
        } else if (!('noAjax' in element.dataset)) {
            if ('reload' in element.dataset) {
                photonicDom.ajaxQuery('post', element.action, photonic.reload, null, element);
            } else if ('redirect' in element.dataset) {
                photonicDom.ajaxQuery('post', element.action,
                    function () {
                        photonic.redirect(element.dataset.redirect);
                    },
                    null,
                    element);
            } else if ('api' in element.dataset) {
                json = photonicDom.jsonForm(element);
                if ((!(element.dataset['api'] == '' || element.dataset['api'] == null)) && (!(element.dataset['api'] in photonicHandlers))) {
                    var err = 'form data-api photonicHandlers.' + element.dataset['api'] + ' handler not found!'

                    photonicNotice.UIError(err);
                    photonicUtils.log(err);
                }
                photonicDom.ajaxQuery('post', element.action, photonicHandlers[element.dataset['api']], null, null, null, json);
            } else if ('login' in element.dataset) {
                var login = photonicDom.objForm(element);
                if ('username' in login && login.username != null) {
                    localStorage.setItem("photonicic_username", login.username);
                }
                if ('domain' in login && login.domain != null) {
                    localStorage.setItem("photonicic_domain", login.domain);
                } else {
                    localStorage.removeItem('photonicic_domain');
                }
                if ('region' in login && login.region != null) {
                    localStorage.setItem("photonicic_region", login.region);
                    sessionStorage.setItem('region', login.region);
                } else {
                    localStorage.removeItem('photonicic_region');
                }
                var requestLogin = { username: login.username,
                                     domain: login.domain,
                                     credentials: {
                                         password: login.password
                                     }
                                   }
                requestLogin = JSON.stringify(requestLogin);
                photonicDom.ajaxQuery('post', photonic.app + '/apiproxy?url=/v1/token&endpoint=identity',
                                     photonicSession.login, null, null, null, requestLogin);
            } else if ('scope' in element.dataset) {
                var scope = photonicDom.objForm(element);
                photonicSession.scopeToken(scope.region, scope.domain, scope.tenant_id);
            } else {
                var success = function(content) {
                    photonicDom.windowHandler(e, element);
                    if ('modal' in element.dataset) {
                        if ((!typeof content === 'undefined' || content != null) && content.trim() != '') {
                            photonicWindows.loadModal(content);
                        } else {
                            photonicUtils.log('No content for modal');
                        }
                    } else {
                        if ((!typeof content === 'undefined' || content != null) && content.trim() != '') {
                            photonicWindows.loadHtml(content);
                        }
                    }
                }
                photonicDom.ajaxQuery('post', element.action, success, null, element);
            }

            if (window.innerWidth <= 900) {
                document.getElementById('sidebar').style.display = "none";
            }
            e.preventDefault();
        } else {
            photonicDom.windowHandler(e, element);
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
                    photonicUtils.log('Select API responded with error!');
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
            return photonic.app + "/apiproxy?url=" + data.url + '&search_field=' + search_field + endpoint
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
            config.tags = true;
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

        if ('selectValue' in data) {
            var selectValue = data.selectValue;
            if (!('selectName' in data)) {
                var selectName = data.selectValue;
            } else {
                var selectName = data.selectName;
            }
            var o = new Option(selectValue, selectName);
            $(o).html(selectName);
            $(o).attr('value', selectValue);
            $(element).append(o);
        }

        photonicWindows.registerCleanup(function() {
            $(element).select2("close");
        }, root);

    },

    /*
     * Function to turn a table into datatables
     */
    datatable: function(root, element) {
        // Short circuit if graph
        if ('graph' in element.dataset) {
            return null;
        }
        /*
         * Internal function MRender for DataTables.
         */
        function mrenderLink(href, css, title, dataset) {
            return function (data, type, row) {
                link = '<a href="' + photonic.app + href + '/' + row.id + '"';
                link += ' onclick="photonicDom.linkHandler(event, this)"';
                if (css != null) {
                    link += ' class="' + css + '"';
                }
                for (option in dataset) {
                    setoption = option.replace(/[A-Z]/g,
                        function(x) {
                            return '-' + x.toLowerCase();
                        });
                    link += "data-" + setoption + '="' + dataset[option] + '"';
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
            photonicUtils.log('DataTable expecting <th> in <thead>!');
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
                    photonicUtils.log('An error has been reported by DataTables (' + message + ')');
                }
            }
            config.searchDelay = 1000;
            config.ajax = {
                url: photonic.app + "/apiproxy?url=" + data.url + endpoint,
                dataSrc: function (json) {
                    json.recordsTotal = json.metadata.records;
                    json.recordsFiltered = json.metadata.records;
                    headers = element.getElementsByTagName('th')
                    for (var i = 0; i < headers.length; i++) {
                        if ('localize' in headers[i].dataset) {
                            for (var d = 0; d < json.payload.length; d++) {
                                json.payload[d][headers[i].id] = photonic.localize(json.payload[d][headers[i].id]);
                            }
                        }
                    }
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
                    columnConfig = { "data": table_columns[i].id, "title": table_columns[i].innerHTML}
                    if ('noSearch' in table_columns[i].dataset) {
                        columnConfig.searchable = false;
                    }
                    if ('noOrder' in table_columns[i].dataset) {
                        columnConfig.orderable = false;
                    }
                    config.columns.push(columnConfig);
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
                            photonicUtils.log("DataTable expecting 'id' on <table> when using tick/checkbox. The 'id' is used as the <input> 'name'!");
                            return; 
                        }

                        config.columnDefs.push( { "searchable": false, "width": "2rem", "orderable": false, "className": "text-center", "targets": i } );

                        config.columns.push({ "mRender": mrenderTick(element.id, css)});
                    } else {
                        photonicUtils.log("DataTable expecting 'data-href' for link or 'data-tick' for tick box on custom column <th>!");
                        return;
                    }
                }
                
            }
            if (config.columns.length == 0) {
                photonicUtils.log("Datatable expecting atleast one column <th>!");
                return;
            }
        }
        $(element).on('error.dt', function(e, settings, techNote, message) {
           photonicUtils.log('An error has been reported by DataTables (' + message + ')');
        });

        dt = $(element).DataTable(config);

        photonicWindows.registerCleanup(dt.destroy, root);
    },

    /*
     * Draw mxgraph diagram
     */
    diagram: function(config, url, element) {
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
                try {
                var configDoc = mxUtils.load(config);
                } catch(err) {
                    mxUtils.alert('Error loading config: ' + config);
                }
                var config = configDoc.getDocumentElement();
                editor = new mxEditor();
                // Set Toolbar Container does not work.... 
                // using code to override in photonic.init
                // editor.setToolbarContainer(photonicWindows.focus());
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
                  false, 'task', null, null, 0, 1, ['merge', 'task', 'fork', 'event'],
                  '<B>Task:</B> only one source permitted.',
                  '<B>Task:</B> only <I>Start Event Start/Task/Fork/Merge</I> sources permitted.'));

                editor.graph.multiplicities.push(new mxMultiplicityMax(
                  'merge', 1, ['task', 'fork', 'eventend'],
                  '<B>Merge:</B> only one of <I>Task/Fork/Event End</I> target permitted.'));

                editor.graph.multiplicities.push(new mxMultiplicityMax(
                  'task', 1, ['task', 'fork', 'eventend', 'merge'],
                  '<B>Task:</B> only one of <I>Task/Fork/Event End/Merge</I> target permitted.'));

                editor.graph.multiplicities.push(new mxMultiplicity(
                  true, 'task', null, null, null, null, ['task', 'fork', 'eventend', 'merge'],
                  null,
                  '<B>Task:</B> only <I>Task/Fork/End/Merge/Event End</I> targets permitted.'));

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

                photonicDom.ajaxQuery('GET', url,
                    function (result, textStatus, XMLHttpRequest) {
                        editor.readGraphModel(result.documentElement);
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
                            photonicDom.ajaxQuery('PUT', url, null,
                            function () {
                                photonicDom.ajaxQuery('GET', url,
                                    function (result, textStatus, XMLHttpRequest) {
                                        editor.readGraphModel(result.documentElement);
                                    },
                                    function () {
                                        photonicWindows.closeWindow();
                                    }
                                )},
                              null, xmlDoc);
                        });
                    },
                    function () {
                        photonicWindows.closeWindow();
                    }
                );
            }
        }
        catch (e)
        {
            // Shows an error message if the editor cannot start
            photonicUtils.log('MXGraph cannot start (' + e.message + ')');
            throw e; // for debugging
        }

        photonicWindows.registerCleanup(editor.destroy);
        return editor;
    },

    /*
     * Draw chartjs graph
     */
    graph: function(element, table) {

        table.style.display="none";
        var div = document.createElement('div');
        var style = 'position: relative;';
        if ('width' in table.dataset) {
            var style = style + 'max-width:' + table.dataset.width + ';';
        }
        if ('height' in table.dataset) {
            var style = style + 'max-height:' + table.dataset.height + ';';
        }
        if ('label' in table.dataset) {
            var label = table.dataset.label;
        } else {
            var label = null;
        }

        div.className = 'chart-container';
        div.style = style

        var canvas = document.createElement('canvas');
        if ('graphHeight' in table.dataset) {
            canvas.height=table.dataset.graphHeight;
        }
        if ('graphWidth' in table.dataset) {
            canvas.width=table.dataset.graphWidth;
        }

        div.appendChild(canvas);

        var type = table.dataset.graph.toLowerCase();
        if (!(type == 'bar' || type == "line" || type == "pie" || type == "doughnut")) {
            photonicNotice.UIError("Unknown graph type '" + type + "'");
            return null;
        }

        var config = {
            type: type,
            data: {
                labels: [],
                datasets: [],
            },                                                                                                                                                         
            options: {
                responsive: true,
                layout: {
                    padding: {
                        top: 5,
                        bottom: 5,
                        left: 5,
                        right: 5
                    }
                }
            }
        }
        if ('legendPosition' in table.dataset) {
            config.options.legend = { 
                position: table.dataset.legendPosition,
            }
        }
        if ('noLegend' in table.dataset) {
            config.options.legend = { 
                fullWidth: false,
                display: false,
            }
        }

        if (type == 'line' || type == "bar") {
            config.options.scales = {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }],
                xAxes: [{}],
            }
        }

        if ('title' in table.dataset) {
            config.options.title = { 
                fullWidth: false,
                padding: 3,
                display: true,
                text: table.dataset.title
            }
        }

        if (type == 'line' || type == "bar") {
            if (table.dataset.graph == 'bar') {
                if ('xstack' in table.dataset) {
                    config.options.scales.xAxes[0].stacked = true;
                }
                if ('ystack' in table.dataset) {
                    config.options.scales.yAxes[0].stacked = true;
                }
                if ('stack' in table.dataset) {
                    config.options.scales.xAxes[0].stacked = true;
                    config.options.scales.yAxes[0].stacked = true;
                }
            }

            config.options.scales.yAxes[0].ticks.callback = function(value, index, values) {
                if (table.dataset.yprefix != null) {
                    var value = table.dataset.yprefix + value
                }
                if (table.dataset.ysuffix != null) {
                    var value = value + table.dataset.ysuffix
                }
                return value
            }

            if ('nogrid' in table.dataset) {
                config.options.scales.xAxes[0].gridLines = {display:false};
                config.options.scales.yAxes[0].gridLines = {display:false};
            }

            if ('xtime' in table.dataset) {
                if (type == 'line') {
                    config.options.scales.xAxes[0].type = 'time';
                    config.options.scales.xAxes[0].distribution = 'linear';
                    config.options.scales.xAxes[0].time = {
                        unit: table.dataset.xtime,
                    }
                } else {
                    if ('offset' in table.dataset) {
                        config.options.scales.xAxes[0].ticks = {
                            callback: function(value, index, values) {
                                if (table.dataset.xtime == 'minute') {
                                    return moment(value).format('h:mm a');
                                } else if (table.dataset.xtime == 'hour') {
                                    return moment(value).format('hA');
                                } else if (table.dataset.xtime == 'day') {
                                    return(moment(value).format('MMM D HHA'));
                                } else if (table.dataset.xtime == 'week') {
                                    return moment(value).format('ll');
                                } else if (table.dataset.xtime == 'month') {
                                    return(moment(value).format('YYYY MMM HHA'));
                                }
                            }
                        }
                    } else {
                        config.options.scales.xAxes[0].ticks = {
                            callback: function(value, index, values) {
                                if (table.dataset.xtime == 'minute') {
                                    return moment(value).format('h:mm a');
                                } else if (table.dataset.xtime == 'hour') {
                                    return moment(value).format('hA');
                                } else if (table.dataset.xtime == 'day') {
                                    return(moment(value).format('MMM D'));
                                } else if (table.dataset.xtime == 'week') {
                                    return moment(value).format('ll');
                                } else if (table.dataset.xtime == 'month') {
                                    return(moment(value).format('YYYY MMM'));
                                }
                            }
                        }
                    }
                }
            }
        } else {
            if (table.dataset.suffix != null) {
                //var value = table.dataset.yprefix + value
                config.options.tooltips = {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            var indice = tooltipItem.index;
                            return  data.labels[indice] +': '+data.datasets[0].data[indice] + table.dataset.suffix;
                        },
                    },
                }
            }
        }

        var ids = [];
        var fields = [];
        var backgroundColors = [];
        var borderColors = [];
        var borderWidths = [];

        // DATASETS
        var thead = photonicDom.getElementByTagName('thead', table);
        if (thead != null) {
            var th = thead.getElementsByTagName('th');
            for (var i = 0; i < th.length; i++) {
                var dataset = {
                    fill: false,
                    data: [],
                    backgroundColor: [],
                    borderColor: []
                }
                dataset.label = th[i].innerHTML;
                if ('backgroundColor' in th[i].dataset) {
                    backgroundColors.push(th[i].dataset.backgroundColor);
                } else {
                    backgroundColors.push("#efefef");
                }
                if ('borderColor' in th[i].dataset) {
                    borderColors.push(th[i].dataset.borderColor);
                } else {
                    borderColors.push("#efefef");
                }
                if ('borderWidth' in th[i].dataset) {
                    borderWidths.push(th[i].dataset.borderWidth);
                } else {
                    borderWidths.push("0");
                }
                if ('graph' in th[i].dataset) {
                    dataset["type"] = th[i].dataset.graph;
                }

                ids.push(th[i].id);
                fields.push(th[i].innerHTML);

                config.data.datasets.push(dataset);

            }
        }

        // TABLE DATA
        if (!('url' in table.dataset)) {
            var tbody = photonicDom.getElementByTagName('tbody', table);
            if (tbody != null) {
                var tr = tbody.getElementsByTagName('tr');
                for (var i = 0; i < tr.length; i++) {
                    var td = tr[i].getElementsByTagName('td');

                    for (var z = 0; z < td.length; z++) {
                        if (config.data.datasets[z] != null) {
                            var dataset = config.data.datasets[z]
                        } else {
                            var dataset = {
                                fill: false,
                                data: [],
                                backgroundColor: [],
                                borderColor: []
                            }
                            config.data.datasets.push(dataset);
                        }
                        dataset.data.push(td[z].innerHTML);

                        if ('label' in tr[i].dataset) {
                            if (config.data.labels[i] != null) {
                                config.data.labels[i] = tr[i].dataset.label;
                            } else {
                                config.data.labels.push(tr[i].dataset.label);
                            }
                        }

                        if ('backgroundColor' in td[z].dataset) {
                            if (dataset.backgroundColor[i] != null) {
                                dataset.backgroundColor[i] = td[z].dataset.backgroundColor;
                            } else {
                                dataset.backgroundColor.push(td[z].dataset.backgroundColor);
                            }
                        } else {
                            if (backgroundColors[z] != null) {
                                dataset.backgroundColor.push(backgroundColors[z]);
                            } else {
                                dataset.backgroundColor.push("#efefef");
                            }
                        }

                        if ('borderColor' in td[z].dataset) {
                            if (dataset.backgroundColor[i] != null) {
                                dataset.borderColor[i] = td[z].dataset.borderColor;
                            } else {
                                dataset.borderColor.push(td[z].dataset.borderColor);
                            }
                        } else {
                            if (borderColors[z] != null) {
                                dataset.borderColor.push(borderColors[z]);
                            } else {
                                dataset.borderColor.push("#efefef");
                            }
                        }
                    }

                }
            }

            table.parentNode.replaceChild(div, table);
            var chart = new Chart(canvas, config);

        } else {
            var url = photonic.app + "/apiproxy?url=" + table.dataset.url
            if ('endpoint' in table.dataset) {
                var url = url + '&endpoint=' + table.dataset.endpoint
            }
            photonicDom.ajaxQuery('GET', url,
                function (result, textStatus, XMLHttpRequest) {
                    if ('payload' in result) {
                        for (var r = 0; r < result.payload.length; r++) {
                            if (label == null) {
                                config.data.labels.push(r);
                            } else if (label in result.payload[r]) {
                                config.data.labels.push(result.payload[r][label])
                            } else {
                                photonicNotice.UIError('Payload for Graph missing label');
                                config.data.labels.push(r);
                            }
                            for (var f = 0; f < ids.length; f++) {
                                if (ids[f] in result.payload[r]) {
                                    var dataset = config.data.datasets[f]
                                    dataset.data.push(result.payload[r][ids[f]])
                                    if (type == "line") {
                                        dataset.backgroundColor = backgroundColors[f];
                                        dataset.borderColor = borderColors[f];
                                        dataset.borderWidth = borderWidths[f];
                                    } else {
                                        if (type == "pie" || type == "doughnut") {
                                            //color = randomColor({luminosity: 'light'});
                                            color = photonic.colors(r);
                                            dataset.backgroundColor.push(color);
                                            dataset.borderColor.push(color);
                                        } else {
                                            dataset.backgroundColor.push(backgroundColors[f]);
                                            dataset.borderColor.push(borderColors[f]);
                                            dataset.borderWidth = borderWidths[f];
                                        }
                                    }
                                }
                            }
                        }

                    }
                    table.parentNode.replaceChild(div, table);

                    var chart = new Chart(canvas, config)
                });
        } 
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
        photonicDom.registerEvent(element, 'a', 'click', photonicDom.linkHandler);
        photonicDom.registerEvent(element, 'form', 'submit', photonicDom.formHandler);

        var selects = element.getElementsByTagName('select');
        for (var i = 0; i < selects.length; i++) {
            photonicDom.select(element, selects[i]);
        }

        var tables = element.getElementsByTagName('table');
        var graphs = [];
        var datatables = [];
        for (var j = 0; j < tables.length; j++) {
            if ('graph' in tables[j].dataset) {
                graphs.push(tables[j]);
            } else {
                datatables.push(tables[j]);
            }
        }
        for (var j = 0; j < graphs.length; j++) {
            photonicDom.graph(element, graphs[j]);
        }
        for (var j = 0; j < datatables.length; j++) {
            photonicDom.datatable(element, datatables[j]);
        }

        var divs = element.getElementsByTagName('div');
        for (var j = 0; j < divs.length; j++) {
            dataset = divs[j].dataset;
            if ('url' in dataset) {
                url = dataset.url;
            } else {
                url = null;
            }
            if ('jqtabs' in dataset) {
                $(divs[j]).tabs();
            }

            // Rendering types..
            if ('diagram' in dataset) {
                photonicDom.diagram(dataset['diagram'], url, divs[j]);
            }
        }

        // LOCALIZE TIMEZONES
        var inputs = element.getElementsByTagName('input');
        for (var j = 0; j < inputs.length; j++) {
            dataset = inputs[j].dataset;
            if ('localize' in dataset) {
                inputs[j].value = photonic.localize(inputs[j].value);
            }
        }
        var selects = element.getElementsByTagName('select');
        for (var j = 0; j < selects.length; j++) {
            dataset = selects[j].dataset;
            if ('localize' in dataset) {
                var options = selects[j].getElementsByTagName('option');
                for (var a = 0; a < options.length; a++) {
                    options[a].innerHTML = photonic.localize(options[a].innerHTML);
                }
            }
        }
        var spans = element.getElementsByTagName('span');
        for (var j = 0; j < spans.length; j++) {
            dataset = spans[j].dataset;
            if ('localize' in dataset) {
                spans[j].value = photonic.localize(spans[j].value);
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
            .ajax.reload(photonicDom.datatableAdjust, false );
    },

    jsonForm: function(form) {
        object = photonicDom.objForm(form);

        return(JSON.stringify(object));
    },

    objForm: function(form) {
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

        return(object);
    },

    onChange: function(evt, element) {
        photonicDom.formHandler(evt, element);
    }
}

var photonicNotice = {
    notices: 0,

    /*
     * Popup messages Below... 
     */
    notice: function(n, css) {
        n = n + '<BR><I>' + new Date().toLocaleString() + '</I>';
        photonicNotice.notices++;
        var divid = String("popup" + photonicNotice.notices);
        n = "<div id=\"" + divid + "\" class=\"popup " + css + "\"><div style='width: 270px; float:left;'>" + n + "</div><div style='float:left;'><button class=\"close\" type=\"button\" onclick=\"photonicNotice.closeNotice('"+divid+"');\">x</button></div></div>"
        $("#popup").prepend(n);
        if (css == 'error') {
            $('#'+divid).toggle( "shake" );
            window.setTimeout(function() { photonicNotice.closeNotice(divid); }, 30000);
        }
        else {
            $('#'+divid).toggle( "fold" );
            window.setTimeout(function() { photonicNotice.closeNotice(divid); }, 10000);
        }
    },

    /*
     * Information popup notification... 
     */
    info: function(n) {
        photonicNotice.notice(n, 'info')
    },


    /*
     * Success popup notification... 
     */
    success: function(n) {
        photonicNotice.notice(n, 'success')
    },

    /*
     * Error popup notification... 
     */
    error: function(n) {
        photonicNotice.notice(n, 'error')
    },

    /*
     * UIError popup notification... 
     */
    UIError: function(n) {
        n = '<B>User Interface.</B><BR>' + n
        photonicNotice.notice(n, 'error')
    },

    /*
     * JSError popup notification... 
     */
    JSError: function(n) {
        n = '<B>Java Script Interface.</B><BR>' + n
        photonicNotice.notice(n, 'error')
    },

    /*
     * Warning popup notification... 
     */
    warning: function(n) {
        photonicNotice.notice(n, 'warning')
    },

    /*
     * close popup notification... 
     */
    closeNotice: function(n) {
        $('#'+n).toggle( "fold" );
        window.setTimeout(function() { photonicNotice.deleteNotice(n); }, 1000)
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

}

var photonicCookies = {
    setCookie: function(cname, cvalue, exdays) {
        var site = photonic.app
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
}

var photonicHandlers = {
}

var photonicSession = {
    headers: function(xhr, type) {
        var type = typeof type !== 'undefined' ? type : 'scoped';

        xhr.setRequestHeader("X-Timezone", photonic.tz);

        token = sessionStorage.getItem(type);

        // Scoped Token
        if (token != null) {
            xhr.setRequestHeader("X-Auth-Token", token);
            parsedToken = photonicSession.parseToken(token);
            if ('domain' in parsedToken && parsedToken.domain != null) {
                xhr.setRequestHeader("X-Domain", parsedToken.domain);
            }

            if ('tenant_id' in parsedToken && parsedToken.tenant_id != null) {
                xhr.setRequestHeader("X-Tenant-Id", parsedToken.tenant_id);
            }
        }

        // X-Region Session
        region = sessionStorage.getItem("region");
        if (region != null) {
            xhr.setRequestHeader("X-Region", region);
        }
    },

    tjsl: function() {
        unscoped = sessionStorage.getItem('unscoped');
        scoped = sessionStorage.getItem('scoped');
        region = sessionStorage.getItem('region');
        if (unscoped != null && scoped != null) {
            parsedToken = photonicSession.parseToken(scoped);
            cookie = { token: unscoped, scoped_token: scoped, region: region }
            if ('domain' in parsedToken) {
                cookie.domain = parsedToken.domain;
            }
            if ('tenant_id' in parsedToken) {
                cookie.tenant_id = parsedToken.tenant_id;
            }
            photonicCookies.setCookie('photonicLogin', JSON.stringify(cookie));
            return(cookie);
        } else {
            var photonicLogin = photonicCookies.getCookie('photonicLogin');
            if (photonicLogin != null) {
                tjsl = JSON.parse(photonicLogin);
                if (tjsl.token != null) {
                    sessionStorage.setItem('unscoped', tjsl.token);
                }
                if (tjsl.scoped_token != null) {
                    sessionStorage.setItem('scoped', tjsl.scoped_token);
                }
                if (tjsl.region != null) {
                    sessionStorage.setItem('region', tjsl.region);
                }
                if (tjsl.domain != null) {
                    sessionStorage.setItem('domain', tjsl.domain);
                } else {
                    sessionStorage.removeItem('domain');
                }
                if (tjsl.tenant_id != null) {
                    sessionStorage.setItem('tenant_id', tjsl.tenant_id);
                } else {
                    sessionStorage.removeItem('tenant_id');
                }
                return(tjsl);
            }
            return({});
        }
    },

    tjslLogin: function(ignoreExpire) {
        var ignoreExpire = typeof ignoreExpire !== 'undefined' ? ignoreExpire : true;
        photonicLogin = photonicCookies.getCookie('photonicLogin');
        if (photonicLogin != null)
        {
            var tjsl = JSON.parse(photonicLogin);
            if (tjsl != null) {
                if (!('token' in tjsl)) {
                    return(false);
                } else {
                    if (ignoreExpire == false) {
                        var parsedToken = photonicSession.parseToken(tjsl.token);
                        var tokenExpire = photonicSession.parseCredentialsExpire(parsedToken);
                        if (tokenExpire <= photonicUtils.nowTimestamp()) {
                            return(false);
                        }
                    }
                }
            } else {
                return(false);
            }
            return(true);
        } else {
            return(false);
        }
    },

    parseToken: function(token) {
        var token = token.split(".");
        try {
            var creds = atob(token[1]);
        } catch(err) {
            throw('Corrupt Token');
        }
        return (JSON.parse(creds));
    },

    parseCredentialsLoginAt: function(credentials) {
        loginat = new Date(credentials.loginat).getTime();
        return(Math.floor(loginat / 1000));
    },

    parseCredentialsExpire: function(credentials) {
        expire = new Date(credentials.expire).getTime();
        return(Math.floor(expire / 1000));
    },

    initSession: function(init) {
        var init = typeof init !== 'undefined' ? init : false;
        var token = sessionStorage.getItem('unscoped');
        if (token != null) {
            // If tab/window logged in.
            try {
                var parsedToken = photonicSession.parseToken(token);
            } catch(err) {
                sessionStorage.clear();
                photonicNotice.UIError('Corrupt unscoped token in sessionStorage');
                photonicDom.initWindow(photonic.app + '/');
                return(false);
            }
            var tokenExpire = photonicSession.parseCredentialsExpire(parsedToken);
            if (tokenExpire <= photonicUtils.nowTimestamp()) {
                // if tab/window token expired.
                photonicNotice.warning('<B>Session expired.</B>');
                photonicSession.logout();
                if (init == false) {
                    // if not page load.
                    photonicDom.initWindow(photonic.app + '/');
                    window.setTimeout(photonicSession.initSession, 1000);
                    return(false);
                }
            } else if (!(photonicSession.tjslLogin())) {
                // if cookie tjsl token expired.
                photonicSession.logout();
                photonicNotice.warning('<B>Session logout or expired.</B>');
                if (init == false) {
                    // if not page load.
                    photonicDom.initWindow(photonic.app + '/');
                    window.setTimeout(photonicSession.initSession, 1000);
                    return(false);
                }
            } else {
                if (init == true) {
                    window.setTimeout(photonicSession.initSession, 1000);
                    return(true);
                }
            }
        } else if (photonicSession.tjslLogin()) {
            // If tab window not logged in, but token in tjsl cookie.
            if (photonicSession.tjslLogin(false)) {
                photonicNotice.success('<B>New session.</B>');
                photonicSession.tjsl();
                var scopedToken = sessionStorage.getItem('scoped');
                try {
                    var parsedToken = photonicSession.parseToken(scopedToken);
                } catch(err) {
                    sessionStorage.clear();
                    photonicNotice.UIError('Corrupt scoped token in sessionStorage');
                    photonicDom.initWindow(photonic.app + '/');
                    return(false);
                }
                var tokenExpire = photonicSession.parseCredentialsExpire(parsedToken);
                if (tokenExpire - 1800 <= photonicUtils.nowTimestamp()) {
                    // if scoped token expired.
                    photonicWindows.loadHtml('');
                    photonicSession.extendToken(
                        function() {
                            photonicDom.initWindow();
                            window.setTimeout(photonicSession.initSession, 1000);
                        }
                    );
                    return(false);
                } else {
                    // if scoped token not expired.
                    if (init == false) {
                        // if not page load. (meaning not fresh tab/window)
                        photonicDom.initWindow(photonic.app + '/');
                        window.setTimeout(photonicSession.initSession, 1000);
                        return(false);
                    }
                }
            }
        }

        window.setTimeout(photonicSession.initSession, 1000);
        photonicSession.extendToken();
        return(true);
    },

    scopeToken: function(region, domain, tenant_id, callback) {
        var region = typeof region !== 'undefined' ? region : null;
        var domain = typeof domain !== 'undefined' ? domain : null;
        var tenant_id = typeof tenant_id !== 'undefined' ? tenant_id : null;
        var callback = typeof callback !== 'undefined' ? callback : photonicSession.scope;

        var requestScope = {}
        requestScope.domain = domain;
        requestScope.tenant_id = tenant_id;
        requestScope = JSON.stringify(requestScope);
        photonicDom.ajaxQuery('patch', photonic.app + '/apiproxy?url=/v1/token&endpoint=identity',
                             callback, null, null, null, requestScope, null, 'unscoped');

        if (region != null) {
            sessionStorage.setItem('region', region);
        }
    },

    extendToken: function(callback) {
        var callback = typeof callback !== 'undefined' ? callback : null;

        var token = sessionStorage.getItem('unscoped');
        var scoped = sessionStorage.getItem('scoped');

        if (token != null) {
            try {
                var tokenCredentials = photonicSession.parseToken(token);
            } catch(err) {
                photonicNotice.UIError('During extending session corrupt unscoped token in sessionStorage.');
            }
            var tokenExpire = photonicSession.parseCredentialsExpire(tokenCredentials);
            if (tokenExpire - 1800 <= photonicUtils.nowTimestamp()) {
                photonicDom.loading();
                photonicDom.ajaxQuery('put',
                                     photonic.app + '/apiproxy?url=/v1/token&endpoint=identity',
                                     function(content) {
                                          photonicDom.loading();
                                          sessionStorage.setItem('unscoped', content.token);
                                          region = sessionStorage.getItem('region');
                                          domain = sessionStorage.getItem('domain');
                                          tenant_id = sessionStorage.getItem('tenant_id');
                                          photonicLogin = photonicCookies.getCookie('photonicLogin');
                                          if (photonicLogin != null) {
                                            var tjsl = JSON.parse(photonicLogin);
                                            tjsl.token = content.token;
                                            photonicCookies.setCookie('photonicLogin', JSON.stringify(tjsl));
                                          }

                                          photonicSession.scopeToken(region, domain, tenant_id,
                                              function(content) {
                                                  sessionStorage.setItem('scoped', content.token);
                                                  if ('domain' in content && content.domain != null) {
                                                      sessionStorage.setItem('domain', content.domain);
                                                  } else {
                                                      sessionStorage.removeItem('domain');
                                                  }

                                                  if ('tenant_id' in content && content.tenant_id != null) {
                                                      sessionStorage.setItem('tenant_id', content.tenant_id);
                                                  } else {
                                                      sessionStorage.removeItem('tenant_id');
                                                  }

                                                  var credentials = photonicSession.parseToken(content.token);
                                                  var now = photonicUtils.nowTimestamp();
                                                  var reTokenTime = photonicSession.parseCredentialsExpire(credentials) - now;
                                                  if (reTokenTime > 1800) {
                                                      reTokenTime = reTokenTime - 1800;
                                                  } else {
                                                      reTokenTime = 1;
                                                  }

                                                  if (reTokenTime < 60) {
                                                      photonicNotice.success('<B>Session extended ' + reTokenTime + ' seconds.</B>');
                                                  } else {
                                                      reTokenTime = Math.round(reTokenTime / 60);
                                                      photonicNotice.success('<B>Session extended ' + reTokenTime + ' minutes.</B>');
                                                  }
                                                  photonicDom.doneLoading();
                                                  if (callback != null) {
                                                      callback();
                                                  }
                                              }
                                          );
                                      },
                                      function() {
                                          photonicSession.logout();
                                          photonicDom.initWindow(photonic.app + '/');
                                      },
                                      null,
                                      null,
                                      null,
                                      null,
                                      'unscoped');
                
            }
        }
    },

    login: function(content) {
        sessionStorage.setItem('unscoped', content.token);
        sessionStorage.setItem('scoped', content.token);

        if ('domain' in content && content.domain != null) {
            sessionStorage.setItem('domain', content.domain);
        } else {
            sessionStorage.removeItem('domain');
        }

        if ('tenant_id' in content && content.tenant_id != null) {
            sessionStorage.setItem('tenant_id', content.tenant_id);
        } else {
            sessionStorage.removeItem('tenant_id');
        }

        if ('default_tenant_id' in content && content.default_tenant_id != null) {
            photonicSession.scopeToken(null, null, content.default_tenant_id);
        } else {
            photonicSession.tjsl();
            photonicDom.initWindow(photonic.app + '/');
        }
    },

    scope: function(content) {
        sessionStorage.setItem('scoped', content.token);

        if ('domain' in content && content.domain != null) {
            sessionStorage.setItem('domain', content.domain);
        } else {
            sessionStorage.removeItem('domain');
        }

        if ('tenant_id' in content && content.tenant_id != null) {
            sessionStorage.setItem('tenant_id', content.tenant_id);
        } else {
            sessionStorage.removeItem('tenant_id');
        }
        photonicSession.tjsl();
        photonicDom.initWindow(photonic.app + '/');
    },

    logout: function(content) {
        photonicCookies.setCookie('photonicLogin', '{}', 365);
        sessionStorage.clear();
    }
}

var photonicNav = {
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
        nav = photonicDom.getElementByTagName('nav');
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
            photonicNav.navViewParentDropDowns(parent)
        }
    },

    /*
     * Clear active links
     */
    navClearActiveLinks: function() {
        nav = photonicDom.getElementByTagName('nav');
        links = nav.getElementsByTagName("a"); 
        for (z=0; z < links.length; z++){
            links[z].style.display = 'block';
            links[z].className = '';
        }
    },

    setNavActiveLink: function(e, element) {
        photonicNav.navRemoveActiveLinks(element); 
        element.className = 'active';
    },

    initNavActiveLink: function(url) {
        var url = typeof url !== 'undefined' ? url : window.location.href;
        if (url.endsWith("#")) {
            url = url.href.substr(0, url.href.indexOf('#'))
        }

        nav = photonicDom.getElementByTagName('nav');
        links = nav.getElementsByTagName("a"); 
        for (z=0; z < links.length; z++){
            if (url == links[z].href) {
                if (!('event' in links[z].dataset)) {
                    links[z].style.display = 'block';
                    links[z].className = 'active';
                    photonicNav.navViewParentDropDowns(links[z]);
                }
            }    
        }    
    },

    /*
     * Navigation Search triggered by event.
     */
    navSearch: function(e, element) {
        navmenu = photonicDom.getElementByTagName('nav');
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
                        photonicNav.navViewParentDropDowns(links[a]);
                    }
                }
            }
        }
    },

    navClearSearch: function(e) {
        navmenu = photonicDom.getElementByTagName('nav');
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
}

var photonic = {
    app: null,
    init: photonicInit.init,

}

// Deprecated use functions now under photonic
// Please update your code! for future.
var close_window = photonicWindows.closeWindow
var close_windows = photonicWindows.closeWindows
