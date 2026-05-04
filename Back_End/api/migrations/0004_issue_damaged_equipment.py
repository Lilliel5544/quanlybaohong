from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0003_issue_report'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "CREATE TABLE IF NOT EXISTS issue_damaged_equipment ("
                        "id INT AUTO_INCREMENT PRIMARY KEY, "
                        "ticket_id INT NOT NULL, "
                        "equipment_id VARCHAR(50) NOT NULL, "
                        "created_at DATETIME DEFAULT CURRENT_TIMESTAMP, "
                        "INDEX issue_damaged_equipment_ticket_id (ticket_id), "
                        "CONSTRAINT issue_damaged_equipment_ticket_fk FOREIGN KEY (ticket_id) "
                        "REFERENCES maintenance_ticket (id) ON DELETE CASCADE"
                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 "
                        "COLLATE=utf8mb4_general_ci;"
                    ),
                    reverse_sql="DROP TABLE IF EXISTS issue_damaged_equipment;",
                ),
            ],
            state_operations=[
                migrations.CreateModel(
                    name='IssueDamagedEquipment',
                    fields=[
                        ('id', models.AutoField(primary_key=True, serialize=False)),
                        ('equipment_id', models.CharField(max_length=50)),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        (
                            'ticket',
                            models.ForeignKey(
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name='damaged_equipment',
                                to='api.maintenanceticket',
                            ),
                        ),
                    ],
                    options={
                        'db_table': 'issue_damaged_equipment',
                        'managed': True,
                    },
                ),
            ],
        ),
    ]
