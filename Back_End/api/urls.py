from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import IssueViewSet, csrf, issue_comments, login, logout, me, meta, register, update_issue_status

router = DefaultRouter()
router.register('issues', IssueViewSet, basename='issues')

urlpatterns = [
    path('csrf/', csrf, name='csrf'),
    path('login/', login, name='login'),
    path('register/', register, name='register'),
    path('logout/', logout, name='logout'),
    path('me/', me, name='me'),
    path('meta/', meta, name='meta'),
    path('issues/<int:pk>/status/', update_issue_status, name='issue-status'),
    path('issues/<int:pk>/comments/', issue_comments, name='issue-comments'),
    path('', include(router.urls)),
]
