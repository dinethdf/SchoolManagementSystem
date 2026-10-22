# apps/people/apps.py
# This file configures the people app in Django.
# The people app manages extended profiles for Students, Teachers, and Parents.

from django.apps import AppConfig


class PeopleConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.people'
    verbose_name = 'People (Students, Teachers, and Parents)'
