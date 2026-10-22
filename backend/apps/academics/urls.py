# apps/academics/urls.py
# URL configuration for the Academics app.
# All routes defined here are prefixed with /api/academics/ in schoolms/urls.py.

from django.urls import path
from . import views

urlpatterns = [
    # -------------------------------------------------------------------------
    # School Class Endpoints
    # -------------------------------------------------------------------------
    # GET /api/academics/classes/         -> List all classes
    # POST /api/academics/classes/        -> Create a new class (Admin only)
    path('classes/', views.SchoolClassListCreateView.as_view(), name='class-list-create'),

    # GET /api/academics/classes/<id>/    -> View single class details
    # PATCH /api/academics/classes/<id>/  -> Edit a class (Admin only)
    # DELETE /api/academics/classes/<id>/ -> Delete a class (Admin only)
    path('classes/<int:class_id>/', views.SchoolClassDetailView.as_view(), name='class-detail'),

    # GET /api/academics/classes/<id>/subjects/ -> List all subjects in a specific class
    path('classes/<int:class_id>/subjects/', views.ClassSubjectsListView.as_view(), name='class-subjects-list'),

    # -------------------------------------------------------------------------
    # Subject Endpoints
    # -------------------------------------------------------------------------
    # GET /api/academics/subjects/        -> List all subjects
    # POST /api/academics/subjects/       -> Create a new subject (Admin only)
    path('subjects/', views.SubjectListCreateView.as_view(), name='subject-list-create'),

    # GET /api/academics/subjects/<id>/   -> View single subject details
    # PATCH /api/academics/subjects/<id>/ -> Edit a subject (Admin only)
    # DELETE /api/academics/subjects/<id>/-> Delete a subject (Admin only)
    path('subjects/<int:subject_id>/', views.SubjectDetailView.as_view(), name='subject-detail'),
]
