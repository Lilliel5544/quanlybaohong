from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0002_user_notification'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "CREATE TABLE IF NOT EXISTS issue_report ("
                        "id INT AUTO_INCREMENT PRIMARY KEY, "
                        "ticket_id INT NOT NULL, "
                        "reporter_id INT NOT NULL, "
                        "created_at DATETIME DEFAULT CURRENT_TIMESTAMP, "
                        "INDEX issue_report_ticket_id (ticket_id), "
                        "INDEX issue_report_reporter_id (reporter_id), "
                        "CONSTRAINT issue_report_ticket_fk FOREIGN KEY (ticket_id) "
                        "REFERENCES maintenance_ticket (id) ON DELETE CASCADE, "
                        "CONSTRAINT issue_report_reporter_fk FOREIGN KEY (reporter_id) "
                        "REFERENCES user_profile (id) ON DELETE CASCADE"
                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 "
                        "COLLATE=utf8mb4_general_ci;"
                    ),
                    reverse_sql="DROP TABLE IF EXISTS issue_report;",
                ),
            ],
            state_operations=[
                migrations.CreateModel(
                    name='IssueReport',
                    fields=[
                        ('id', models.AutoField(primary_key=True, serialize=False)),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        (
                            'ticket',
                            models.ForeignKey(
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name='reports',
                                to='api.maintenanceticket',
                            ),
                        ),
                        (
                            'reporter',
                            models.ForeignKey(
                                on_delete=django.db.models.deletion.DO_NOTHING,
                                related_name='issue_reports',
                                to='api.userprofile',
                            ),
                        ),
                    ],
                    options={
                        'db_table': 'issue_report',
                        'managed': True,
                    },
                ),
            ],
        ),
    ]
