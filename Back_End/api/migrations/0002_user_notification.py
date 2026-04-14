from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0001_issue_comment'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "CREATE TABLE IF NOT EXISTS user_notification ("
                        "id INT AUTO_INCREMENT PRIMARY KEY, "
                        "user_id INT NOT NULL, "
                        "ticket_id INT NULL, "
                        "title VARCHAR(200) NOT NULL, "
                        "message TEXT NOT NULL, "
                        "is_read TINYINT(1) NOT NULL DEFAULT 0, "
                        "created_at DATETIME DEFAULT CURRENT_TIMESTAMP, "
                        "INDEX user_notification_user_id (user_id), "
                        "INDEX user_notification_ticket_id (ticket_id), "
                        "INDEX user_notification_is_read (is_read), "
                        "CONSTRAINT user_notification_user_fk FOREIGN KEY (user_id) "
                        "REFERENCES user_profile (id) ON DELETE CASCADE, "
                        "CONSTRAINT user_notification_ticket_fk FOREIGN KEY (ticket_id) "
                        "REFERENCES maintenance_ticket (id) ON DELETE SET NULL"
                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 "
                        "COLLATE=utf8mb4_general_ci;"
                    ),
                    reverse_sql="DROP TABLE IF EXISTS user_notification;",
                ),
            ],
            state_operations=[
                migrations.CreateModel(
                    name='UserNotification',
                    fields=[
                        ('id', models.AutoField(primary_key=True, serialize=False)),
                        ('title', models.CharField(max_length=200)),
                        ('message', models.TextField()),
                        ('is_read', models.BooleanField(default=False)),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        (
                            'user',
                            models.ForeignKey(
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name='notifications',
                                to='api.userprofile',
                            ),
                        ),
                        (
                            'ticket',
                            models.ForeignKey(
                                blank=True,
                                null=True,
                                on_delete=django.db.models.deletion.SET_NULL,
                                related_name='notifications',
                                to='api.maintenanceticket',
                            ),
                        ),
                    ],
                    options={
                        'db_table': 'user_notification',
                        'managed': True,
                    },
                ),
            ],
        ),
    ]
