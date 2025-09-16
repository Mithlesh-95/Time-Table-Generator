from django.core.management.base import BaseCommand
from master_data.models import Department, Faculty, Student, Room, Subject, Section


class Command(BaseCommand):
    help = 'Create sample data for development'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')

        # Create departments
        cs_dept, created = Department.objects.get_or_create(
            code="CS",
            defaults={"name": "Computer Science"}
        )
        if created:
            self.stdout.write(f'Created department: {cs_dept.name}')

        ee_dept, created = Department.objects.get_or_create(
            code="EE",
            defaults={"name": "Electrical Engineering"}
        )
        if created:
            self.stdout.write(f'Created department: {ee_dept.name}')

        me_dept, created = Department.objects.get_or_create(
            code="ME",
            defaults={"name": "Mechanical Engineering"}
        )
        if created:
            self.stdout.write(f'Created department: {me_dept.name}')

        # Create rooms
        rooms_data = [
            {"number": "101", "room_type": "lecture", "capacity": 60},
            {"number": "102", "room_type": "lecture", "capacity": 50},
            {"number": "LAB1", "room_type": "lab", "capacity": 30},
            {"number": "LAB2", "room_type": "lab", "capacity": 25},
            {"number": "SEM1", "room_type": "seminar", "capacity": 40},
        ]

        for room_data in rooms_data:
            room, created = Room.objects.get_or_create(
                number=room_data["number"],
                defaults=room_data
            )
            if created:
                self.stdout.write(f'Created room: {room.number}')

        # Create subjects
        subjects_data = [
            {"code": "CS101", "name": "Programming Fundamentals",
                "category": "Major", "credits_theory": 3, "credits_practical": 1},
            {"code": "CS201", "name": "Data Structures", "category": "Major",
                "credits_theory": 4, "credits_practical": 0},
            {"code": "CS301", "name": "Algorithms", "category": "Major",
                "credits_theory": 3, "credits_practical": 1},
            {"code": "EE101", "name": "Circuit Theory", "category": "Major",
                "credits_theory": 4, "credits_practical": 0},
            {"code": "ME101", "name": "Thermodynamics", "category": "Major",
                "credits_theory": 3, "credits_practical": 1},
        ]

        for subject_data in subjects_data:
            subject, created = Subject.objects.get_or_create(
                code=subject_data["code"],
                defaults=subject_data
            )
            if created:
                self.stdout.write(
                    f'Created subject: {subject.code} - {subject.name}')

        # Create faculty
        faculty_data = [
            {"employee_id": "F001", "name": "Dr. John Smith",
                "email": "john.smith@university.edu", "department": cs_dept, "experience_years": 5},
            {"employee_id": "F002", "name": "Dr. Jane Doe", "email": "jane.doe@university.edu",
                "department": ee_dept, "experience_years": 8},
            {"employee_id": "F003", "name": "Prof. Mike Johnson",
                "email": "mike.johnson@university.edu", "department": me_dept, "experience_years": 12},
            {"employee_id": "F004", "name": "Dr. Sarah Wilson",
                "email": "sarah.wilson@university.edu", "department": cs_dept, "experience_years": 6},
        ]

        for faculty_info in faculty_data:
            faculty, created = Faculty.objects.get_or_create(
                employee_id=faculty_info["employee_id"],
                defaults=faculty_info
            )
            if created:
                self.stdout.write(f'Created faculty: {faculty.name}')

        # Create students
        students_data = [
            {"roll_number": "CS2101", "name": "Alice Brown",
                "email": "alice.brown@student.edu", "department": cs_dept, "semester": "Sem-3"},
            {"roll_number": "CS2102", "name": "Bob White",
                "email": "bob.white@student.edu", "department": cs_dept, "semester": "Sem-3"},
            {"roll_number": "EE2101", "name": "Charlie Green",
                "email": "charlie.green@student.edu", "department": ee_dept, "semester": "Sem-3"},
            {"roll_number": "ME2101", "name": "Diana Blue",
                "email": "diana.blue@student.edu", "department": me_dept, "semester": "Sem-3"},
        ]

        for student_info in students_data:
            student, created = Student.objects.get_or_create(
                roll_number=student_info["roll_number"],
                defaults=student_info
            )
            if created:
                self.stdout.write(f'Created student: {student.name}')

        # Create sections
        sections_data = [
            {"department": cs_dept, "semester": "Sem-3", "name": "A", "size": 60},
            {"department": cs_dept, "semester": "Sem-3", "name": "B", "size": 55},
            {"department": ee_dept, "semester": "Sem-3", "name": "A", "size": 50},
            {"department": me_dept, "semester": "Sem-3", "name": "A", "size": 45},
        ]

        for section_info in sections_data:
            section, created = Section.objects.get_or_create(
                department=section_info["department"],
                semester=section_info["semester"],
                name=section_info["name"],
                defaults=section_info
            )
            if created:
                self.stdout.write(
                    f'Created section: {section.department.code} {section.semester} {section.name}')

        # Print summary
        self.stdout.write(
            self.style.SUCCESS(
                f'Sample data creation completed!\n'
                f'Departments: {Department.objects.count()}\n'
                f'Rooms: {Room.objects.count()}\n'
                f'Subjects: {Subject.objects.count()}\n'
                f'Faculty: {Faculty.objects.count()}\n'
                f'Students: {Student.objects.count()}\n'
                f'Sections: {Section.objects.count()}'
            )
        )
