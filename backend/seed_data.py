"""
Seed Initial Demo Data for School Management System

Creates initial test accounts for viva/presentation demonstration:
- Admin:   username: admin    / password: adminpassword123
- Teacher: username: teacher1 / password: teacherpassword123
- Student: username: student1 / password: studentpassword123
- Class:   Grade 10-A (Academic Year 2026-2027)
"""
import os
from datetime import date
import django

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'schoolms.settings')
django.setup()

from apps.authentication.models import CustomUser
from apps.academics.models import SchoolClass, Subject
from apps.people.models import TeacherProfile, StudentProfile

def seed():
    print("🌱 Starting database seeding...")

    # 1. Create Admin User
    admin_user, created = CustomUser.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@schoolms.edu',
            'first_name': 'Super',
            'last_name': 'Admin',
            'role': CustomUser.ROLE_ADMIN,
            'is_staff': True,
            'is_superuser': True,
        }
    )
    if created:
        admin_user.set_password('adminpassword123')
        admin_user.save()
        print("✅ Admin user created: admin / adminpassword123")
    else:
        print("ℹ️ Admin user already exists.")

    # 2. Create Teacher User & Profile
    teacher_user, created = CustomUser.objects.get_or_create(
        username='teacher1',
        defaults={
            'email': 'teacher1@schoolms.edu',
            'first_name': 'Sarah',
            'last_name': 'Connor',
            'role': CustomUser.ROLE_TEACHER,
            'is_staff': True,
        }
    )
    if created:
        teacher_user.set_password('teacherpassword123')
        teacher_user.save()
        print("✅ Teacher user created: teacher1 / teacherpassword123")
    
    teacher_profile, created = TeacherProfile.objects.get_or_create(
        user=teacher_user,
        defaults={
            'employee_id': 'EMP-001',
            'qualification': 'M.Sc. Mathematics',
            'department': 'Mathematics',
            'specialization': 'Algebra & Geometry',
            'joining_date': date(2024, 1, 15),
        }
    )
    if created:
        print("✅ Teacher profile created: EMP-001")

    # 3. Create Class: Grade 10-A
    school_class, created = SchoolClass.objects.get_or_create(
        grade_level=10,
        section='A',
        academic_year='2026-2027',
        defaults={
            'name': 'Grade 10-A',
            'room_number': 'Room 101',
            'class_teacher': teacher_user,
        }
    )
    if created:
        print("✅ Class created: Grade 10-A")

    # 4. Create Subject: Mathematics
    subject, created = Subject.objects.get_or_create(
        code='MATH-10',
        school_class=school_class,
        defaults={
            'name': 'Mathematics',
            'description': 'Advanced High School Algebra and Geometry',
            'teacher': teacher_user,
            'periods_per_week': 5,
        }
    )
    if created:
        print("✅ Subject created: Mathematics (MATH-10)")

    # 5. Create Student User & Profile
    student_user, created = CustomUser.objects.get_or_create(
        username='student1',
        defaults={
            'email': 'student1@schoolms.edu',
            'first_name': 'John',
            'last_name': 'Doe',
            'role': CustomUser.ROLE_STUDENT,
        }
    )
    if created:
        student_user.set_password('studentpassword123')
        student_user.save()
        print("✅ Student user created: student1 / studentpassword123")

    student_profile, created = StudentProfile.objects.get_or_create(
        user=student_user,
        defaults={
            'admission_number': 'STU-2026-001',
            'roll_number': '101',
            'enrolled_class': school_class,
            'admission_date': date(2024, 9, 1),
            'blood_group': 'O+',
            'emergency_contact_name': 'Jane Doe',
            'emergency_contact_phone': '+1234567890',
        }
    )
    if created:
        print("✅ Student profile created: STU-2026-001")

    print("🎉 Database seeding completed successfully!")

if __name__ == '__main__':
    seed()
