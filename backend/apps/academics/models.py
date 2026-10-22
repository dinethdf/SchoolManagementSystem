# apps/academics/models.py
# This file defines the database models for Classes and Subjects.
# Every student belongs to a SchoolClass, and every SchoolClass has multiple Subjects.

from django.db import models
from django.conf import settings


class SchoolClass(models.Model):
    """
    Represents a classroom/batch in the school.
    Example: Grade 10 - Section A for the 2026/2027 academic year.
    """

    # Human-friendly class name (e.g., "Grade 10-A")
    name = models.CharField(
        max_length=50,
        help_text="Descriptive name of the class, e.g. 'Grade 10-A'"
    )

    # Numeric grade level (e.g. 10 for Grade 10, 11 for Grade 11)
    grade_level = models.PositiveIntegerField(
        help_text="Numeric grade level, e.g. 1, 2 ... 12, 13"
    )

    # Section identifier (e.g. "A", "B", "C")
    section = models.CharField(
        max_length=10,
        help_text="Class division section letter or name, e.g. 'A', 'B'"
    )

    # The school year this class belongs to (e.g. "2026/2027")
    academic_year = models.CharField(
        max_length=20,
        help_text="Academic year session, e.g. '2026/2027'"
    )

    # Optional physical classroom or hall number
    room_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Physical room number, e.g. 'Hall-3B' or 'Room 12'"
    )

    # The main teacher responsible for this class
    # If a teacher leaves the school, we set this field to NULL instead of deleting the class
    class_teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_classes',
        help_text="The teacher assigned as class master/teacher for this class."
    )

    # Automatically record when the class was created and last modified
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when this class was added."
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when this class was last updated."
    )

    class Meta:
        # A school cannot have two 'Grade 10-A' classes in the exact same academic year
        unique_together = ('grade_level', 'section', 'academic_year')
        ordering = ['grade_level', 'section']
        verbose_name = 'School Class'
        verbose_name_plural = 'School Classes'

    def __str__(self):
        # How the class appears in drop-downs and admin lists
        return f"{self.name} ({self.academic_year})"

    def get_subject_count(self):
        """Helper method returning the total number of subjects taught in this class."""
        return self.subjects.count()


class Subject(models.Model):
    """
    Represents an academic subject taught in a specific class.
    Example: Mathematics (Code: MATH-10) taught in Grade 10-A.
    """

    # Subject name (e.g., "Mathematics", "Science", "History")
    name = models.CharField(
        max_length=100,
        help_text="Subject title, e.g. 'Mathematics'"
    )

    # Unique subject code (e.g., "MATH-10A")
    code = models.CharField(
        max_length=30,
        help_text="Subject course code, e.g. 'MATH-10A'"
    )

    # Optional description of the subject curriculum
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Optional syllabus summary or course description."
    )

    # Which school class offers this subject
    # If the class is deleted, all its subject offerings are removed as well
    school_class = models.ForeignKey(
        SchoolClass,
        on_delete=models.CASCADE,
        related_name='subjects',
        help_text="The class where this subject is taught."
    )

    # Which teacher teaches this subject in this class
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='teaching_subjects',
        help_text="Teacher who conducts lectures for this subject."
    )

    # Number of class periods per week (e.g. 5 periods)
    periods_per_week = models.PositiveIntegerField(
        default=5,
        help_text="Weekly scheduled lecture periods."
    )

    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when this subject was created."
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when this subject was last updated."
    )

    class Meta:
        # A class cannot have two subjects with the same subject code
        unique_together = ('code', 'school_class')
        ordering = ['name']
        verbose_name = 'Subject'
        verbose_name_plural = 'Subjects'

    def __str__(self):
        return f"{self.name} - {self.school_class.name} ({self.code})"
