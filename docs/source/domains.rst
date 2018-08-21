.. _domains:

Domains
=======

Introduction
------------

Domains are a way to logically group things together in Tachyonic. For example, one may group certain Tenants together
in one Domain, and others in another. One can also allow *Users* to only view resources that belong to a specific
domain.

Usage
-----

When logging in to Tachyonic, one can specify which *Domain* to log into. When logged into a specific *Domain*, only
resources associated with that *Domain* are visible/accessible.

Once logged in, one can switch to another *Domain* by selecting the *Domain* from the *Domain* drop down box on the main
Tachyonic screen.

.. image:: /_static/img/view_domains.png

Above is an example of when you want to view all the available domains and select one.

Creating/Adding Domains
-----------------------

To create a new *Domain*, navigate to ``System -> Domains`` and click on the ``Add Domain`` button. This will launch
the *Create Domain* form.

.. image:: /_static/img/add_domain.png

Simply enter the *Domain* name. By default, the *Domain* *enabled* check box is not checked.
In order to activate the *Domain*, check this box before hitting the ``Add Domain`` button.

.. _viewdomain:

Viewing Domain Information
--------------------------

In order to view *Domain* information, navigate to ``System -> Domains``, and click on the magnifying glass icon.
This will launch the *View Domain* window, which will display the current information associated with the *Domain*.

.. image:: /_static/img/view_domains.png

Above is an example of the screen you will see when you want to view all created domains.

.. image:: /_static/img/view_domain.png

This is the screen you will see when you want to view a specific domains' information.

.. _editdomain:

Modifying Domain Information
----------------------------

In order to update the Domain name, or enable/disable it, follow the same procedure as in :ref:`viewdomain`, and click on
the ``edit`` button. This will launch the *Edit Domain* window. Update the information accordingly, and hit the ``Save`` button.

.. image:: /_static/img/edit_domain.png

Deleting a Domain
-----------------

In order to delete a *Domain*, follow the same procedure as in :ref:`editdomain`, and click on
the ``delete`` button. A confirmation dialog will pop up. Hit the ``Continue`` button to permanently delete the domain,
or hit ``Cancel`` to return to the previous form.

.. image:: /_static/img/edit_domain.png

Above is an example of the delete option in the Edit Domain form.

.. image:: /_static/img/confirm_delete.png

You must confirm the deletion of a domain.