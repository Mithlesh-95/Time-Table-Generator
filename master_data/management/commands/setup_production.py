"""
Management command to set up initial data for production deployment.
Run this after deploying to Render to populate the database with sample data.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
import os

User = get_user_model()


class Command(BaseCommand):
    help = 'Set up initial data for production deployment'

    def add_arguments(self, parser):
        parser.add_argument(
            '--create-superuser',
            action='store_true',
            help='Create a superuser account',
        )
        parser.add_argument(
            '--load-sample-data',
            action='store_true',
            help='Load sample data (departments, faculty, etc.)',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS(
                '🚀 Setting up Time-Table-Generator for production...')
        )

        try:
            with transaction.atomic():
                if options['create_superuser']:
                    self.create_superuser()

                if options['load_sample_data']:
                    self.load_sample_data()

                self.stdout.write(
                    self.style.SUCCESS(
                        '✅ Production setup completed successfully!')
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Setup failed: {str(e)}')
            )
            raise

    def create_superuser(self):
        """Create a superuser if one doesn't exist."""
        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(
                self.style.WARNING('⚠️  Superuser already exists, skipping...')
            )
            return

        # Try to get credentials from environment or use defaults
        username = os.environ.get('ADMIN_USERNAME', 'admin')
        email = os.environ.get('ADMIN_EMAIL', 'admin@timetable.com')
        password = os.environ.get('ADMIN_PASSWORD', 'admin123')

        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )

        self.stdout.write(
            self.style.SUCCESS(f'✅ Superuser created: {username}')
        )

        if password == 'admin123':
            self.stdout.write(
                self.style.WARNING(
                    '⚠️  Default password used! Please change it immediately in admin panel.'
                )
            )

    def load_sample_data(self):
        """Load sample data using existing management command."""
        from django.core.management import call_command

        try:
            # This calls your existing add_timetable_data command
            call_command('add_timetable_data')
            self.stdout.write(
                self.style.SUCCESS('✅ Sample data loaded successfully')
            )
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f'⚠️  Could not load sample data: {str(e)}')
            )
            self.stdout.write(
                self.style.WARNING(
                    'You can load it manually later with: python manage.py add_timetable_data')
            )
