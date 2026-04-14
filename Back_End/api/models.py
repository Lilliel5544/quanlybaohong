from django.db import models


class UserProfile(models.Model):
	ROLE_CHOICES = [
		('Giảng viên', 'Giảng viên'),
		('Sinh viên', 'Sinh viên'),
		('Kỹ thuật viên', 'Kỹ thuật viên'),
		('Admin', 'Admin'),
	]

	id = models.AutoField(primary_key=True)
	user_id = models.IntegerField(unique=True)
	username = models.CharField(max_length=50, unique=True)
	password = models.CharField(max_length=255)
	full_name = models.CharField(max_length=100)
	role = models.CharField(max_length=20, choices=ROLE_CHOICES)
	is_active = models.BooleanField(default=True)
	phone_no = models.CharField(max_length=15, null=True, blank=True)

	class Meta:
		managed = False
		db_table = 'user_profile'


class LectureHall(models.Model):
	id = models.AutoField(primary_key=True)
	hall_name = models.CharField(max_length=50)
	block = models.CharField(max_length=20)
	floor = models.IntegerField(null=True, blank=True)
	campus = models.CharField(max_length=50)

	class Meta:
		managed = False
		db_table = 'lecture_hall'


class MaintenanceTicket(models.Model):
	STATUS_CHOICES = [
		('Chờ tiếp nhận', 'Chờ tiếp nhận'),
		('Đang xử lý', 'Đang xử lý'),
		('Đã sửa xong', 'Đã sửa xong'),
		('Từ chối', 'Từ chối'),
	]

	PRIORITY_CHOICES = [
		('Thấp', 'Thấp'),
		('Trung bình', 'Trung bình'),
		('Cao', 'Cao'),
		('Khẩn cấp', 'Khẩn cấp'),
	]

	id = models.AutoField(primary_key=True)
	reporter = models.ForeignKey(
		UserProfile,
		on_delete=models.DO_NOTHING,
		db_column='reporter_id',
		related_name='reported_tickets',
	)
	hall = models.ForeignKey(
		LectureHall,
		on_delete=models.DO_NOTHING,
		db_column='hall_id',
		related_name='tickets',
	)
	technician = models.ForeignKey(
		UserProfile,
		on_delete=models.DO_NOTHING,
		db_column='technician_id',
		related_name='assigned_tickets',
		null=True,
		blank=True,
	)
	equipment_type = models.CharField(max_length=100)
	description = models.TextField()
	image_proof = models.CharField(max_length=255, null=True, blank=True)
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Chờ tiếp nhận')
	priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Trung bình')
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		managed = False
		db_table = 'maintenance_ticket'


class MaintenanceLog(models.Model):
	id = models.AutoField(primary_key=True)
	ticket = models.ForeignKey(
		MaintenanceTicket,
		on_delete=models.CASCADE,
		db_column='ticket_id',
		related_name='logs',
	)
	technician = models.ForeignKey(
		UserProfile,
		on_delete=models.DO_NOTHING,
		db_column='technician_id',
		related_name='maintenance_logs',
	)
	repair_action = models.TextField(null=True, blank=True)
	completion_image = models.CharField(max_length=255, null=True, blank=True)
	finished_at = models.DateTimeField(null=True, blank=True)
	rating = models.IntegerField(null=True, blank=True)
	feedback = models.TextField(null=True, blank=True)

	class Meta:
		managed = False
		db_table = 'maintenance_log'


class EquipmentStatusHistory(models.Model):
	STATUS_CHOICES = [
		('Chờ tiếp nhận', 'Chờ tiếp nhận'),
		('Đang sửa', 'Đang sửa'),
		('Thiếu linh kiện', 'Thiếu linh kiện'),
		('Đang chờ linh kiện', 'Đang chờ linh kiện'),
		('Đã sửa xong', 'Đã sửa xong'),
		('Không thể sửa', 'Không thể sửa'),
	]

	id = models.AutoField(primary_key=True)
	ticket = models.ForeignKey(
		MaintenanceTicket,
		on_delete=models.CASCADE,
		db_column='ticket_id',
		related_name='status_history',
	)
	status = models.CharField(max_length=30, choices=STATUS_CHOICES)
	note = models.TextField(null=True, blank=True)
	changed_at = models.DateTimeField(auto_now_add=False)

	class Meta:
		managed = False
		db_table = 'equipment_status_history'


class IssueComment(models.Model):
	id = models.AutoField(primary_key=True)
	ticket = models.ForeignKey(
		MaintenanceTicket,
		on_delete=models.CASCADE,
		related_name='comments',
	)
	user = models.ForeignKey(
		UserProfile,
		on_delete=models.DO_NOTHING,
		related_name='issue_comments',
	)
	comment = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		managed = True
		db_table = 'issue_comment'


class UserNotification(models.Model):
	id = models.AutoField(primary_key=True)
	user = models.ForeignKey(
		UserProfile,
		on_delete=models.CASCADE,
		related_name='notifications',
	)
	ticket = models.ForeignKey(
		MaintenanceTicket,
		on_delete=models.SET_NULL,
		related_name='notifications',
		null=True,
		blank=True,
	)
	title = models.CharField(max_length=200)
	message = models.TextField()
	is_read = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		managed = True
		db_table = 'user_notification'
