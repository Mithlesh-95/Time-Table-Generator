from django.contrib import admin
from django.contrib.auth import get_user_model

from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "is_superadmin", "is_admin", "college")
    list_filter = ("is_superadmin", "is_admin", "college")
    search_fields = ("user__username", "user__email", "college")


User = get_user_model()

# Optionally, show profile inline within User admin if desired
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    fk_name = "user"
    extra = 0


# If using the default UserAdmin, we can try to augment it dynamically
try:
    from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

    class UserAdmin(BaseUserAdmin):
        inlines = [UserProfileInline]

    admin.site.unregister(User)
    admin.site.register(User, UserAdmin)
except Exception:
    # In case the default User admin isn't registered yet in this environment
    pass
