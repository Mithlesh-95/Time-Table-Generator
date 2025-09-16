from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """Custom User model with role-based access control"""
    
    ROLE_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('dept_admin', 'Department Admin'),
        ('faculty', 'Faculty'),
        ('student', 'Student'),
    ]
    
    DEPARTMENT_CHOICES = [
        ('computer_science', 'Computer Science'),
        ('electrical', 'Electrical Engineering'),
        ('mechanical', 'Mechanical Engineering'),
        ('civil', 'Civil Engineering'),
        ('mathematics', 'Mathematics'),
        ('physics', 'Physics'),
        ('chemistry', 'Chemistry'),
        ('english', 'English'),
        ('management', 'Management'),
    ]
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student',
        help_text='User role in the system'
    )
    
    department = models.CharField(
        max_length=30,
        choices=DEPARTMENT_CHOICES,
        blank=True,
        null=True,
        help_text='Department the user belongs to'
    )
    
    contact_number = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        help_text='Contact phone number'
    )
    
    employee_id = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        unique=True,
        help_text='Employee/Student ID'
    )
    
    date_of_birth = models.DateField(
        blank=True,
        null=True,
        help_text='Date of birth'
    )
    
    address = models.TextField(
        blank=True,
        null=True,
        help_text='Full address'
    )
    
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        blank=True,
        null=True,
        help_text='Profile picture'
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text='Designates whether this user should be treated as active.'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'auth_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def can_manage_users(self):
        """Check if user can manage other users"""
        return self.role in ['super_admin', 'dept_admin']
    
    def can_create_dept_admin(self):
        """Only Super Admin can create Department Admins"""
        return self.role == 'super_admin'
    
    def can_view_all_departments(self):
        """Check if user can view all departments"""
        return self.role == 'super_admin'


class UserActivityLog(models.Model):
    """Model to track user activities"""
    
    ACTION_CHOICES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('failed_login', 'Failed Login'),
        ('password_change', 'Password Change'),
        ('profile_update', 'Profile Update'),
        ('account_created', 'Account Created'),
        ('account_deactivated', 'Account Deactivated'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='activity_logs',
        null=True,
        blank=True
    )
    
    action = models.CharField(
        max_length=20,
        choices=ACTION_CHOICES,
        help_text='Type of action performed'
    )
    
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text='IP address from which action was performed'
    )
    
    user_agent = models.TextField(
        blank=True,
        null=True,
        help_text='Browser/device information'
    )
    
    details = models.JSONField(
        default=dict,
        blank=True,
        help_text='Additional details about the action'
    )
    
    timestamp = models.DateTimeField(
        default=timezone.now,
        help_text='When the action was performed'
    )
    
    success = models.BooleanField(
        default=True,
        help_text='Whether the action was successful'
    )
    
    class Meta:
        db_table = 'user_activity_logs'
        verbose_name = 'User Activity Log'
        verbose_name_plural = 'User Activity Logs'
        ordering = ['-timestamp']
    
    def __str__(self):
        user_info = self.user.username if self.user else 'Anonymous'
        return f"{user_info} - {self.get_action_display()} at {self.timestamp}"


class Department(models.Model):
    """Department model for organizing users"""
    
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text='Department name'
    )
    
    code = models.CharField(
        max_length=10,
        unique=True,
        help_text='Department code (e.g., CS, EE, ME)'
    )
    
    description = models.TextField(
        blank=True,
        null=True,
        help_text='Department description'
    )
    
    head_of_department = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='headed_departments',
        limit_choices_to={'role__in': ['dept_admin', 'faculty']},
        help_text='Head of the department'
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text='Whether the department is active'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'departments'
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.code})"