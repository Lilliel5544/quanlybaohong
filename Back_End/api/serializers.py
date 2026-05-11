from __future__ import annotations

from typing import Optional

import re

from rest_framework import serializers
from django.db.models import Count, Max
from django.utils import timezone

from .models import EquipmentStatusHistory, IssueComment, IssueDamagedEquipment, IssueReport, LectureHall, MaintenanceLog, MaintenanceTicket, UserNotification, UserProfile


STATUS_MAP = {
    'Chờ tiếp nhận': 'pending',
    'Đang xử lý': 'in-progress',
    'Đã sửa xong': 'resolved',
    'Từ chối': 'rejected',
}

PRIORITY_MAP = {
    'Thấp': 'low',
    'Trung bình': 'medium',
    'Cao': 'high',
    'Khẩn cấp': 'urgent',
}

STATUS_REVERSE_MAP = {value: key for key, value in STATUS_MAP.items()}
PRIORITY_REVERSE_MAP = {value: key for key, value in PRIORITY_MAP.items()}

ROLE_FRONTEND_MAP = {
    'Admin': 'admin',
    'Kỹ thuật viên': 'technician',
    'Giảng viên': 'user',
    'Sinh viên': 'user',
}

TIMELINE_STATUS_MAP = {
    'Chờ tiếp nhận': 'reported',
    'Đang sửa': 'in-progress',
    'Thiếu linh kiện': 'waiting-parts',
    'Đang chờ linh kiện': 'waiting-parts',
    'Đã sửa xong': 'resolved',
    'Không thể sửa': 'rejected',
}


def split_category_description(description: str) -> tuple[Optional[str], str]:
    if description.startswith('[Category] '):
        parts = description.split('\n', 1)
        if parts:
            category_line = parts[0].replace('[Category] ', '').strip()
            remaining = parts[1].strip() if len(parts) > 1 else ''
            return category_line or None, remaining
    return None, description


def build_description(category: str, description: str) -> str:
    clean_description = description.strip()
    clean_category = category.strip() if category else ''
    if clean_category:
        return f"[Category] {clean_category}\n{clean_description}"
    return clean_description


def parse_status_note(note: Optional[str]) -> tuple[Optional[str], Optional[str]]:
    if not note:
        return None, None
    if note.startswith('[By] '):
        parts = note.split('\n', 1)
        performer = parts[0].replace('[By] ', '').strip()
        detail = parts[1].strip() if len(parts) > 1 else None
        return performer or None, detail
    return None, note


class UserProfileSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source='full_name')
    role = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    isActive = serializers.BooleanField(source='is_active')
    createdAt = serializers.SerializerMethodField()
    lastLogin = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'fullName', 'role', 'email', 'isActive', 'createdAt', 'lastLogin']

    def get_role(self, obj: UserProfile) -> str:
        return ROLE_FRONTEND_MAP.get(obj.role, 'user')

    def get_email(self, obj: UserProfile) -> str:
        if obj.email:
            return obj.email
        username = (obj.username or '').strip().lower()
        if '@' in username:
            return username
        return f"{username}@ptit.edu.vn" if username else ''

    def get_createdAt(self, obj: UserProfile):
        if obj.created_at:
            return obj.created_at
        return timezone.now()

    def get_lastLogin(self, obj: UserProfile):
        return obj.last_login


class IssueSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    facility = serializers.SerializerMethodField()
    building = serializers.SerializerMethodField()
    floor = serializers.SerializerMethodField()
    room = serializers.SerializerMethodField()
    damagedEquipment = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    priority = serializers.SerializerMethodField()
    reportedBy = serializers.SerializerMethodField()
    reporterCode = serializers.SerializerMethodField()
    reportedAt = serializers.DateTimeField(source='created_at')
    assignedTo = serializers.SerializerMethodField()
    resolvedAt = serializers.SerializerMethodField()
    imageUrl = serializers.CharField(source='image_proof', allow_null=True)
    notes = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    feedback = serializers.SerializerMethodField()
    timeline = serializers.SerializerMethodField()
    isDuplicate = serializers.SerializerMethodField()
    reportCount = serializers.SerializerMethodField()

    class Meta:
        model = MaintenanceTicket
        fields = [
            'id',
            'title',
            'description',
            'category',
            'facility',
            'building',
            'floor',
            'room',
            'damagedEquipment',
            'status',
            'priority',
            'reportedBy',
            'reporterCode',
            'reportedAt',
            'assignedTo',
            'resolvedAt',
            'imageUrl',
            'notes',
            'rating',
            'feedback',
            'timeline',
            'isDuplicate',
            'reportCount',
        ]

    def get_title(self, obj: MaintenanceTicket) -> str:
        return obj.equipment_type

    def get_description(self, obj: MaintenanceTicket) -> str:
        _, description = split_category_description(obj.description)
        return description

    def get_category(self, obj: MaintenanceTicket) -> str:
        category, _ = split_category_description(obj.description)
        return category or obj.equipment_type

    def get_facility(self, obj: MaintenanceTicket) -> str:
        return obj.hall.campus if obj.hall else ''

    def get_building(self, obj: MaintenanceTicket) -> str:
        return obj.hall.block if obj.hall and obj.hall.block else ''

    def get_floor(self, obj: MaintenanceTicket) -> Optional[str]:
        if obj.hall and obj.hall.floor is not None:
            return str(obj.hall.floor)
        return None

    def get_room(self, obj: MaintenanceTicket) -> str:
        return obj.hall.hall_name if obj.hall else ''

    def get_damagedEquipment(self, obj: MaintenanceTicket) -> list[dict[str, int | str]]:
        counts = (
            obj.damaged_equipment
            .values('equipment_id')
            .annotate(quantity=Count('equipment_id'))
            .order_by('equipment_id')
        )
        return [
            {'equipmentId': item['equipment_id'], 'quantity': item['quantity']}
            for item in counts
        ]

    def get_status(self, obj: MaintenanceTicket) -> str:
        return STATUS_MAP.get(obj.status, obj.status)

    def get_priority(self, obj: MaintenanceTicket) -> str:
        return PRIORITY_MAP.get(obj.priority, obj.priority)

    def get_reportedBy(self, obj: MaintenanceTicket) -> str:
        return obj.reporter.full_name if obj.reporter else ''

    def get_reporterCode(self, obj: MaintenanceTicket) -> str:
        return obj.reporter.username if obj.reporter else ''

    def get_assignedTo(self, obj: MaintenanceTicket) -> Optional[str]:
        return obj.technician.full_name if obj.technician else None

    def get_resolvedAt(self, obj: MaintenanceTicket):
        log = obj.logs.order_by('-finished_at').first()
        if log and log.finished_at:
            return log.finished_at
        return None

    def get_notes(self, obj: MaintenanceTicket) -> Optional[str]:
        log = obj.logs.order_by('-finished_at').first()
        if log and log.repair_action:
            return log.repair_action
        return None

    def get_rating(self, obj: MaintenanceTicket) -> Optional[int]:
        log = obj.logs.order_by('-finished_at').first()
        if log and log.rating:
            return log.rating
        return None

    def get_feedback(self, obj: MaintenanceTicket) -> Optional[str]:
        log = obj.logs.order_by('-finished_at').first()
        if log and log.feedback:
            return log.feedback
        return None

    def get_timeline(self, obj: MaintenanceTicket):
        events = []
        for history in obj.status_history.order_by('changed_at'):
            performer, detail = parse_status_note(history.note)
            events.append({
                'id': f"h-{history.id}",
                'status': TIMELINE_STATUS_MAP.get(history.status, history.status),
                'description': detail or history.note or history.status,
                'timestamp': history.changed_at,
                'performer': performer or (obj.technician.full_name if obj.technician else obj.reporter.full_name),
            })
        if not events:
            events.append({
                'id': f"t-{obj.id}",
                'status': 'reported',
                'description': 'Đã báo cáo',
                'timestamp': obj.created_at,
                'performer': obj.reporter.full_name if obj.reporter else 'Hệ thống',
            })
        return events

    def get_reportCount(self, obj: MaintenanceTicket) -> int:
        count = IssueReport.objects.filter(ticket=obj).count()
        return count if count > 0 else 1

    def get_isDuplicate(self, obj: MaintenanceTicket) -> bool:
        return self.get_reportCount(obj) > 1


class IssueCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=100)
    description = serializers.CharField()
    category = serializers.CharField(max_length=100, required=False, allow_blank=True)
    facility = serializers.CharField(max_length=50)
    room = serializers.CharField(max_length=50)
    priority = serializers.ChoiceField(choices=list(PRIORITY_REVERSE_MAP.keys()))
    building = serializers.CharField(max_length=20, required=False, allow_blank=True)
    floor = serializers.CharField(max_length=10, required=False, allow_blank=True)
    damagedEquipment = serializers.ListField(
        child=serializers.JSONField(),
        required=False,
        allow_empty=True,
    )
    reportedBy = serializers.CharField(max_length=100, required=False, allow_blank=True)
    reporterCode = serializers.CharField(max_length=50, required=False, allow_blank=True)

    def validate_damagedEquipment(self, value):
        normalized = []
        for item in value:
            if isinstance(item, str):
                equipment_id = item.strip()
                quantity = 1
            elif isinstance(item, dict):
                equipment_id = (
                    str(item.get('equipmentId') or item.get('equipment_id') or '')
                ).strip()
                quantity = item.get('quantity', 1)
            else:
                raise serializers.ValidationError('Thiết bị hỏng không hợp lệ.')

            if not equipment_id:
                continue

            try:
                quantity = int(quantity)
            except (TypeError, ValueError):
                raise serializers.ValidationError('Số lượng thiết bị không hợp lệ.')

            if quantity < 1:
                continue

            normalized.append({'equipmentId': equipment_id, 'quantity': quantity})

        return normalized

    def create(self, validated_data):
        user: UserProfile = self.context['reporter']
        building = (validated_data.get('building') or '').strip()
        floor_raw = (validated_data.get('floor') or '').strip()
        floor_value = None
        if floor_raw.isdigit():
            floor_value = int(floor_raw)
        hall, _ = LectureHall.objects.get_or_create(
            hall_name=validated_data['room'],
            campus=validated_data['facility'],
            defaults={
                'block': building or 'N/A',
                'floor': floor_value,
            },
        )

        if building and hall.block in {'', 'N/A', None}:
            hall.block = building
        if floor_value is not None and hall.floor is None:
            hall.floor = floor_value
        if building and hall.block == building and (floor_value is not None and hall.floor == floor_value):
            hall.save(update_fields=['block', 'floor'])
        elif hall.block != 'N/A' or hall.floor is not None:
            hall.save(update_fields=['block', 'floor'])

        category_value = (validated_data.get('category') or '').strip()
        if not category_value:
            category_value = validated_data['title']

        ticket = MaintenanceTicket.objects.create(
            reporter=user,
            hall=hall,
            equipment_type=validated_data['title'],
            description=build_description(category_value, validated_data['description']),
            priority=PRIORITY_REVERSE_MAP.get(validated_data['priority'], 'Trung bình'),
            status='Chờ tiếp nhận',
        )

        damaged_items = validated_data.get('damagedEquipment') or []
        if damaged_items:
            equipment_rows = []
            for item in damaged_items:
                equipment_id = item.get('equipmentId')
                quantity = item.get('quantity', 1)
                for _ in range(max(int(quantity), 1)):
                    equipment_rows.append(
                        IssueDamagedEquipment(ticket=ticket, equipment_id=equipment_id)
                    )
            IssueDamagedEquipment.objects.bulk_create(equipment_rows)

        return ticket


class CommentSerializer(serializers.ModelSerializer):
    userName = serializers.CharField(source='user.username')
    userFullName = serializers.CharField(source='user.full_name')
    createdAt = serializers.DateTimeField(source='created_at')

    class Meta:
        model = IssueComment
        fields = ['id', 'comment', 'userName', 'userFullName', 'createdAt']


class NotificationSerializer(serializers.ModelSerializer):
    isRead = serializers.BooleanField(source='is_read')
    createdAt = serializers.DateTimeField(source='created_at')
    ticketId = serializers.IntegerField(source='ticket_id', allow_null=True)

    class Meta:
        model = UserNotification
        fields = ['id', 'title', 'message', 'isRead', 'createdAt', 'ticketId']


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=50)
    password = serializers.CharField(max_length=255)
    full_name = serializers.CharField(max_length=100)
    email = serializers.EmailField(required=False, allow_blank=True)
    userType = serializers.CharField(max_length=20, required=False, allow_blank=True)
    facility = serializers.CharField(max_length=100, required=False, allow_blank=True)
    phone_no = serializers.CharField(max_length=15, required=False, allow_blank=True)

    def validate_username(self, value: str) -> str:
        username = value.strip().upper()
        if not re.match(r'^B\d{2}DCCN\d{3}$', username):
            raise serializers.ValidationError('Mã sinh viên phải có định dạng: B20DCCN001.')
        if UserProfile.objects.filter(username=value).exists():
            raise serializers.ValidationError('Tên đăng nhập đã tồn tại.')
        return username

    def create(self, validated_data):
        max_user_id = UserProfile.objects.aggregate(Max('user_id')).get('user_id__max') or 0
        return UserProfile.objects.create(
            user_id=max_user_id + 1,
            username=validated_data['username'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            role='Sinh viên',
            is_active=True,
            phone_no=validated_data.get('phone_no') or None,
            email=validated_data.get('email') or None,
            created_at=timezone.now(),
        )
