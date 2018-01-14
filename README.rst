==================
Photonic Framework
==================

.. image:: https://travis-ci.org/TachyonicProject/photonic.svg?branch=master
    :target: https://travis-ci.org/TachyonicProject/photonic
    :alt: Build Status

.. image:: https://readthedocs.org/projects/photonic/badge/?version=latest
    :target: http://photonic.readthedocs.io/en/latest/?badge=latest
    :alt: Documentation Status

Quick Links
-----------

* `Website <http://www.tachyonic.org/photonic>`__.
* `Documentation <http://tachyonic.readthedocs.io>`__.

Installation
------------

Tachyonic currently fully supports `CPython <https://www.python.org/downloads/>`__ [ '3.5', '3.6' ].

Source Code
-----------

Photonic infrastructure and code is hosted on `GitHub <https://github.com/TachyonicProject/photonic>`_.
Making the code easy to browse, download, fork, etc. Pull requests are always welcome!

Clone the project like this:

.. code:: bash

    $ git clone https://github.com/TachyonicProject/photonic.git

Once you have cloned the repo or downloaded a tarball from GitHub, you
can install Tachyon like this:

.. code:: bash

    $ cd photonic
    $ pip install .

Or, if you want to edit the code, first fork the main repo, clone the fork
to your desktop, and then run the following to install it using symbolic
linking, so that when you change your code, the changes will be automagically
available to your app without having to reinstall the package:

.. code:: bash

    $ cd photonic
    $ pip install -e .

You can manually test changes to the photonic by switching to the
directory of the cloned repo:

.. code:: bash

    $ pip install -r requirements-dev.txt
    $ tox
