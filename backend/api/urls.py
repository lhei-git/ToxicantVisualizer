from django.contrib import admin
from django.urls import path
from viewModule.views import demo, points, p_count, attr, facilities

urlpatterns = [
    path('admin/', admin.site.urls),
    path('demo/', demo),
    path('', demo),
    path('demo/<slug:tri_attr>', demo),
    path('attr/<slug:attribute>', attr),
    path('points', points),
    # return number of reports over window corrds(default) OR state (URL arg: 'state')
    path('trends/count', p_count),
    path('facilities', facilities),
]
