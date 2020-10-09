from django.contrib import admin
from django.urls import path
from viewModule.views import demo, points, idview, chemview, p_count

urlpatterns = [
    path('admin/', admin.site.urls),
    path('demo/', demo),
    path('', demo),
    path('demo/<slug:tri_attr>', demo),
    path('points', points),
    path('trends/count', p_count),
    path('getid', idview),
    path('getchem', chemview)
]
