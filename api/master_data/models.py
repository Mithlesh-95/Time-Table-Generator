from django.db import models


class College(models.Model):
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} - {self.name}"


class Department(models.Model):
    name = models.CharField(max_length=200, unique=True)
    code = models.CharField(max_length=20, unique=True)
    college = models.ForeignKey(
        College, on_delete=models.CASCADE, related_name="departments", null=True, blank=True
    )

    class Meta:
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"


class Faculty(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    department = models.ForeignKey(
        Department, on_delete=models.CASCADE, related_name="faculties")
    qualifications = models.CharField(max_length=255, blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    workload_capacity_hours = models.PositiveIntegerField(default=16)
    availability = models.JSONField(default=dict, blank=True)
    preferences = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Room(models.Model):
    ROOM_TYPES = (
        ("lecture", "Lecture"),
        ("lab", "Laboratory"),
        ("seminar", "Seminar"),
    )
    number = models.CharField(max_length=50, unique=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES)
    capacity = models.PositiveIntegerField()
    equipment = models.JSONField(default=list, blank=True)
    constraints = models.JSONField(default=dict, blank=True)
    department = models.ForeignKey(
        'Department', on_delete=models.CASCADE, related_name="rooms", null=True, blank=True
    )

    class Meta:
        ordering = ['number']

    def __str__(self):
        return f"{self.number} ({self.room_type})"


class Student(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    enrollment_no = models.CharField(max_length=50, unique=True)
    department = models.ForeignKey(
        Department, on_delete=models.SET_NULL, null=True, related_name="students")
    current_semester = models.CharField(max_length=20)
    major_subjects = models.JSONField(default=list, blank=True)
    minor_subjects = models.JSONField(default=list, blank=True)
    elective_preferences = models.JSONField(default=list, blank=True)
    credit_requirements = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['enrollment_no']

    def __str__(self):
        return f"{self.enrollment_no} - {self.first_name} {self.last_name}"


class Subject(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    category = models.CharField(
        max_length=50, help_text="NEP category: Major/Minor/SEC/VAC/AEC")
    credits_theory = models.PositiveIntegerField(default=0)
    credits_practical = models.PositiveIntegerField(default=0)
    prerequisites = models.ManyToManyField(
        "self", symmetrical=False, blank=True)
    departments = models.ManyToManyField(
        Department, related_name="subjects", blank=True)

    class Meta:
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"


class Expertise(models.Model):
    faculty = models.ForeignKey(
        Faculty, on_delete=models.CASCADE, related_name="expertise")
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="experts")

    class Meta:
        unique_together = ("faculty", "subject")


class Section(models.Model):
    department = models.ForeignKey(
        Department, on_delete=models.CASCADE, related_name="sections")
    semester = models.CharField(max_length=20)
    name = models.CharField(max_length=50)
    size = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("department", "semester", "name")
        ordering = ['department__code', 'semester', 'name']

    def __str__(self):
        return f"{self.department.code}-{self.semester}-{self.name}"
