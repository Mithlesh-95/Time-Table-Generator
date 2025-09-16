from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe

from .models import User, UserActivityLog, Department


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User Admin"""
    
    list_display = [
        'username', 'email', 'full_name', 'role', 'department',
        'is_active', 'date_joined', 'last_login'
    ]
    
    list_filter = [
        'role', 'department', 'is_active', 'is_staff', 'is_superuser',
        'date_joined', 'last_login'
    ]
    
    search_fields = [
        'username', 'email', 'first_name', 'last_name',
        'employee_id', 'contact_number'
    ]
    
    ordering = ['-date_joined']
    
    readonly_fields = ['date_joined', 'last_login', 'created_at', 'updated_at']
    
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Personal info', {
            'fields': (
                'first_name', 'last_name', 'email', 'contact_number',
                'employee_id', 'date_of_birth', 'address', 'profile_picture'
            )
        }),
        ('Role & Department', {
            'fields': ('role', 'department')
        }),
        ('Permissions', {
            'fields': (
                'is_active', 'is_staff', 'is_superuser',
                'groups', 'user_permissions'
            ),
            'classes': ('collapse',)
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'password1', 'password2',
                'first_name', 'last_name', 'role', 'department'
            ),
        }),
    )
    
    def full_name(self, obj):
        return obj.full_name or '-'
    full_name.short_description = 'Full Name'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('department')


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    """User Activity Log Admin"""
    
    list_display = [
        'user_display', 'action', 'success', 'ip_address',
        'timestamp', 'user_agent_short'
    ]
    
    list_filter = [
        'action', 'success', 'timestamp',
        ('user', admin.RelatedOnlyFieldListFilter)
    ]
    
    search_fields = [
        'user__username', 'user__email', 'ip_address', 'user_agent'
    ]
    
    ordering = ['-timestamp']
    
    readonly_fields = [
        'user', 'action', 'ip_address', 'user_agent',
        'details', 'timestamp', 'success'
    ]
    
    date_hierarchy = 'timestamp'
    
    def user_display(self, obj):
        if obj.user:
            url = reverse('admin:accounts_user_change', args=[obj.user.pk])
            return format_html('<a href="{}">{}</a>', url, obj.user.username)
        return 'Anonymous'
    user_display.short_description = 'User'
    user_display.admin_order_field = 'user__username'
    
    def user_agent_short(self, obj):
        if obj.user_agent:
            return obj.user_agent[:50] + '...' if len(obj.user_agent) > 50 else obj.user_agent
        return '-'
    user_agent_short.short_description = 'User Agent'
    
    def has_add_permission(self, request):
        return False  # Don't allow manual creation
    
    def has_change_permission(self, request, obj=None):
        return False  # Don't allow editing
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser  # Only superuser can delete logs


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    """Department Admin"""
    
    list_display = [
        'name', 'code', 'head_of_department', 'is_active',
        'user_count', 'created_at'
    ]
    
    list_filter = ['is_active', 'created_at']
    
    search_fields = ['name', 'code', 'description']
    
    ordering = ['name']
    
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (None, {
            'fields': ('name', 'code', 'description')
        }),
        ('Management', {
            'fields': ('head_of_department', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_count(self, obj):
        count = User.objects.filter(department=obj.code).count()
        if count > 0:
            url = f"/admin/accounts/user/?department__exact={obj.code}"
            return format_html('<a href="{}">{} users</a>', url, count)
        return '0 users'
    user_count.short_description = 'Users'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('head_of_department')


# Customize admin site
admin.site.site_header = "NEP Scheduler Administration"
admin.site.site_title = "NEP Scheduler Admin"
admin.site.index_title = "Welcome to NEP Scheduler Administration"