from rest_framework import serializers
from .models import Department, Faculty, Room, Student, Subject, Section, Expertise


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = "__all__"


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"


class FacultySerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source="department", write_only=True
    )

    class Meta:
        model = Faculty
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "department",
            "department_id",
            "qualifications",
            "experience_years",
            "workload_capacity_hours",
            "availability",
            "preferences",
        ]


class StudentSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source="department", write_only=True
    )

    class Meta:
        model = Student
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "enrollment_no",
            "department",
            "department_id",
            "current_semester",
            "major_subjects",
            "minor_subjects",
            "elective_preferences",
            "credit_requirements",
        ]


class SectionSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source="department", write_only=True
    )

    class Meta:
        model = Section
        fields = ["id", "department", "department_id", "semester", "name", "size"]
