from django.contrib import admin
from django.urls import path
from viewModule.views import demo

# TODO - establish URL patterns for calls (~python regular expressions)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('demo/', demo),
    path('', demo),
    path('demo/<slug:tri_attr>', demo),
]
