# apps/grades/models.py
# This file defines two models:
#   1. Assessment  — represents an exam, quiz, or assignment event
#   2. GradeRecord — stores the marks a student scored in an assessment

from django.db import models
from django.conf import settings
from apps.academics.models import SchoolClass, Subject
from apps.people.models import StudentProfile


class Assessment(models.Model):
    """
    Represents a graded assessment event — an exam, quiz, midterm, or assignment.

    Example:
      - Name: "Midterm Exam 2026"
      - Type: midterm
      - Subject: Mathematics
      - Class: Grade 10-A
      - Max Marks: 100
      - Date: 2026-11-15
    """

    # ---------------------------------------------------------------
    # Assessment Type Choices
    # ---------------------------------------------------------------
    TYPE_QUIZ = 'quiz'
    TYPE_MIDTERM = 'midterm'
    TYPE_FINAL = 'final'
    TYPE_ASSIGNMENT = 'assignment'

    ASSESSMENT_TYPE_CHOICES = [
        (TYPE_QUIZ,       'Quiz'),
        (TYPE_MIDTERM,    'Midterm Exam'),
        (TYPE_FINAL,      'Final Exam'),
        (TYPE_ASSIGNMENT, 'Assignment'),
    ]

    # ---------------------------------------------------------------
    # Core Fields
    # ---------------------------------------------------------------

    # Descriptive title for this assessment (e.g., "Midterm Exam — October 2026")
    name = models.CharField(
        max_length=200,
        help_text="Name of this assessment, e.g. 'Midterm Exam 2026'."
    )

    # The type of assessment — determines how grades are weighted
    assessment_type = models.CharField(
        max_length=20,
        choices=ASSESSMENT_TYPE_CHOICES,
        default=TYPE_QUIZ,
        help_text="Category of assessment: quiz, midterm, final, or assignment."
    )

    # Which subject this assessment belongs to
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='assessments',
        help_text="The subject being assessed."
    )

    # Which class is taking this assessment
    school_class = models.ForeignKey(
        SchoolClass,
        on_delete=models.CASCADE,
        related_name='assessments',
        help_text="The class/batch this assessment is for."
    )

    # The highest possible score (e.g., 100 for an exam, 20 for a quiz)
    max_marks = models.PositiveIntegerField(
        help_text="Maximum marks a student can score in this assessment."
    )

    # The date when the assessment was or will be held
    assessment_date = models.DateField(
        help_text="Date this assessment was conducted."
    )

    # The academic year this assessment belongs to (e.g., "2026-2027")
    academic_year = models.CharField(
        max_length=20,
        help_text="Academic year, e.g. '2026-2027'."
    )

    # Which teacher or admin created this assessment record
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_assessments',
        help_text="The teacher or admin who added this assessment."
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-assessment_date']
        verbose_name = 'Assessment'
        verbose_name_plural = 'Assessments'

    def __str__(self):
        return f"{self.name} — {self.subject.name} ({self.school_class.name})"


class GradeRecord(models.Model):
    """
    Stores a single student's marks and letter grade for one specific assessment.

    Example:
      - Assessment: Midterm Exam 2026
      - Student: John Doe
      - Marks Obtained: 85 out of 100
      - Letter Grade: B (auto-calculated)
    """

    # ---------------------------------------------------------------
    # Letter Grade Choices
    # ---------------------------------------------------------------
    GRADE_A = 'A'
    GRADE_B = 'B'
    GRADE_C = 'C'
    GRADE_D = 'D'
    GRADE_F = 'F'

    LETTER_GRADE_CHOICES = [
        (GRADE_A, 'A — Excellent (90%+)'),
        (GRADE_B, 'B — Good (80–89%)'),
        (GRADE_C, 'C — Average (70–79%)'),
        (GRADE_D, 'D — Below Average (60–69%)'),
        (GRADE_F, 'F — Fail (Below 60%)'),
    ]

    # ---------------------------------------------------------------
    # Core Fields
    # ---------------------------------------------------------------

    # Which assessment this grade record belongs to
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name='grade_records',
        help_text="The assessment this mark belongs to."
    )

    # The student who took the assessment
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='grade_records',
        help_text="The student whose marks are being recorded."
    )

    # How many marks the student actually scored
    # DecimalField allows fractional scores like 87.5
    marks_obtained = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Actual score the student achieved."
    )

    # The letter grade — automatically set when the record is saved
    letter_grade = models.CharField(
        max_length=2,
        choices=LETTER_GRADE_CHOICES,
        blank=True,
        help_text="Letter grade automatically calculated from marks_obtained and max_marks."
    )

    # Optional teacher comment (e.g., "Excellent improvement since last term")
    remarks = models.TextField(
        blank=True,
        null=True,
        help_text="Optional teacher remarks or feedback for the student."
    )

    # Which teacher entered this grade
    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='grades_entered',
        help_text="The teacher or admin who entered these marks."
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # A student can only have one grade record per assessment
        unique_together = [['assessment', 'student']]
        ordering = ['-assessment__assessment_date']
        verbose_name = 'Grade Record'
        verbose_name_plural = 'Grade Records'

    def calculate_letter_grade(self):
        """
        Automatically work out the letter grade by comparing marks_obtained to max_marks.

        Grading Scale:
          90% and above  → A
          80% to 89%     → B
          70% to 79%     → C
          60% to 69%     → D
          Below 60%      → F
        """
        # Avoid dividing by zero if max_marks is somehow 0
        if self.assessment.max_marks == 0:
            return self.GRADE_F

        # Calculate the percentage scored
        percentage = (float(self.marks_obtained) / float(self.assessment.max_marks)) * 100

        # Assign letter grade based on the percentage range
        if percentage >= 90:
            return self.GRADE_A
        elif percentage >= 80:
            return self.GRADE_B
        elif percentage >= 70:
            return self.GRADE_C
        elif percentage >= 60:
            return self.GRADE_D
        else:
            return self.GRADE_F

    def save(self, *args, **kwargs):
        """
        Override the default save method to automatically set the letter_grade
        before the record is written to the database.
        This means every time a grade record is created or updated,
        the letter grade will always be correct — no manual input needed.
        """
        # Calculate and set the letter grade before saving
        self.letter_grade = self.calculate_letter_grade()

        # Now call the original save() to write to the database
        super().save(*args, **kwargs)

    def __str__(self):
        student_name = self.student.user.get_full_name() or self.student.user.username
        return f"{student_name} | {self.assessment.name} | {self.marks_obtained}/{self.assessment.max_marks} ({self.letter_grade})"
