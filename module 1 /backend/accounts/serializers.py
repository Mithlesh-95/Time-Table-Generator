from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, UserActivityLog, Department


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'department',
            'contact_number', 'employee_id', 'date_of_birth'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_employee_id(self, value):
        """Validate employee ID uniqueness if provided"""
        if value and User.objects.filter(employee_id=value).exists():
            raise serializers.ValidationError("A user with this employee ID already exists.")
        return value
    
    def validate(self, attrs):
        """Validate password confirmation and role permissions"""
        password = attrs.get('password')
        password_confirm = attrs.pop('password_confirm', None)
        
        if password != password_confirm:
            raise serializers.ValidationError({
                'password_confirm': 'Password confirmation does not match.'
            })
        
        # Validate password strength
        try:
            validate_password(password)
        except ValidationError as e:
            raise serializers.ValidationError({'password': e.messages})
        
        # Role-based validation
        role = attrs.get('role', 'student')
        request = self.context.get('request')
        
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            # Only Super Admin can create Department Admins
            if role == 'dept_admin' and not request.user.can_create_dept_admin():
                raise serializers.ValidationError({
                    'role': 'Only Super Admin can create Department Admin accounts.'
                })
            
            # Department Admins can only create Faculty and Students
            if (request.user.role == 'dept_admin' and 
                role not in ['faculty', 'student']):
                raise serializers.ValidationError({
                    'role': 'Department Admin can only create Faculty and Student accounts.'
                })
        
        return attrs
    
    def create(self, validated_data):
        """Create new user"""
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    
    username = serializers.CharField()
    password = serializers.CharField(
        style={'input_type': 'password'},
        trim_whitespace=False
    )
    
    def validate(self, attrs):
        """Validate user credentials"""
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(
                request=self.context.get('request'),
                username=username,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError(
                    'Unable to log in with provided credentials.',
                    code='authorization'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    'User account is disabled.',
                    code='authorization'
                )
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError(
                'Must include "username" and "password".',
                code='authorization'
            )


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    
    full_name = serializers.ReadOnlyField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    department_display = serializers.CharField(source='get_department_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'role', 'role_display', 'department', 
            'department_display', 'contact_number', 'employee_id',
            'date_of_birth', 'address', 'profile_picture',
            'date_joined', 'last_login', 'is_active'
        ]
        read_only_fields = ['id', 'username', 'date_joined', 'last_login']
    
    def validate_email(self, value):
        """Validate email uniqueness for updates"""
        user = self.instance
        if user and User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_employee_id(self, value):
        """Validate employee ID uniqueness for updates"""
        user = self.instance
        if (value and user and 
            User.objects.filter(employee_id=value).exclude(pk=user.pk).exists()):
            raise serializers.ValidationError("A user with this employee ID already exists.")
        return value


class UserListSerializer(serializers.ModelSerializer):
    """Serializer for user list (admin view)"""
    
    full_name = serializers.ReadOnlyField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    department_display = serializers.CharField(source='get_department_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'full_name', 'role',
            'role_display', 'department', 'department_display',
            'employee_id', 'is_active', 'date_joined', 'last_login'
        ]


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change"""
    
    old_password = serializers.CharField(style={'input_type': 'password'})
    new_password = serializers.CharField(
        style={'input_type': 'password'},
        min_length=8
    )
    new_password_confirm = serializers.CharField(style={'input_type': 'password'})
    
    def validate_old_password(self, value):
        """Validate old password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value
    
    def validate(self, attrs):
        """Validate new password confirmation"""
        new_password = attrs.get('new_password')
        new_password_confirm = attrs.get('new_password_confirm')
        
        if new_password != new_password_confirm:
            raise serializers.ValidationError({
                'new_password_confirm': 'New password confirmation does not match.'
            })
        
        # Validate password strength
        try:
            validate_password(new_password)
        except ValidationError as e:
            raise serializers.ValidationError({'new_password': e.messages})
        
        return attrs
    
    def save(self):
        """Save new password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class UserActivityLogSerializer(serializers.ModelSerializer):
    """Serializer for user activity logs"""
    
    user_display = serializers.CharField(source='user.username', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = UserActivityLog
        fields = [
            'id', 'user', 'user_display', 'action', 'action_display',
            'ip_address', 'user_agent', 'details', 'timestamp', 'success'
        ]
        read_only_fields = ['id', 'timestamp']


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for departments"""
    
    head_of_department_name = serializers.CharField(
        source='head_of_department.full_name', 
        read_only=True
    )
    
    class Meta:
        model = Department
        fields = [
            'id', 'name', 'code', 'description', 'head_of_department',
            'head_of_department_name', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']