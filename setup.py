# -*- coding: utf-8 -*-
# Copyright (c) 2018 Christiaan Frans Rademan.
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
# * Redistributions of source code must retain the above copyright notice, this
#   list of conditions and the following disclaimer.
#
# * Redistributions in binary form must reproduce the above copyright notice,
#   this list of conditions and the following disclaimer in the documentation
#   and/or other materials provided with the distribution.
#
# * Neither the name of the copyright holders nor the names of its
#   contributors may be used to endorse or promote products derived from
#   this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
# LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
# CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
# SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
# INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
# CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
# ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
# THE POSSIBILITY OF SUCH DAMAGE.
import os
import sys
import imp
import subprocess
try:
    from setuptools import setup
except ImportError:
    def setuptools():
        print('Requires `setuptools` to be installed')
        print('`pip install setuptools`')
        exit()

from setuptools import find_packages
from setuptools.command.test import test as TestCommand
from distutils import spawn

try:
    import colorama
    colorama.init()  # Initialize colorama on Windows
except ImportError:
    pass

# Add the current directory to the module search path.
sys.path.insert(0, os.path.abspath('.'))

## Constants
CODE_DIRECTORY = 'photonic'
DOCS_DIRECTORY = 'docs'
TESTS_DIRECTORY = 'tests'
PYTEST_FLAGS = ['--doctest-modules']


metadata = imp.load_source(
    'metadata', os.path.join(CODE_DIRECTORY, 'metadata.py'))


# Miscellaneous helper functions

def get_project_files():
    """Retrieve a list of project files, ignoring hidden files.

    :return: sorted list of project files
    :rtype: :class:`list`
    """
    if is_git_project() and has_git():
        return get_git_project_files()

    project_files = []
    for top, subdirs, files in os.walk('.'):
        for subdir in subdirs:
            if subdir.startswith('.'):
                subdirs.remove(subdir)

        for f in files:
            if f.startswith('.'):
                continue
            project_files.append(os.path.join(top, f))

    return project_files


def is_git_project():
    return os.path.isdir('.git')


def has_git():
    return bool(spawn.find_executable("git"))


def get_git_project_files():
    """Retrieve a list of all non-ignored files, including untracked files,
    excluding deleted files.

    :return: sorted list of git project files
    :rtype: :class:`list`
    """
    cached_and_untracked_files = git_ls_files(
        '--cached',  # All files cached in the index
        '--others',  # Untracked files
        # Exclude untracked files that would be excluded by .gitignore, etc.
        '--exclude-standard')
    uncommitted_deleted_files = git_ls_files('--deleted')

    # Since sorting of files in a set is arbitrary, return a sorted list to
    # provide a well-defined order to tools like flake8, etc.
    return sorted(cached_and_untracked_files - uncommitted_deleted_files)


def git_ls_files(*cmd_args):
    """Run ``git ls-files`` in the top-level project directory. Arguments go
    directly to execution call.

    :return: set of file names
    :rtype: :class:`set`
    """
    cmd = ['git', 'ls-files']
    cmd.extend(cmd_args)
    return set(subprocess.check_output(cmd).splitlines())


def print_success_message(message):
    """Print a message indicating success in green color to STDOUT.

    :param message: the message to print
    :type message: :class:`str`
    """
    try:
        import colorama
        print(colorama.Fore.GREEN + message + colorama.Fore.RESET)
    except ImportError:
        print(message)


def print_failure_message(message):
    """Print a message indicating failure in red color to STDERR.

    :param message: the message to print
    :type message: :class:`str`
    """
    try:
        import colorama
        print(colorama.Fore.RED + message + colorama.Fore.RESET,
              file=sys.stderr)
    except ImportError:
        print(message, file=sys.stderr)


def read(filename):
    """Return the contents of a file.

    :param filename: file path
    :type filename: :class:`str`
    :return: the file's content
    :rtype: :class:`str`
    """
    with open(os.path.join(os.path.dirname(__file__), filename)) as f:
        return f.read()


