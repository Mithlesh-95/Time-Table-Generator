#!/usr/bin/env python
from master_data.models import Department, Faculty, Student, Room, Subject, Section
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ttg.settings')
django.setup()


def create_sample_data():
    """Create sample data for development"""

    # Create departments
    cs_dept = Department.objects.get_or_create(
        code="CS",
        defaults={"name": "Computer Science"}
    )[0]

    ee_dept = Department.objects.get_or_create(
        code="EE",
        defaults={"name": "Electrical Engineering"}
    )[0]

    me_dept = Department.objects.get_or_create(
        code="ME",
        defaults={"name": "Mechanical Engineering"}
    )[0]

    print(f"Created departments: {Department.objects.count()}")

    # Create rooms
    Room.objects.get_or_create(
        number="101",
        defaults={"room_type": "lecture", "capacity": 60}
    )
    Room.objects.get_or_create(
        number="102",
        defaults={"room_type": "lecture", "capacity": 50}
    )
    Room.objects.get_or_create(
        number="LAB1",
        defaults={"room_type": "lab", "capacity": 30}
    )

    print(f"Created rooms: {Room.objects.count()}")

    # Create subjects
    Subject.objects.get_or_create(
        code="CS101",
        defaults={
            "name": "Programming Fundamentals",
            "category": "Major",
            "credits_theory": 3,
            "credits_practical": 1
        }
    )
    Subject.objects.get_or_create(
        code="CS201",
        defaults={
            "name": "Data Structures",
            "category": "Major",
            "credits_theory": 4,
            "credits_practical": 0
        }
    )

    print(f"Created subjects: {Subject.objects.count()}")

    # Create faculty
    Faculty.objects.get_or_create(
        employee_id="F001",
        defaults={
            "name": "Dr. John Smith",
            "email": "john.smith@university.edu",
            "department": cs_dept,
            "experience_years": 5
        }
    )
    Faculty.objects.get_or_create(
        employee_id="F002",
        defaults={
            "name": "Dr. Jane Doe",
            "email": "jane.doe@university.edu",
            "department": ee_dept,
            "experience_years": 8
        }
    )

    print(f"Created faculty: {Faculty.objects.count()}")

    print("Sample data created successfully!")


if __name__ == "__main__":
    create_sample_data()
