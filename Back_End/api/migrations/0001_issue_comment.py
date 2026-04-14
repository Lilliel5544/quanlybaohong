from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "CREATE TABLE IF NOT EXISTS issue_comment ("
                        "id INT AUTO_INCREMENT PRIMARY KEY, "
                        "ticket_id INT NOT NULL, "
                        "user_id INT NOT NULL, "
                        "comment TEXT NOT NULL, "
                        "created_at DATETIME DEFAULT CURRENT_TIMESTAMP, "
                        "INDEX issue_comment_ticket_id (ticket_id), "
                        "INDEX issue_comment_user_id (user_id), "
                        "CONSTRAINT issue_comment_ticket_fk FOREIGN KEY (ticket_id) "
                        "REFERENCES maintenance_ticket (id) ON DELETE CASCADE, "
                        "CONSTRAINT issue_comment_user_fk FOREIGN KEY (user_id) "
                        "REFERENCES user_profile (id) ON DELETE CASCADE"
                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 "
                        "COLLATE=utf8mb4_general_ci;"
                    ),
                    reverse_sql="DROP TABLE IF EXISTS issue_comment;",
                ),
            ],
            state_operations=[
                migrations.CreateModel(
                    name='UserProfile',
                    fields=[
                        ('id', models.AutoField(primary_key=True, serialize=False)),
                        ('user_id', models.IntegerField(unique=True)),
                        ('username', models.CharField(max_length=50, unique=True)),
                        ('password', models.CharField(max_length=255)),
                        ('full_name', models.CharField(max_length=100)),
                        ('role', models.CharField(max_length=20)),
                        ('is_active', models.BooleanField(default=True)),
                        ('phone_no', models.CharField(blank=True, max_length=15, null=True)),
                    ],
                    options={
                        'managed': False,
                        'db_table': 'user_profile',
                    },
                ),
                migrations.CreateModel(
                    name='LectureHall',
                    fields=[
                        ('id', models.AutoField(primary_key=True, serialize=False)),
                        ('hall_name', models.CharField(max_length=50)),
                        ('block', models.CharField(max_length=20)),
                        ('floor', models.IntegerField(blank=True, null=True)),
                        ('campus', models.CharField(max_length=50)),
                    ],
                    options={
                        'managed': False,
                        'db_table': 'lecture_hall',
                    },
                ),
                migrations.CreateModel(
                    name='MaintenanceTicket',
                    fields=[
                        ('id', models.AutoField(primary_key=True, serialize=False)),
                        ('equipment_type', models.CharField(max_length=100)),
                        ('description', models.TextField()),
                        ('image_proof', models.CharField(blank=True, max_length=255, null=True)),
                        ('status', models.CharField(max_length=20)),
                        ('priority', models.CharField(max_length=20)),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        ('updated_at', models.DateTimeField(auto_now=True)),
                        (
                            'reporter',
                            models.ForeignKey(
                                db_column='reporter_id',
                                on_delete=django.db.models.deletion.DO_NOTHING,
                                related_name='reported_tickets',
                                to='api.userprofile',
                            ),
                        ),
                        (
                            'hall',
                            models.ForeignKey(
                                db_column='hall_id',
                                on_delete=django.db.models.deletion.DO_NOTHING,
                                related_name='tickets',
                                to='api.lecturehall',
                            ),
                        ),
                        (
                            'technician',
                            models.ForeignKey(
                                blank=True,
                                db_column='technician_id',
                                null=True,
                                on_delete=django.db.models.deletion.DO_NOTHING,
                                related_name='assigned_tickets',
                                to='api.userprofile',
                            ),
                        ),
                    ],
                    options={
                        'managed': False,
                        'db_table': 'maintenance_ticket',
                    },
                ),
                migrations.CreateModel(
                    name='IssueComment',
                    fields=[
                        ('id', models.AutoField(primary_key=True, serialize=False)),
                        ('comment', models.TextField()),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        (
                            'ticket',
                            models.ForeignKey(
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name='comments',
                                to='api.maintenanceticket',
                            ),
                        ),
                        (
                            'user',
                            models.ForeignKey(
                                on_delete=django.db.models.deletion.DO_NOTHING,
                                related_name='issue_comments',
                                to='api.userprofile',
                            ),
                        ),
                    ],
                    options={
                        'db_table': 'issue_comment',
                        'managed': True,
                    },
                ),
            ],
        ),
    ]
