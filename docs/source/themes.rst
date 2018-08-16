Themes
======

Introduction
------------

The *Themes* Settings allow one to customize the look and feel of the Tachyonic web UI. These can be applied per
`FQDN <https://en.wikipedia.org/wiki/Fully_qualified_domain_name>`_.
That means, one Installation of Tachyonic can have mulitple themes, and the theme applied is determined by the FQDN entered in
the `URL <https://en.wikipedia.org/wiki/URL>`_.

The Themes are available at ``System -> Themes``. To create a new theme, click on the ``Create`` button. This will launch
the *Create Theme* form.

Enter the FQDN (for which this theme will be in effect) as the value in the *domain* field.

The value entered in the *Site Name* field will become the text shown at the top left of the Tachyonic Web UI.

Click on the ``Create`` button to create the *Theme*. Below follow the categories available to customize the look and
feel for a specific site

.. Note::
   After modifying any of these, simply hit the ``Refresh CSS`` button for the changes to take effect. If the theme
   applies to the site which one is currently logged into, the changes can be seen immediately.

.. _sitename:

Site Name
---------
This is the text shown at the top left of all pages in the Tachyonic web UI.

Logo
----
This is the image shown to the left of the :ref:`sitename`. Click on the ``choose file`` button next to *Logo*
to select an image, and then on the ``Upload`` button to upload it to the server.

Background
----------
The Background image of the Web UI is also customizable. Click on the ``choose file`` button next to *Background*
to select an image, and then on the ``Upload`` button to upload it to the server.

Stylesheets
-----------
All Stylesheets can be assigned custom values. Simply enter the element name (eg. *div.modal-header*), element
Property (eg. *background-color*) and value (eg. *#ff7788*). Click on the ``Add/Update`` button for the changes
to take effect and provide an additional row for more css values to be customized

Finally hit the ``Save`` button to sahve the changes for the *Theme*.
