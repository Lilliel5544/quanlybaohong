from __future__ import annotations

from typing import Optional

from rest_framework import serializers
from django.db.models import Max

from .models import EquipmentStatusHistory, IssueComment, LectureHall, MaintenanceLog, MaintenanceTicket, UserProfile


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
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'full_name', 'role', 'is_active', 'phone_no']


class IssueSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    facility = serializers.SerializerMethodField()
    room = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    priority = serializers.SerializerMethodField()
    reportedBy = serializers.SerializerMethodField()
    reportedAt = serializers.DateTimeField(source='created_at')
    assignedTo = serializers.SerializerMethodField()
    resolvedAt = serializers.SerializerMethodField()
    imageUrl = serializers.CharField(source='image_proof', allow_null=True)
    notes = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    feedback = serializers.SerializerMethodField()
    timeline = serializers.SerializerMethodField()

    class Meta:
        model = MaintenanceTicket
        fields = [
            'id',
            'title',
            'description',
            'category',
            'facility',
            'room',
            'status',
            'priority',
            'reportedBy',
            'reportedAt',
            'assignedTo',
            'resolvedAt',
            'imageUrl',
            'notes',
            'rating',
            'feedback',
            'timeline',
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

    def get_room(self, obj: MaintenanceTicket) -> str:
        return obj.hall.hall_name if obj.hall else ''

    def get_status(self, obj: MaintenanceTicket) -> str:
        return STATUS_MAP.get(obj.status, obj.status)

    def get_priority(self, obj: MaintenanceTicket) -> str:
        return PRIORITY_MAP.get(obj.priority, obj.priority)

    def get_reportedBy(self, obj: MaintenanceTicket) -> str:
        return obj.reporter.full_name if obj.reporter else ''

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


class IssueCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=100)
    description = serializers.CharField()
    category = serializers.CharField(max_length=100)
    facility = serializers.CharField(max_length=50)
    room = serializers.CharField(max_length=50)
    priority = serializers.ChoiceField(choices=list(PRIORITY_REVERSE_MAP.keys()))

    def create(self, validated_data):
        request = self.context['request']
        user: UserProfile = request.user_profile
        hall, _ = LectureHall.objects.get_or_create(
            hall_name=validated_data['room'],
            campus=validated_data['facility'],
            defaults={'block': 'N/A', 'floor': None},
        )

        return MaintenanceTicket.objects.create(
            reporter=user,
            hall=hall,
            equipment_type=validated_data['title'],
            description=build_description(validated_data['category'], validated_data['description']),
            priority=PRIORITY_REVERSE_MAP.get(validated_data['priority'], 'Trung bình'),
            status='Chờ tiếp nhận',
        )


class CommentSerializer(serializers.ModelSerializer):
    userName = serializers.CharField(source='user.username')
    userFullName = serializers.CharField(source='user.full_name')
    createdAt = serializers.DateTimeField(source='created_at')

    class Meta:
        model = IssueComment
        fields = ['id', 'comment', 'userName', 'userFullName', 'createdAt']


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=50)
    password = serializers.CharField(max_length=255)
    full_name = serializers.CharField(max_length=100)
    phone_no = serializers.CharField(max_length=15, required=False, allow_blank=True)

    def validate_username(self, value: str) -> str:
        if UserProfile.objects.filter(username=value).exists():
            raise serializers.ValidationError('Tên đăng nhập đã tồn tại.')
        return value

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
        )
