# apps/authentication/models.py
# This file defines our database models for user accounts in the School Management System.

from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Custom user model extending Django's built-in AbstractUser.
    
    Why extend AbstractUser?
    - We get proven security features for free (password hashing, authentication logic, sessions).
    - We add a 'role' field so each user is clearly identified as Admin, Teacher, Student, or Parent.
    - We can attach profile details like phone number, profile photo, and address directly to the user.
    """

    # -------------------------------------------------------------------------
    # Role Constants — Clean, human-readable choices for user roles
    # -------------------------------------------------------------------------
    ROLE_ADMIN = 'admin'
    ROLE_TEACHER = 'teacher'
    ROLE_STUDENT = 'student'
    ROLE_PARENT = 'parent'

    # Choices tuple: first element is saved in the database, second is shown in the UI/admin
    ROLE_CHOICES = [
        (ROLE_ADMIN, 'School Admin'),
        (ROLE_TEACHER, 'Teacher'),
        (ROLE_STUDENT, 'Student'),
        (ROLE_PARENT, 'Parent / Guardian'),
    ]

    # -------------------------------------------------------------------------
    # Custom Fields
    # -------------------------------------------------------------------------

    # The user's role determines their permissions across the application
    role = models.CharField(
        max_length=15,
        choices=ROLE_CHOICES,
        default=ROLE_STUDENT,
        help_text="The system role assigned to this user."
    )

    # Optional contact phone number
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Contact telephone number."
    )

    # Optional residential address
    address = models.TextField(
        blank=True,
        null=True,
        help_text="Residential physical address."
    )

    # Optional date of birth
    date_of_birth = models.DateField(
        blank=True,
        null=True,
        help_text="User's date of birth."
    )

    # User profile picture stored in media/profile_pictures/
    # We use FileField so it accepts avatar images (JPG, PNG) reliably on all operating systems
    profile_picture = models.FileField(
        upload_to='profile_pictures/',
        blank=True,
        null=True,
        help_text="Optional profile avatar photo (JPG, PNG)."
    )

    # Timestamp tracking when the user account was created
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the account was registered."
    )

    # Timestamp tracking when the user account was last updated
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when the account was last modified."
    )

    # -------------------------------------------------------------------------
    # Helper Properties & Methods
    # -------------------------------------------------------------------------

    def is_school_admin(self):
        """Returns True if this user has the admin role."""
        return self.role == self.ROLE_ADMIN

    def is_school_teacher(self):
        """Returns True if this user has the teacher role."""
        return self.role == self.ROLE_TEACHER

    def is_school_student(self):
        """Returns True if this user has the student role."""
        return self.role == self.ROLE_STUDENT

    def is_school_parent(self):
        """Returns True if this user has the parent role."""
        return self.role == self.ROLE_PARENT

    def __str__(self):
        """
        String representation of the user in admin panels and logs.
        Example: "John Doe (teacher) - jsmith"
        """
        user_full_name = self.get_full_name()
        if user_full_name:
            return f"{user_full_name} ({self.role}) - {self.username}"
        return f"{self.username} ({self.role})"
