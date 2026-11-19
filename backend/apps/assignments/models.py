# apps/assignments/models.py
# This file defines two database models for the Assignments feature:
#   1. Assignment  - Represents a homework, classwork, or project assigned by a teacher.
#   2. Submission  - Represents an individual student's response, score, and teacher feedback.

from django.db import models
from django.conf import settings
from apps.academics.models import SchoolClass, Subject
from apps.people.models import StudentProfile


class Assignment(models.Model):
    """
    Represents an assignment, homework, or project assigned to a specific class.
    
    Example:
      - Title: "Chapter 5 Trigonometry Problem Set"
      - Type: "homework"
      - Subject: Mathematics
      - Class: Grade 10-A
      - Due Date: 2026-11-20
      - Max Marks: 20
      - Created By: Teacher Sarah Connor
    """

    # -------------------------------------------------------------------------
    # Assignment Type Choices
    # -------------------------------------------------------------------------
    TYPE_HOMEWORK = 'homework'
    TYPE_CLASSWORK = 'classwork'
    TYPE_PROJECT = 'project'

    ASSIGNMENT_TYPE_CHOICES = [
        (TYPE_HOMEWORK, 'Homework'),
        (TYPE_CLASSWORK, 'Classwork'),
        (TYPE_PROJECT, 'Project'),
    ]

    # -------------------------------------------------------------------------
    # Core Fields
    # -------------------------------------------------------------------------

    # Clear, descriptive title of the assignment
    title = models.CharField(
        max_length=200,
        help_text="Title or topic of the assignment, e.g. 'Chapter 5 Practice Problems'."
    )

    # Detailed instructions, prompt, or questions for the students
    description = models.TextField(
        help_text="Detailed instructions or questions that students need to answer."
    )

    # Which academic subject this assignment belongs to
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='assignments',
        help_text="The subject for which this assignment was created."
    )

    # Which classroom batch is given this assignment
    school_class = models.ForeignKey(
        SchoolClass,
        on_delete=models.CASCADE,
        related_name='assignments',
        help_text="The class of students who must complete this assignment."
    )

    # The teacher or administrator who posted this assignment
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_assignments',
        help_text="The teacher who created and posted this assignment."
    )

    # The deadline by which the assignment must be submitted
    due_date = models.DateField(
        help_text="The final date by which students should submit their work."
    )

    # Maximum score achievable (e.g., 20 marks, 50 marks, 100 marks)
    max_marks = models.PositiveIntegerField(
        help_text="Highest possible score a student can earn on this assignment."
    )

    # Classification of the assignment
    assignment_type = models.CharField(
        max_length=20,
        choices=ASSIGNMENT_TYPE_CHOICES,
        default=TYPE_HOMEWORK,
        help_text="Category of assignment: homework, classwork, or project."
    )

    # Active status allows a teacher to hide or close an old assignment
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this assignment is actively visible to students."
    )

    # Automatic audit timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the assignment was first created."
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="When the assignment was last updated."
    )

    class Meta:
        ordering = ['-due_date', '-created_at']
        verbose_name = 'Assignment'
        verbose_name_plural = 'Assignments'

    def __str__(self):
        # Human-readable string representation for admin and console logs
        return f"{self.title} - {self.subject.name} ({self.school_class.name})"


class Submission(models.Model):
    """
    Stores an individual student's submission for an assignment,
    along with the marks obtained, feedback, and grading status.
    
    Status Lifecycle:
      1. 'pending'   -> Assignment posted, student has not yet submitted.
      2. 'submitted' -> Student submitted answer on or before the due date.
      3. 'late'      -> Student submitted answer after the due date.
      4. 'graded'    -> Teacher reviewed the submission and awarded marks.
    """

    # -------------------------------------------------------------------------
    # Submission Status Choices
    # -------------------------------------------------------------------------
    STATUS_PENDING = 'pending'
    STATUS_SUBMITTED = 'submitted'
    STATUS_LATE = 'late'
    STATUS_GRADED = 'graded'

    SUBMISSION_STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_SUBMITTED, 'Submitted'),
        (STATUS_LATE, 'Late Submission'),
        (STATUS_GRADED, 'Graded'),
    ]

    # -------------------------------------------------------------------------
    # Core Fields
    # -------------------------------------------------------------------------

    # The assignment this submission answers
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='submissions',
        help_text="The assignment that this student submission belongs to."
    )

    # The enrolled student profile who submitted this response
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='assignment_submissions',
        help_text="The student who submitted this work."
    )

    # The text-based solution or answer typed by the student
    submission_text = models.TextField(
        blank=True,
        null=True,
        help_text="The written answer or solution provided by the student."
    )

    # Current lifecycle status of this submission
    status = models.CharField(
        max_length=20,
        choices=SUBMISSION_STATUS_CHOICES,
        default=STATUS_PENDING,
        help_text="Current state: pending, submitted, late, or graded."
    )

    # Exact date and time when the student pressed submit
    submitted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when the student turned in their submission."
    )

    # Marks awarded by the teacher (e.g. 18.5 out of 20)
    marks_obtained = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Marks awarded by the teacher after grading."
    )

    # Optional constructive feedback or comments from the teacher
    teacher_feedback = models.TextField(
        blank=True,
        null=True,
        help_text="Teacher's written feedback or notes on the submission."
    )

    # Date and time when the teacher finalized grading
    graded_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when the teacher graded this submission."
    )

    # Which teacher reviewed and graded this submission
    graded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='graded_submissions',
        help_text="The teacher who evaluated and graded this submission."
    )

    # Automatic audit timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the submission record was first initialized."
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when this submission record was last modified."
    )

    class Meta:
        # A student can only have ONE submission record per assignment
        unique_together = [['assignment', 'student']]
        ordering = ['-submitted_at', '-created_at']
        verbose_name = 'Submission'
        verbose_name_plural = 'Submissions'

    def __str__(self):
        # Format: "John Doe - Chapter 5 Practice Problems (Submitted)"
        student_name = self.student.user.get_full_name() or self.student.user.username
        return f"{student_name} - {self.assignment.title} ({self.get_status_display()})"
