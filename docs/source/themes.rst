==================================
Customizing Photonic Look and Feel
==================================

Introduction
============
Luxon caters for the possibility to overwrite the default templates and CSS files that ship with Photonic.
This is achieved via a concept known as themes. This guide illustrates how to create and activate
themes within the Tachyonic Framework.

Prerequisites
=============
In order to follow along with this guide, the reader should be familiar with:

* html
* css
* jquery
* javascipt
* jinja2 templating
* ajax

The easiest way of course to get started with developing on the Tachyonic Project, is to make use of
`devstack <http://tachyonic.org/sphinx/devstack/latest/install.html#usage>`_, in which case docker for MAC or Linux is
required.

Lastly, to try this out, of course a devstack Tachyonic deployment (``devstack -s tachyonic/``)

Creating a Theme
================
First a recap of the photonic deployment procedure. After Photonic has been installed on the system, it is
deployed with:

.. code:: bash

   $ mkdir photonic
   $ luxon -i photonic photonic/


This creates the following files and directories:

.. code:: bash

    $ cd photonic/
    photonic$ ls -1
    settings.ini
    static
    templates
    tmp
    wsgi.py


The two directories to of importance here is ``static`` and ``templates``.

The static directory
--------------------
Inside the ``static`` directory is a is a directory named ``themes``, this is where additional themes may be
placed. After a new installation, the ``themes`` directory only contains one folder called ``default``, which contains
the default Photonic images and css files. To create a new theme, simply create the directory:

.. code:: bash

    photonic$ cd static/themes
    photonic/static/themes$ mkdir mytheme

The name of this directory may be a FQDN, in which case the theme will automatically be activated whenever the user
connects to the web server on that specific FQDN. This convienient feature allows one to have a custom
look and feel, based on the domain name, for a single Tachyonic installation!

Inside this directory you may place files that are referenced by the photonic templates, such as

=============== =============
File name       Purpose
=============== =============
background.jpg  The Background image
logo.png        The logo displayed at the top left
icon-32x32.png  Smaller version of the logo
loader.gif      The animation that is displayed while waiting for an ajax query to complete
theme.css       the main CSS file of the theme
=============== =============

Simply update the ``theme.css`` file to update any stylesheets in use.

Templates
---------
Photonic makes use of `Jinja2 <https://jinja.palletsprojects.com>`_ templates to generate its HTML. The default templates are located in the package's
``photonic/templates`` directory. To overwrite a specific template, simply create a file with the same name in the
deployment directory's ``templates/<project-name>`` directory. For example, to overwrite the ``header`` template that
generates the top section of the Photonic page's HTML: continuing from the previous demonstration:

.. code:: bash

   photonic/static/themes$ cd ../../templates/photonic
   photonic/templates/photonic$ vi header.html

enter the contents, save and exit. It is advised to start with an exact copy of the default version of the
specific template, and simply updating the required portions. These can of course be obtained
from the python package's installation directory, or
`online on github <https://github.com/TachyonicProject/photonic/tree/latest/photonic/templates>`_.

It is not necessary to create all the required templates, only the ones to be overwritten. If
a required template is not present in this directory, the default will be used instead.

It is not required to restart the web server after making changes to these files and templates; a simple reload
on the browser should reflect the change (provided a cached copy is not displayed).

Setting the default theme
=========================
Inside photonic's ``settings.ini`` file, the default theme can be specified in the ``application`` section:

.. code::

    [application]
    default_theme=mytheme
