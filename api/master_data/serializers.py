from rest_framework import serializers
from .models import Department, Faculty, Room, Student, Subject, Section, Expertise, College


class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = "__all__"


class DepartmentSerializer(serializers.ModelSerializer):
    college = CollegeSerializer(read_only=True)
    college_id = serializers.PrimaryKeyRelatedField(
        queryset=College.objects.all(), source="college", write_only=True, required=False, allow_null=True
    )
    class Meta:
        model = Department
        fields = [
            "id",
            "name",
            "code",
            "college",
            "college_id",
        ]


class RoomSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source="department", write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Room
        fields = [
            "id",
            "number",
            "room_type",
            "capacity",
            "equipment",
            "constraints",
            "department",
            "department_id",
        ]


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
        fields = ["id", "department", "department_id",
                  "semester", "name", "size"]
