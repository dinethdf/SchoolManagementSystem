# apps/demo/views.py
# ==============================================================================
# BACKEND LEARNING SAMPLES (NO DATABASE REQUIRED)
# ==============================================================================
# This file contains 4 beginner-friendly sample endpoints to help you understand
# how a backend operates purely on Python logic:
#   1. DemoOverviewView        -> An index page explaining available demo APIs
#   2. CalculateGpaView        -> Pure mathematical calculation & validation
#   3. CheckExamEligibilityView -> Business rules decision-making
#   4. QuickNotesMemoryView    -> In-memory list storage (server state)
# ==============================================================================

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny


class DemoOverviewView(APIView):
    """
    Endpoint: GET /api/demo/
    Purpose: A welcome directory explaining the demo endpoints and how to test them.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "message": "Welcome to the Backend Learning Demo!",
            "description": "These endpoints demonstrate how a backend receives data, calculates results, and returns responses without requiring any database.",
            "available_endpoints": [
                {
                    "endpoint": "GET /api/demo/",
                    "purpose": "View this guide."
                },
                {
                    "endpoint": "POST /api/demo/calculate-gpa/",
                    "purpose": "Calculate average marks and academic standing.",
                    "sample_request_body": {
                        "marks": [85, 72, 90, 68]
                    }
                },
                {
                    "endpoint": "POST /api/demo/check-eligibility/",
                    "purpose": "Check if a student can sit for exams based on rules.",
                    "sample_request_body": {
                        "student_name": "Kamal Perera",
                        "attendance_percentage": 82.5,
                        "fees_paid": True
                    }
                },
                {
                    "endpoint": "GET & POST /api/demo/notes/",
                    "purpose": "Read and add quick temporary notes stored in server memory.",
                    "sample_post_body": {
                        "author": "Mr. Silva",
                        "note_content": "School starts at 7:30 AM tomorrow."
                    }
                }
            ]
        })


class CalculateGpaView(APIView):
    """
    Endpoint: POST /api/demo/calculate-gpa/
    Purpose: Accepts a list of numeric marks, calculates average and standing.
    
    Shows:
    - How the backend extracts data from request.data
    - How it validates input (rejects empty lists, non-numbers)
    - How Python loops and calculations are performed
    - How HTTP status codes (200 OK vs 400 Bad Request) are returned
    """
    permission_classes = [AllowAny]

    def post(self, request):
        # Step 1: Read the marks list from incoming data
        marks_list = request.data.get('marks')

        # Step 2: Validate that marks were actually provided
        if marks_list is None:
            return Response(
                {
                    "success": False,
                    "error": "Missing 'marks' field. Please send a list of numeric scores, e.g. [75, 80, 92]."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Step 3: Validate that marks is a list and not empty
        if not isinstance(marks_list, list) or len(marks_list) == 0:
            return Response(
                {
                    "success": False,
                    "error": "The 'marks' field must be a non-empty list of numbers."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Step 4: Validate each mark and calculate the sum using a beginner-friendly loop
        total_marks_sum = 0
        for single_mark in marks_list:
            # Check if each item is a valid number
            if not isinstance(single_mark, (int, float)):
                return Response(
                    {
                        "success": False,
                        "error": f"Invalid mark value '{single_mark}'. All marks must be numbers."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if mark is within normal 0-100 range
            if single_mark < 0 or single_mark > 100:
                return Response(
                    {
                        "success": False,
                        "error": f"Mark {single_mark} is out of range. Marks must be between 0 and 100."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            total_marks_sum = total_marks_sum + single_mark

        # Step 5: Compute the average score
        number_of_subjects = len(marks_list)
        calculated_average = total_marks_sum / number_of_subjects

        # Step 6: Determine academic performance level
        if calculated_average >= 75:
            academic_standing = "Distinction (A)"
        elif calculated_average >= 65:
            academic_standing = "Very Good (B)"
        elif calculated_average >= 55:
            academic_standing = "Credit (C)"
        elif calculated_average >= 45:
            academic_standing = "Simple Pass (S)"
        else:
            academic_standing = "Fail (F)"

        # Step 7: Return clean structured JSON response
        return Response(
            {
                "success": True,
                "total_subjects": number_of_subjects,
                "total_score": total_marks_sum,
                "average_score": round(calculated_average, 2),
                "academic_standing": academic_standing,
                "is_passed": calculated_average >= 45
            },
            status=status.HTTP_200_OK
        )


class CheckExamEligibilityView(APIView):
    """
    Endpoint: POST /api/demo/check-eligibility/
    Purpose: Checks whether a student is eligible to sit for final exams.
    
    Shows:
    - How business logic rules are enforced securely on the backend
    - How multiple conditions (attendance >= 80% AND school fees paid) are checked
    """
    permission_classes = [AllowAny]

    def post(self, request):
        # Step 1: Extract student parameters
        student_name = request.data.get('student_name', 'Anonymous Student')
        attendance_percentage = request.data.get('attendance_percentage')
        fees_paid = request.data.get('fees_paid')

        # Step 2: Validate required fields
        if attendance_percentage is None or fees_paid is None:
            return Response(
                {
                    "success": False,
                    "error": "Both 'attendance_percentage' (number) and 'fees_paid' (true/false) are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Step 3: Check business rules
        # Rule 1: Attendance must be at least 80%
        # Rule 2: School fees must be settled
        reasons_for_ineligibility = []

        if attendance_percentage < 80.0:
            reasons_for_ineligibility.append(
                f"Attendance is {attendance_percentage}%, which is below the mandatory 80% requirement."
            )

        if fees_paid is not True:
            reasons_for_ineligibility.append(
                "School term fees are outstanding and must be cleared before exam admission."
            )

        # Step 4: Determine final status
        is_eligible = len(reasons_for_ineligibility) == 0

        if is_eligible:
            final_verdict = "Eligible for Examinations"
        else:
            final_verdict = "Not Eligible for Examinations"

        # Step 5: Return response
        return Response(
            {
                "success": True,
                "student_name": student_name,
                "attendance_percentage": attendance_percentage,
                "fees_paid": fees_paid,
                "verdict": final_verdict,
                "is_eligible": is_eligible,
                "issues": reasons_for_ineligibility
            },
            status=status.HTTP_200_OK
        )


# ==============================================================================
# IN-MEMORY LIST (Demonstrating server state without a database)
# ==============================================================================
# This Python list stays alive in the server's memory while the server runs.
# When the server restarts, this resets to initial sample items.
IN_MEMORY_NOTES_STORAGE = [
    {
        "id": 1,
        "author": "Principal Office",
        "note_content": "Term 2 exams will begin next Monday."
    },
    {
        "id": 2,
        "author": "Sports Department",
        "note_content": "Annual athletic meet practice resumes on Thursday afternoon."
    }
]


class QuickNotesMemoryView(APIView):
    """
    Endpoint:
      - GET /api/demo/notes/   -> View all stored notes
      - POST /api/demo/notes/  -> Add a new note to the list
    
    Shows:
    - How a backend can store, retrieve, and append data
    - The difference between HTTP GET (reading) and HTTP POST (creating)
    """
    permission_classes = [AllowAny]

    def get(self, request):
        """Returns all currently stored notes."""
        return Response(
            {
                "success": True,
                "total_notes": len(IN_MEMORY_NOTES_STORAGE),
                "notes": IN_MEMORY_NOTES_STORAGE
            },
            status=status.HTTP_200_OK
        )

    def post(self, request):
        """Adds a new note to the in-memory list."""
        author_name = request.data.get('author', 'Anonymous')
        note_content = request.data.get('note_content')

        # Validate that note_content is present
        if not note_content or str(note_content).strip() == "":
            return Response(
                {
                    "success": False,
                    "error": "The 'note_content' field cannot be blank."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate a simple sequential ID
        next_id = len(IN_MEMORY_NOTES_STORAGE) + 1

        new_note_entry = {
            "id": next_id,
            "author": author_name,
            "note_content": str(note_content).strip()
        }

        # Append to our in-memory storage list
        IN_MEMORY_NOTES_STORAGE.append(new_note_entry)

        return Response(
            {
                "success": True,
                "message": "New note added successfully to server memory!",
                "created_note": new_note_entry,
                "total_notes_now": len(IN_MEMORY_NOTES_STORAGE)
            },
            status=status.HTTP_201_CREATED
        )
