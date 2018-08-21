.. _users:
Users
=====

Introduction
------------

Each user of the Photonic Framework requires a User account. The default administrative login user account is *root*, and the password is *password*.

.. image:: /_static/img/login.png

By default no URL is available if a user is not logged in, save that of the login URL. There is a time-out if there are no user activity for 5 minutes,
after which the user is automatically logged out.

.. image:: /_static/img/homescreen.png

Above is an example of the default Photonic homescreen when you have logged in as root user.

Creating/Adding Users
---------------------
To create a new user account, navigate to ``Accounts -> Users`` and click on the ``Add User`` button. This will launch the *Add User* form.

The Fields are self explanatory, and only the username, password and Name fields are mandatory. Passwords require at
least one upper case, one lower case, and one numeric character. By default, the Account *enabled* check box is not checked.
In order to activate the account, check this box before hitting the ``Add User`` button.

.. image:: /_static/img/viewusers.png

Above is a screenshot of the window that you will find when you click on the ``Users`` button on the left. Here all the current users are listed and you can also add new users by clicking on the ``Add User`` button on the bottom right. If you want to edit an individual user you you can just click on the edit button next to the user's name on the right. 

.. image:: /_static/img/enable_user.png

Above is an example of the *enabled* check box you will need to check to enable the user 

.. _viewuser:


Viewing User Account Information
--------------------------------
In order to view User Account information, navigate to ``Accounts -> Users``, here all the users will be listed. To view the user account information you can simply click on the what looks like a edit button on the right. This will bring up a view user page that will display all the information of the user you are viewing. 

.. image:: /_static/img/viewusers.png

Ths is the page you will see when you want to view all the users that you have created.

.. image:: /_static/img/view_user_info.png

Above is an example of the page you will see when you want to view only a specific user's information.

.. _edituser:

Modifying User Account Information
----------------------------------
In order to update User account information such as username or password, follow the same procedure as in :ref:`viewuser`, and click on
the ``edit`` button as to bring up the view user information. When you are on this page you can click on the edit button in the right hand corner. This will take you through to a simialar looking page that now allows you to edit the information in the fields. 

**Note that when you edit the user information you will also need to re enter the password , if not and you edit info and click on update you will cause the system to set the password to a blank field. 

**Another important feature is when you want to assign roles to a user you will need only to click on the desired roles that you want to add and then click on the + button next to the roles. This will automatically assign the roles to the specific user and therefore no need to click on update as this will update information of the user.

.. image:: /_static/img/edit_user.png

Above is an example of the window that you will find when you want to edit user information. You will get to this window by clicking on the edit button next to user name. The view user window will then pop up whereafter you can click on the edit button in the right hand corner. This will take you through to the edit user window where you can edit the user information and also assign new roles to the user.

Deleting a User account
-----------------------
In order to delete a User account, follow the same procedure as in :ref:`edituser`, and click on
the ``delete`` button. A confirmation dialog will pop up. Hit the ``Continue`` button to permanently delete the user
account, or hit ``Cancel`` to return to the previous form.

.. image:: /_static/img/delete_user.png