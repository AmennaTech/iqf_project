
from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

app_name = 'iqf_event'

urlpatterns = [
    path('index', views.index, name='index'),
    path('registration/', views.registration, name='registration'),
    path('register/', views.register, name='register'),
    path('confirm_presence/', views.confirm_presence, name='confirm_presence'),

]
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)