.. _roles:

Roles
=====

Introduction
------------
Every user can be assigned one or multiple Roles. These provide a `RBAC <https://en.wikipedia.org/wiki/Role-based_access_control>`_
facility: A user is only allowed to access endpoints/URLs for which the Role allows.

By default the following Roles are available:

* Account Manager
* Administrator
* Billing
* Customer
* CustomerInstall
* Operations
* Root
* Support

The *Root* user has access to all endpoints/URLs, while the *Administrator* user has access to all
things Tachyonic related, such as manipulation of Roles, Users, Domains and Tenants.

For a Full list of Role to endpoint mappings, refer to the development documentation.

Creating/Adding User Roles
--------------------------
Through the web UI one is able to create new roles, but these do not make sense without associating those roles to rules and endpoints.
That topic is covered in the development guide.

To create a new role in the Ui, navigate to ``System -> Roles`` and click on the ``Add Role`` button. This will launch the *Create Role* form.

.. image:: /_static/img/view_roles.png

Simply give the Role a name, and optionally a description, and hit the ``Create`` Button.

.. image:: /_static/img/add_role.png

.. _viewrole:

Viewing Roles
-------------
In order to view the configuration for a Role navigate to ``System -> Roles``, and click on the magnifying glass icon next to the
role to be viewed. This will launch the *View role* window, which will display the current information associated with the role.

.. image:: /_static/img/view_role_info.png

.. _editrole:

Modifying Role Information
--------------------------
In order to update user role information, follow the same procedure as in :ref:`viewrole`, and click on
the ``edit`` button. This will launch the *Edit Role* window. Update the information accordingly, and hit the ``Save`` button.

.. image:: /_static/img/edit_role.png

Deleting a Role
---------------
In order to delete a User role, follow the same procedure as in :ref:`editrole`, and click on
the ``delete`` button. A confirmation dialog will pop up. Hit the ``Continue`` button to permanently delete the user
role, or hit ``Cancel`` to return to the previous form.

.. image:: /_static/img/delete_role.png

.. WARNING::
   If you are deleting any of the default available roles, be sure to also update references to them in all views!

Assigning Roles to a User Account
---------------------------------
To assign a *Role* to a *User* account, follow the same steps as in :ref:`edituser`, and scroll down to the *Role
Assignments* section at the bottom of the form. Roles can be assigned per *Domain* and per *Tenant*. Select the
appropriate *Role, Tenant* and *Domain*, and hit the ``+`` button.

.. image:: /_static/img/roles.png

To add additional *Roles*, one can simply click on '' Select Role '' button below and add another role to the specific user you are busy editing.
