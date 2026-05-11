from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0004_issue_damaged_equipment'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE user_profile "
                        "ADD COLUMN email VARCHAR(100) NULL, "
                        "ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP, "
                        "ADD COLUMN last_login DATETIME NULL;"
                    ),
                    reverse_sql=(
                        "ALTER TABLE user_profile "
                        "DROP COLUMN last_login, "
                        "DROP COLUMN created_at, "
                        "DROP COLUMN email;"
                    ),
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name='userprofile',
                    name='email',
                    field=models.CharField(blank=True, max_length=100, null=True),
                ),
                migrations.AddField(
                    model_name='userprofile',
                    name='created_at',
                    field=models.DateTimeField(blank=True, null=True),
                ),
                migrations.AddField(
                    model_name='userprofile',
                    name='last_login',
                    field=models.DateTimeField(blank=True, null=True),
                ),
            ],
        ),
    ]
