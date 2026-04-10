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
