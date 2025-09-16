from rest_framework import permissions


class IsSuperAdmin(permissions.BasePermission):
    """
    Custom permission to only allow Super Admins.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'super_admin'
        )


class IsDeptAdminOrSuperAdmin(permissions.BasePermission):
    """
    Custom permission to allow Department Admins and Super Admins.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['super_admin', 'dept_admin']
        )


class IsFacultyOrAbove(permissions.BasePermission):
    """
    Custom permission to allow Faculty, Department Admins, and Super Admins.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['super_admin', 'dept_admin', 'faculty']
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow users to edit their own profile or admins to edit any profile.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Write permissions only to the owner or admins
        return (
            obj == request.user or
            request.user.role in ['super_admin', 'dept_admin']
        )


class CanManageUsers(permissions.BasePermission):
    """
    Custom permission for user management operations.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.can_manage_users()
        )


class CanCreateDeptAdmin(permissions.BasePermission):
    """
    Custom permission to create Department Admin accounts.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.can_create_dept_admin()
        )