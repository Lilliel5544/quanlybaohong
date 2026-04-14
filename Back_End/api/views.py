from datetime import timedelta

from django.db import transaction
from django.middleware.csrf import get_token
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import EquipmentStatusHistory, IssueComment, IssueReport, LectureHall, MaintenanceTicket, UserNotification, UserProfile
from .serializers import CommentSerializer, IssueCreateSerializer, IssueSerializer, NotificationSerializer, RegisterSerializer, STATUS_REVERSE_MAP, UserProfileSerializer, split_category_description


def get_session_user(request):
	user_id = request.session.get('user_id')
	if not user_id:
		return None
	return UserProfile.objects.filter(id=user_id, is_active=True).first()


def is_admin(user: UserProfile | None) -> bool:
	return bool(user and user.role == 'Admin')


@api_view(['GET'])
@permission_classes([AllowAny])
def csrf(request):
	return Response({'csrfToken': get_token(request)})


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
	username = request.data.get('username', '').strip()
	password = request.data.get('password', '').strip()

	if not username or not password:
		return Response({'detail': 'Thiếu thông tin đăng nhập.'}, status=status.HTTP_400_BAD_REQUEST)

	user = UserProfile.objects.filter(username=username, password=password, is_active=True).first()
	if not user:
		return Response({'detail': 'Tên đăng nhập hoặc mật khẩu không đúng.'}, status=status.HTTP_401_UNAUTHORIZED)

	request.session['user_id'] = user.id
	request.session.modified = True

	return Response(UserProfileSerializer(user).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
	serializer = RegisterSerializer(data=request.data)
	serializer.is_valid(raise_exception=True)
	user = serializer.save()
	return Response(UserProfileSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
	request.session.flush()
	return Response({'detail': 'Đã đăng xuất.'})


@api_view(['GET'])
@permission_classes([AllowAny])
def me(request):
	user = get_session_user(request)
	if not user:
		return Response({'detail': 'Chưa đăng nhập.'}, status=status.HTTP_401_UNAUTHORIZED)
	return Response(UserProfileSerializer(user).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def meta(request):
	default_facilities = [
		'Cơ sở Hà Nội',
		'Cơ sở Hồ Chí Minh',
		'Cơ sở Đà Nẵng',
		'Cơ sở Huế',
	]
	default_categories = [
		'Thiết bị điện tử',
		'Bàn ghế',
		'Điện - Đèn',
		'Máy chiếu',
		'Máy lạnh',
		'Bảng đen/bảng trắng',
		'Cửa sổ/Cửa ra vào',
		'Vệ sinh',
		'Khác',
	]

	def unique(items):
		seen = set()
		result = []
		for item in items:
			if not item or item in seen:
				continue
			seen.add(item)
			result.append(item)
		return result

	facilities = list(LectureHall.objects.values_list('campus', flat=True).distinct())
	facilities = unique(facilities + default_facilities)

	categories = []
	for ticket in MaintenanceTicket.objects.all():
		category, _ = split_category_description(ticket.description)
		if category and category not in categories:
			categories.append(category)
	if not categories:
		categories = list(
			MaintenanceTicket.objects.values_list('equipment_type', flat=True).distinct()
		)
	categories = unique(categories + default_categories)

	return Response({'facilities': facilities, 'categories': categories})


@api_view(['GET'])
@permission_classes([AllowAny])
def notifications(request):
	user = get_session_user(request)
	if not user:
		return Response({'detail': 'Chưa đăng nhập.'}, status=status.HTTP_401_UNAUTHORIZED)

	items = UserNotification.objects.filter(user=user).order_by('-created_at')[:200]
	return Response(NotificationSerializer(items, many=True).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def mark_notification_read(request, pk: int):
	user = get_session_user(request)
	if not user:
		return Response({'detail': 'Chưa đăng nhập.'}, status=status.HTTP_401_UNAUTHORIZED)

	try:
		notification = UserNotification.objects.get(id=pk, user=user)
	except UserNotification.DoesNotExist:
		return Response({'detail': 'Không tìm thấy thông báo.'}, status=status.HTTP_404_NOT_FOUND)

	if not notification.is_read:
		notification.is_read = True
		notification.save(update_fields=['is_read'])

	return Response(NotificationSerializer(notification).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def mark_all_notifications_read(request):
	user = get_session_user(request)
	if not user:
		return Response({'detail': 'Chưa đăng nhập.'}, status=status.HTTP_401_UNAUTHORIZED)

	UserNotification.objects.filter(user=user, is_read=False).update(is_read=True)
	return Response({'detail': 'Đã đánh dấu tất cả đã đọc.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def update_issue_status(request, pk: int):
	user = get_session_user(request)
	if not is_admin(user):
		return Response({'detail': 'Không có quyền.'}, status=status.HTTP_403_FORBIDDEN)

	status_input = request.data.get('status', '').strip()
	note = request.data.get('note', '').strip()

	status_map = {
		'pending': 'Chờ tiếp nhận',
		'in-progress': 'Đang xử lý',
		'resolved': 'Đã sửa xong',
		'rejected': 'Từ chối',
	}
	history_map = {
		'pending': 'Chờ tiếp nhận',
		'in-progress': 'Đang sửa',
		'resolved': 'Đã sửa xong',
		'rejected': 'Không thể sửa',
	}

	if status_input not in status_map:
		return Response({'detail': 'Trạng thái không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)

	try:
		ticket = MaintenanceTicket.objects.get(id=pk)
	except MaintenanceTicket.DoesNotExist:
		return Response({'detail': 'Không tìm thấy sự cố.'}, status=status.HTTP_404_NOT_FOUND)

	ticket.status = status_map[status_input]
	ticket.save(update_fields=['status'])

	performer = user.full_name if user and user.full_name else 'Quản trị viên'
	status_note = note or history_map[status_input]
	stored_note = f"[By] {performer}\n{status_note}"

	EquipmentStatusHistory.objects.create(
		ticket=ticket,
		status=history_map[status_input],
		note=stored_note,
		changed_at=timezone.now(),
	)

	if ticket.reporter_id:
		status_label = status_map[status_input]
		note_text = note or history_map[status_input]
		message_lines = [f"Trạng thái mới: {status_label}"]
		if note_text:
			message_lines.append(f"Ghi chú: {note_text}")
		UserNotification.objects.create(
			user=ticket.reporter,
			ticket=ticket,
			title=f"Cập nhật sự cố #{ticket.id}",
			message="\n".join(message_lines),
		)

	return Response(IssueSerializer(ticket).data)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def issue_comments(request, pk: int):
	try:
		ticket = MaintenanceTicket.objects.get(id=pk)
	except MaintenanceTicket.DoesNotExist:
		return Response({'detail': 'Không tìm thấy sự cố.'}, status=status.HTTP_404_NOT_FOUND)

	if request.method == 'GET':
		comments = IssueComment.objects.filter(ticket=ticket).select_related('user').order_by('created_at')
		return Response(CommentSerializer(comments, many=True).data)

	user = get_session_user(request)
	if not user:
		return Response({'detail': 'Chưa đăng nhập.'}, status=status.HTTP_401_UNAUTHORIZED)

	comment = request.data.get('comment', '').strip()
	if not comment:
		return Response({'detail': 'Vui lòng nhập bình luận.'}, status=status.HTTP_400_BAD_REQUEST)

	new_comment = IssueComment.objects.create(ticket=ticket, user=user, comment=comment)
	return Response(CommentSerializer(new_comment).data, status=status.HTTP_201_CREATED)


class IssueViewSet(viewsets.ModelViewSet):
	queryset = (
		MaintenanceTicket.objects
		.select_related('hall', 'reporter', 'technician')
		.prefetch_related('logs', 'status_history')
		.order_by('-created_at')
	)
	serializer_class = IssueSerializer

	def get_queryset(self):
		queryset = super().get_queryset()
		user = get_session_user(self.request)
		if not user:
			return queryset.none()

		status_param = (self.request.query_params.get('status') or '').strip()
		if status_param:
			status_label = STATUS_REVERSE_MAP.get(status_param)
			if status_label:
				queryset = queryset.filter(status=status_label)

		if is_admin(user):
			return queryset
		return queryset.filter(reporter_id=user.id)

	def get_serializer_class(self):
		if self.action == 'create':
			return IssueCreateSerializer
		return IssueSerializer

	def create(self, request, *args, **kwargs):
		user = get_session_user(request)
		if not user:
			return Response({'detail': 'Chưa đăng nhập.'}, status=status.HTTP_401_UNAUTHORIZED)

		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		validated = serializer.validated_data
		now = timezone.now()
		window_start = now - timedelta(hours=24)
		room_name = validated['room'].strip()
		facility_name = validated['facility'].strip()
		equipment_name = validated['title'].strip()

		hall = LectureHall.objects.filter(
			hall_name__iexact=room_name,
			campus__iexact=facility_name,
		).first()

		existing_ticket = None
		if hall:
			existing_ticket = (
				MaintenanceTicket.objects.filter(
					hall=hall,
					equipment_type__iexact=equipment_name,
					created_at__date=now.date(),
					created_at__gte=window_start,
				)
				.exclude(status__in=['Đã sửa xong', 'Từ chối'])
				.order_by('-created_at')
				.first()
			)

		if existing_ticket:
			with transaction.atomic():
				if not IssueReport.objects.filter(ticket=existing_ticket).exists():
					IssueReport.objects.create(
						ticket=existing_ticket,
						reporter=existing_ticket.reporter,
					)
				IssueReport.objects.create(ticket=existing_ticket, reporter=user)
			payload = IssueSerializer(existing_ticket).data
			return Response({'duplicate': True, 'issue': payload}, status=status.HTTP_200_OK)

		request.user_profile = user
		ticket = serializer.save()
		IssueReport.objects.create(ticket=ticket, reporter=user)
		payload = IssueSerializer(ticket).data
		return Response({'duplicate': False, 'issue': payload}, status=status.HTTP_201_CREATED)

	def destroy(self, request, *args, **kwargs):
		user = get_session_user(request)
		if not is_admin(user):
			return Response({'detail': 'Không có quyền.'}, status=status.HTTP_403_FORBIDDEN)
		return super().destroy(request, *args, **kwargs)
