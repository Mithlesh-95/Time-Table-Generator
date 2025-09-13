#!/usr/bin/env python
"""
Sample data creation script for teammates
Run this after setting up the database to get sample data
"""
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
    rooms_data = [
        {"number": "101", "room_type": "lecture", "capacity": 60},
        {"number": "102", "room_type": "lecture", "capacity": 50},
        {"number": "LAB1", "room_type": "lab", "capacity": 30},
        {"number": "LAB2", "room_type": "lab", "capacity": 25},
        {"number": "SEM1", "room_type": "seminar", "capacity": 40},
    ]

    for room_data in rooms_data:
        Room.objects.get_or_create(
            number=room_data["number"],
            defaults=room_data
        )

    print(f"Created rooms: {Room.objects.count()}")

    # Create faculty
    faculty_data = [
        {"first_name": "John", "last_name": "Doe",
            "email": "john.doe@college.edu", "department": cs_dept},
        {"first_name": "Jane", "last_name": "Smith",
            "email": "jane.smith@college.edu", "department": cs_dept},
        {"first_name": "Bob", "last_name": "Wilson",
            "email": "bob.wilson@college.edu", "department": ee_dept},
        {"first_name": "Alice", "last_name": "Brown",
            "email": "alice.brown@college.edu", "department": me_dept},
    ]

    for fac_data in faculty_data:
        Faculty.objects.get_or_create(
            email=fac_data["email"],
            defaults=fac_data
        )

    print(f"Created faculty: {Faculty.objects.count()}")

    # Create subjects
    subjects_data = [
        {"code": "CS101", "name": "Programming Fundamentals",
            "category": "Major", "credits_theory": 3, "credits_practical": 1},
        {"code": "CS201", "name": "Data Structures", "category": "Major",
            "credits_theory": 3, "credits_practical": 1},
        {"code": "EE101", "name": "Circuit Analysis", "category": "Major",
            "credits_theory": 3, "credits_practical": 0},
        {"code": "ME101", "name": "Engineering Drawing", "category": "Major",
            "credits_theory": 2, "credits_practical": 2},
        {"code": "ENG101", "name": "English Communication",
            "category": "AEC", "credits_theory": 2, "credits_practical": 0},
    ]

    for subj_data in subjects_data:
        Subject.objects.get_or_create(
            code=subj_data["code"],
            defaults=subj_data
        )

    print(f"Created subjects: {Subject.objects.count()}")

    # Create sections
    sections_data = [
        {"department": cs_dept, "semester": "Sem-1", "name": "A", "size": 60},
        {"department": cs_dept, "semester": "Sem-1", "name": "B", "size": 55},
        {"department": cs_dept, "semester": "Sem-3", "name": "A", "size": 58},
        {"department": ee_dept, "semester": "Sem-1", "name": "A", "size": 50},
        {"department": me_dept, "semester": "Sem-1", "name": "A", "size": 45},
    ]

    for sect_data in sections_data:
        Section.objects.get_or_create(
            department=sect_data["department"],
            semester=sect_data["semester"],
            name=sect_data["name"],
            defaults=sect_data
        )

    print(f"Created sections: {Section.objects.count()}")

    # Create sample students
    students_data = [
        {"first_name": "Student1", "last_name": "CS", "email": "student1@college.edu",
            "enrollment_no": "CS2023001", "department": cs_dept, "current_semester": "Sem-1"},
        {"first_name": "Student2", "last_name": "CS", "email": "student2@college.edu",
            "enrollment_no": "CS2023002", "department": cs_dept, "current_semester": "Sem-1"},
        {"first_name": "Student3", "last_name": "EE", "email": "student3@college.edu",
            "enrollment_no": "EE2023001", "department": ee_dept, "current_semester": "Sem-1"},
        {"first_name": "Student4", "last_name": "ME", "email": "student4@college.edu",
            "enrollment_no": "ME2023001", "department": me_dept, "current_semester": "Sem-1"},
    ]

    for stud_data in students_data:
        Student.objects.get_or_create(
            enrollment_no=stud_data["enrollment_no"],
            defaults=stud_data
        )

    print(f"Created students: {Student.objects.count()}")

    print("\n✅ Sample data created successfully!")
    print("Your teammates can now see departments, faculty, students, rooms, subjects, and sections.")


if __name__ == "__main__":
    create_sample_data()
