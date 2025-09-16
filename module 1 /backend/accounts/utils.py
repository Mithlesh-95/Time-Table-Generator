from django.utils import timezone
from .models import UserActivityLog


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_user_agent(request):
    """Get user agent from request"""
    return request.META.get('HTTP_USER_AGENT', '')


def log_user_activity(user, action, request=None, success=True, details=None):
    """
    Log user activity
    
    Args:
        user: User instance (can be None for anonymous actions)
        action: Action type (from UserActivityLog.ACTION_CHOICES)
        request: HTTP request object
        success: Whether the action was successful
        details: Additional details as dict
    """
    ip_address = None
    user_agent = None
    
    if request:
        ip_address = get_client_ip(request)
        user_agent = get_user_agent(request)
    
    if details is None:
        details = {}
    
    UserActivityLog.objects.create(
        user=user,
        action=action,
        ip_address=ip_address,
        user_agent=user_agent,
        details=details,
        success=success,
        timestamp=timezone.now()
    )


def get_user_permissions(user):
    """
    Get user permissions based on role
    
    Args:
        user: User instance
        
    Returns:
        dict: Dictionary of permissions
    """
    if not user or not user.is_authenticated:
        return {}
    
    permissions = {
        'can_view_dashboard': True,
        'can_edit_profile': True,
        'can_change_password': True,
    }
    
    if user.role == 'super_admin':
        permissions.update({
            'can_manage_all_users': True,
            'can_create_dept_admin': True,
            'can_view_all_departments': True,
            'can_manage_departments': True,
            'can_view_activity_logs': True,
            'can_deactivate_users': True,
        })
    
    elif user.role == 'dept_admin':
        permissions.update({
            'can_manage_dept_users': True,
            'can_create_faculty': True,
            'can_create_student': True,
            'can_view_dept_activity_logs': True,
            'can_manage_dept_schedules': True,
        })
    
    elif user.role == 'faculty':
        permissions.update({
            'can_view_schedules': True,
            'can_manage_classes': True,
            'can_view_student_reports': True,
        })
    
    elif user.role == 'student':
        permissions.update({
            'can_view_own_schedule': True,
            'can_register_courses': True,
            'can_view_grades': True,
        })
    
    return permissions


def validate_role_hierarchy(requesting_user, target_role):
    """
    Validate if requesting user can create/manage users with target role
    
    Args:
        requesting_user: User making the request
        target_role: Role to be assigned/managed
        
    Returns:
        bool: True if allowed, False otherwise
    """
    if not requesting_user or not requesting_user.is_authenticated:
        return False
    
    role_hierarchy = {
        'super_admin': ['super_admin', 'dept_admin', 'faculty', 'student'],
        'dept_admin': ['faculty', 'student'],
        'faculty': [],
        'student': []
    }
    
    allowed_roles = role_hierarchy.get(requesting_user.role, [])
    return target_role in allowed_roles


def get_dashboard_stats(user):
    """
    Get dashboard statistics based on user role
    
    Args:
        user: User instance
        
    Returns:
        dict: Dashboard statistics
    """
    from .models import User, Department, UserActivityLog
    
    if not user or not user.is_authenticated:
        return {}
    
    stats = {}
    
    if user.role == 'super_admin':
        stats = {
            'total_users': User.objects.count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'inactive_users': User.objects.filter(is_active=False).count(),
            'total_departments': Department.objects.filter(is_active=True).count(),
            'recent_logins': UserActivityLog.objects.filter(
                action='login',
                success=True
            ).count(),
            'failed_logins': UserActivityLog.objects.filter(
                action='failed_login'
            ).count(),
        }
    
    elif user.role == 'dept_admin':
        dept_users = User.objects.filter(department=user.department)
        stats = {
            'department_users': dept_users.count(),
            'active_dept_users': dept_users.filter(is_active=True).count(),
            'faculty_count': dept_users.filter(role='faculty').count(),
            'student_count': dept_users.filter(role='student').count(),
        }
    
    elif user.role in ['faculty', 'student']:
        stats = {
            'department': user.get_department_display() if user.department else 'Not Assigned',
            'role': user.get_role_display(),
            'last_login': user.last_login,
        }
    
    return stats