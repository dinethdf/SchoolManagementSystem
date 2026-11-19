# apps/assignments/urls.py
# URL routing configuration for the assignments application.
# Maps URL endpoints to corresponding DRF class-based views.

from django.urls import path
from . import views

# All routes in this file are prefixed with /api/assignments/
urlpatterns = [
    # Teacher/Admin: List all assignments or create a new assignment
    # Example: GET /api/assignments/ or POST /api/assignments/
    path('', views.AssignmentListCreateView.as_view(), name='assignment-list-create'),

    # Teacher/Admin: Retrieve, update, or archive a specific assignment
    # Example: GET /api/assignments/1/ or PUT /api/assignments/1/
    path('<int:assignment_id>/', views.AssignmentDetailView.as_view(), name='assignment-detail'),

    # Teacher/Admin: View all student submissions for an assignment
    # Example: GET /api/assignments/1/submissions/
    path('<int:assignment_id>/submissions/', views.AssignmentSubmissionsView.as_view(), name='assignment-submissions'),

    # Teacher/Admin: Grade an individual student's submission
    # Example: POST /api/assignments/1/grade/5/
    path('<int:assignment_id>/grade/<int:submission_id>/', views.GradeSubmissionView.as_view(), name='grade-submission'),

    # Student: View all homework assigned to the student's enrolled class
    # Example: GET /api/assignments/my-assignments/
    path('my-assignments/', views.StudentMyAssignmentsView.as_view(), name='student-my-assignments'),

    # Student: Submit solution or essay text for an assignment
    # Example: POST /api/assignments/1/submit/
    path('<int:assignment_id>/submit/', views.StudentSubmitView.as_view(), name='student-submit'),

    # Parent: View homework tasks and submission statuses for all linked children
    # Example: GET /api/assignments/my-children/
    path('my-children/', views.ParentChildAssignmentsView.as_view(), name='parent-children-assignments'),
]
