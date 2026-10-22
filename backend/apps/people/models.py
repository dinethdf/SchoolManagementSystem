# apps/people/models.py
# Database models representing extended profile records for Students, Teachers, and Parents.
# Every profile is linked One-to-One with a CustomUser account from apps.authentication.

from django.db import models
from django.conf import settings
from apps.academics.models import SchoolClass


class StudentProfile(models.Model):
    """
    Detailed profile information for a student.
    Links 1-to-1 with a CustomUser whose role is 'student'.
    """

    # Valid blood group options
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    ]

    # OneToOne link to the user's login account
    # If the user account is deleted, their student profile is removed as well
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile',
        help_text="The login user account associated with this student."
    )

    # Unique school registration number (e.g., "STU-2026-001")
    admission_number = models.CharField(
        max_length=30,
        unique=True,
        help_text="Unique institutional admission ID, e.g. 'STU-2026-001'"
    )

    # Class the student is enrolled in (e.g. Grade 10-A)
    # If a class is deleted, we preserve the student record and set enrolled_class to NULL
    enrolled_class = models.ForeignKey(
        SchoolClass,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='enrolled_students',
        help_text="The classroom batch where this student is currently enrolled."
    )

    # Roll number / register index number within the class (e.g. 15)
    roll_number = models.PositiveIntegerField(
        blank=True,
        null=True,
        help_text="Student's index or roll number in the class roster."
    )

    # Date when the student was admitted to the school
    admission_date = models.DateField(
        help_text="Official enrollment date."
    )

    # Medical / blood group info
    blood_group = models.CharField(
        max_length=5,
        choices=BLOOD_GROUP_CHOICES,
        blank=True,
        null=True,
        help_text="Medical blood type."
    )

    # Emergency Contact Details
    emergency_contact_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Full name of person to contact in emergency."
    )
    emergency_contact_phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Emergency telephone number."
    )
    emergency_contact_relationship = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Relationship to student, e.g. 'Mother', 'Father', 'Uncle'"
    )

    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Record creation timestamp."
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Record last updated timestamp."
    )

    class Meta:
        ordering = ['admission_number']
        verbose_name = 'Student Profile'
        verbose_name_plural = 'Student Profiles'

    def __str__(self):
        full_name = self.user.get_full_name() or self.user.username
        class_name = self.enrolled_class.name if self.enrolled_class else "No Class"
        return f"{self.admission_number} - {full_name} ({class_name})"


class TeacherProfile(models.Model):
    """
    Detailed profile information for a teacher/faculty member.
    Links 1-to-1 with a CustomUser whose role is 'teacher'.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='teacher_profile',
        help_text="The login user account associated with this teacher."
    )

    # Unique employee identifier (e.g. "TCH-001")
    employee_id = models.CharField(
        max_length=30,
        unique=True,
        help_text="Unique employee/staff code, e.g. 'TCH-001'"
    )

    # Academic qualification (e.g. "B.Sc. Mathematics, Postgrad Diploma in Education")
    qualification = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Highest educational degree or credentials."
    )

    # Date joining the school staff
    joining_date = models.DateField(
        help_text="Date when teacher officially joined the institution."
    )

    # Academic department (e.g. "Mathematics & Computing", "Languages", "Science")
    department = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="School faculty department."
    )

    # Teaching specialization
    specialization = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        help_text="Primary subject area of expertise."
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['employee_id']
        verbose_name = 'Teacher Profile'
        verbose_name_plural = 'Teacher Profiles'

    def __str__(self):
        full_name = self.user.get_full_name() or self.user.username
        return f"{self.employee_id} - {full_name} ({self.department or 'General'})"


class ParentProfile(models.Model):
    """
    Detailed profile information for a parent or legal guardian.
    Links 1-to-1 with a CustomUser whose role is 'parent'.
    Can be associated with one or more StudentProfiles.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='parent_profile',
        help_text="The login user account associated with this parent."
    )

    # Many-to-Many connection: One parent can have multiple children enrolled in school
    children = models.ManyToManyField(
        StudentProfile,
        blank=True,
        related_name='guardians',
        help_text="Enrolled students belonging to this parent/guardian."
    )

    # Professional occupation / employer
    occupation = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Parent's profession or employment."
    )

    # Primary relationship to the student(s)
    relationship_to_child = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Relationship, e.g. 'Father', 'Mother', 'Legal Guardian'"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['user__last_name', 'user__first_name']
        verbose_name = 'Parent Profile'
        verbose_name_plural = 'Parent Profiles'

    def __str__(self):
        full_name = self.user.get_full_name() or self.user.username
        children_count = self.children.count()
        return f"Parent: {full_name} ({children_count} child/children)"
