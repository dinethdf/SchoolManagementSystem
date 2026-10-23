# schoolms/__init__.py
# This file initializes the schoolms Django project.

# We use PyMySQL as the MySQL database driver.
# The line below tells Django to treat PyMySQL as the standard MySQLdb driver,
# making it work seamlessly with Django without requiring C++ build tools.
import pymysql

pymysql.install_as_MySQLdb()

# Bypass MySQL minimum version check to allow running on MySQL 8.0.x (found 8.0.46)
from django.db.backends.mysql.base import DatabaseWrapper
DatabaseWrapper.check_database_version_supported = lambda self: None
