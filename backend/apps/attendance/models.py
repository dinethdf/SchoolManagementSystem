# apps/attendance/models.py
# This file defines the Attendance database model.
# Each record represents one student's attendance status for one class on one specific day.

from django.db import models
from django.conf import settings
from apps.academics.models import SchoolClass, Subject
from apps.people.models import StudentProfile


class Attendance(models.Model):
    """
    Stores the daily attendance record for a student in a specific class.

    Example record:
      - Student: John Doe
      - Class: Grade 10-A
      - Date: 2026-10-23
      - Status: present
      - Marked by: Teacher Sarah Connor
    """

    # ---------------------------------------------------------------
    # Status Choices — what state the student was in on this day
    # ---------------------------------------------------------------
    STATUS_PRESENT = 'present'
    STATUS_ABSENT = 'absent'
    STATUS_LATE = 'late'
    STATUS_EXCUSED = 'excused'

    ATTENDANCE_STATUS_CHOICES = [
        (STATUS_PRESENT, 'Present'),   # Student attended on time
        (STATUS_ABSENT,  'Absent'),    # Student did not attend
        (STATUS_LATE,    'Late'),      # Student arrived after class started
        (STATUS_EXCUSED, 'Excused'),   # Absence is officially excused (e.g., medical)
    ]

    # ---------------------------------------------------------------
    # Core Fields
    # ---------------------------------------------------------------

    # Which student this record belongs to
    # If the student profile is deleted, their attendance records are also removed
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='attendance_records',
        help_text="The student whose attendance is being recorded."
    )

    # Which class session this record is for
    # If the class is deleted, attendance records for it are also removed
    school_class = models.ForeignKey(
        SchoolClass,
        on_delete=models.CASCADE,
        related_name='attendance_records',
        help_text="The classroom/batch this attendance entry belongs to."
    )

    # Optional: which specific subject (for subject-wise attendance tracking)
    # blank=True, null=True means this field is not required
    subject = models.ForeignKey(
        Subject,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='attendance_records',
        help_text="Optional: the specific subject period this record is for."
    )

    # The calendar date of this attendance entry (e.g., 2026-10-23)
    date = models.DateField(
        help_text="The date when attendance was taken."
    )

    # Whether the student was present, absent, late, or excused
    status = models.CharField(
        max_length=10,
        choices=ATTENDANCE_STATUS_CHOICES,
        default=STATUS_PRESENT,
        help_text="Attendance status: present / absent / late / excused."
    )

    # Which teacher/admin marked this attendance entry
    # If the teacher user is deleted, their marked records are preserved with NULL
    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='attendance_marked',
        help_text="The teacher or admin who recorded this attendance entry."
    )

    # Optional text note from the teacher (e.g., "Left early due to sports event")
    remarks = models.TextField(
        blank=True,
        null=True,
        help_text="Optional comments or reason for absence/late."
    )

    # Automatically record when this entry was created
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when this attendance record was first created."
    )

    # Automatically update when this entry is modified
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when this attendance record was last changed."
    )

    class Meta:
        # Prevent duplicate entries: one student can only have ONE record per class per day
        # This means a teacher cannot accidentally mark the same student twice in the same class
        unique_together = [['student', 'school_class', 'date']]

        # Show the most recent attendance records first in queries
        ordering = ['-date', 'student']

        verbose_name = 'Attendance Record'
        verbose_name_plural = 'Attendance Records'

    def __str__(self):
        # Human-readable display, e.g.: "John Doe | Grade 10-A | 2026-10-23 | present"
        student_name = self.student.user.get_full_name() or self.student.user.username
        class_name = self.school_class.name
        return f"{student_name} | {class_name} | {self.date} | {self.status}"