def _lint():
    """Run lint and return an exit code."""
    # Flake8 doesn't have an easy way to run checks using a Python function, so
    # just fork off another process to do it.

    # Python 3 compat:
    # - The result of subprocess call outputs are byte strings, meaning we need
    #   to pass a byte string to endswith.
    project_python_files = [filename for filename in get_project_files()
                            if filename.endswith(b'.py')]
    retcode = subprocess.call(
        ['flake8', '--max-complexity=36'] + project_python_files)
    if retcode == 0:
        print_success_message('No style errors')
    return retcode


def _test():
    """Run the unit tests.

    :return: exit code
    """
    # Make sure to import pytest in this function. For the reason, see here:
    # <http://pytest.org/latest/goodpractises.html#integration-with-setuptools-test-commands>  # NOPEP8
    import pytest
    # This runs the unit tests.
    # It also runs doctest, but only on the modules in TESTS_DIRECTORY.
    return pytest.main(PYTEST_FLAGS + [TESTS_DIRECTORY])


def _test_all():
    """Run lint and tests.

    :return: exit code
    """
    return _lint() + _test()


# The following code is to allow tests to be run with `python setup.py test'.
# The main reason to make this possible is to allow tests to be run as part of
# Setuptools' automatic run of 2to3 on the source code. The recommended way to
# run tests is still `paver test_all'.
# See <http://pythonhosted.org/setuptools/python3.html>
# Code based on <http://pytest.org/latest/goodpractises.html#integration-with-setuptools-test-commands>  # NOPEP8
class TestAllCommand(TestCommand):
    def finalize_options(self):
        TestCommand.finalize_options(self)
        # These are fake, and just set to appease distutils and setuptools.
        self.test_suite = True
        self.test_args = []

    def run_tests(self):
        raise SystemExit(_test_all())


# define install_requires for specific Python versions
python_version_specific_requires = []

# as of Python >= 2.7 and >= 3.2, the argparse module is maintained within
# the Python standard library, otherwise we install it as a separate package
if sys.version_info < (2, 7) or (3, 0) <= sys.version_info < (3, 3):
    python_version_specific_requires.append('argparse')

# install-requires.txt as install_requires
# minimal dependencies to run.
install_requires = []
if os.path.exists(os.path.join(os.path.dirname(__file__), 'install-requires.txt')):
    with open(os.path.join(os.path.dirname(__file__), 'install-requires.txt')) as req:
        install_requires = req.read().splitlines()

# dependency-links.txt as dependency_links
# locations of where to find dependencies within install-requires.txt ie github.
# setuptools does work with url format for pip.
dependency_links = []
if os.path.exists(os.path.join(os.path.dirname(__file__), 'dependency-links.txt')):
    with open(os.path.join(os.path.dirname(__file__), 'dependency-links.txt')) as req:
        dependency_links = req.read().splitlines()

# See here for more options:
# <http://pythonhosted.org/setuptools/setuptools.html>
setup_dict = dict(
    name=metadata.package,
    version=metadata.version,
    author=metadata.authors[0],
    author_email=metadata.emails[0],
    maintainer=metadata.authors[0],
    maintainer_email=metadata.emails[0],
    url=metadata.url,
    description=metadata.description,
    long_description=read('README.rst'),
    include_package_data=True,
    classifiers=metadata.classifiers,
    packages=find_packages(exclude=(TESTS_DIRECTORY,)),
    install_requires=[] + python_version_specific_requires + install_requires,
    dependency_links=dependency_links,
    # Allow tests to be run with `python setup.py test'.
    tests_require=[
        'pytest==2.5.1',
        'mock==1.0.1',
        'flake8==2.1.0',
    ],
    cmdclass={'test': TestAllCommand},
    zip_safe=False  # don't use eggs
)

def main():
    setup(**setup_dict)


if __name__ == '__main__':
    main()
