# apps/grades/urls.py
# URL routing for the Grades app.
# Each URL pattern maps a URL path to a specific view class.

from django.urls import path
from . import views

# All these URLs are prefixed with /api/grades/ (set in schoolms/urls.py)
urlpatterns = [
    # Teacher/Admin: List all assessments OR create a new assessment
    # Example: GET /api/grades/assessments/ or POST /api/grades/assessments/
    path('assessments/', views.AssessmentListCreateView.as_view(), name='grades-assessment-list-create'),

    # Teacher/Admin: View details of a single assessment
    # Example: GET /api/grades/assessments/3/
    path('assessments/<int:assessment_id>/', views.AssessmentDetailView.as_view(), name='grades-assessment-detail'),

    # Teacher/Admin: Enter marks for all students in an assessment at once
    # Example: POST /api/grades/records/bulk/
    path('records/bulk/', views.BulkEnterGradesView.as_view(), name='grades-bulk-enter'),

    # Teacher/Admin: View all grades for a specific student
    # Example: GET /api/grades/student/5/
    path('student/<int:student_id>/', views.StudentGradeHistoryView.as_view(), name='grades-student-history'),

    # Teacher/Admin: View the full report card for a specific student
    # Example: GET /api/grades/student/5/report-card/
    path('student/<int:student_id>/report-card/', views.StudentReportCardView.as_view(), name='grades-student-report-card'),

    # Student: View own grades
    # Example: GET /api/grades/my-grades/
    path('my-grades/', views.MyGradesView.as_view(), name='grades-my-grades'),

    # Student: View own report card with GPA
    # Example: GET /api/grades/my-report-card/
    path('my-report-card/', views.MyReportCardView.as_view(), name='grades-my-report-card'),

    # Parent: View grades for all linked children
    # Example: GET /api/grades/my-children-grades/
    path('my-children-grades/', views.MyChildrenGradesView.as_view(), name='grades-my-children-grades'),
]
