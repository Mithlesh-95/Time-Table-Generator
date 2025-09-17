from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from master_data.models import College
from .models import UserProfile

User = get_user_model()


class RegistrationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    # Accept role in a flexible way; normalize to "admin"/"superadmin"
    role = serializers.CharField()
    # Make college optional to avoid breaking registration when not provided by UI
    college_id = serializers.PrimaryKeyRelatedField(
        queryset=College.objects.all(), write_only=True, required=False, allow_null=True
    )

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        # Validate using Django's password validators
        validate_password(attrs["password"])  # will raise if invalid
        # Normalize role
        role_val = str(attrs.get("role", "")).strip().lower()
        if role_val in {"superadmin", "super admin", "super_admin"}:
            attrs["role"] = "superadmin"
        elif role_val in {"admin"}:
            attrs["role"] = "admin"
        else:
            raise serializers.ValidationError({"role": "Role must be 'admin' or 'superadmin'"})
        # Enforce unique email/username (email is used as username)
        email = attrs.get("email")
        if email:
            if User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
                raise serializers.ValidationError({"email": "An account with this email already exists. Please sign in."})
        return attrs

    def create(self, validated_data):
        name = validated_data.pop("name")
        email = validated_data.pop("email")
        password = validated_data.pop("password")
        validated_data.pop("confirm_password", None)
        role = validated_data.pop("role")
        college = validated_data.pop("college_id", None)

        # Split name into first_name/last_name (best-effort)
        parts = name.strip().split()
        first_name = parts[0]
        last_name = " ".join(parts[1:]) if len(parts) > 1 else ""

        username = email  # use email as username
        # Create strictly new user (duplicate handled in validate)
        user = User(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=email,
        )
        user.set_password(password)
        user.save()

        # Ensure profile exists and set role and college
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.is_superadmin = role == "superadmin"
        profile.is_admin = role == "admin" or profile.is_superadmin
        profile.college = college
        profile.save()

        return user


class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = ["id", "name", "code"]


class MeSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    college = CollegeSerializer(source="profile.college", read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email", "role", "college"]

    def get_role(self, obj):
        if hasattr(obj, "profile") and obj.profile.is_superadmin:
            return "superadmin"
        if hasattr(obj, "profile") and obj.profile.is_admin:
            return "admin"
        return "user"
