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


$( document ).ready(function() {
    set_active_a();
    register_event('nav', 'a', 'click', toggle_menu_dropdown, 'dropdown');
    register_event('sidebar', 'input', 'input', search_nav, 'search-nav');
});
