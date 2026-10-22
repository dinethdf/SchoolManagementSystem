# apps/demo/urls.py
# URL routes for the backend learning demo endpoints.
# All paths here are prefixed with /api/demo/ in schoolms/urls.py.

from django.urls import path
from . import views

urlpatterns = [
    # GET /api/demo/ — Overview of all demo endpoints
    path('', views.DemoOverviewView.as_view(), name='demo-overview'),

    # POST /api/demo/calculate-gpa/ — Math calculation & validation demo
    path('calculate-gpa/', views.CalculateGpaView.as_view(), name='demo-calculate-gpa'),

    # POST /api/demo/check-eligibility/ — Business rule checking demo
    path('check-eligibility/', views.CheckExamEligibilityView.as_view(), name='demo-check-eligibility'),

    # GET & POST /api/demo/notes/ — In-memory list storage demo
    path('notes/', views.QuickNotesMemoryView.as_view(), name='demo-notes'),
]
