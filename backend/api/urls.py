from django.contrib import admin
from django.urls import path
from viewModule.views import demo, points, p_count, attr, facilities, state_total_releases, top_parentco_releases

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', admin.site.urls),
    path('attr/<slug:attribute>', attr),
    # return all reports within: window coords
    path('points', points),
    # return number of reports by: coord window OR state
    path('trends/count', p_count),
    # return distinct facilities by: coord window OR state
    path('facilities', facilities),
    # return total amount stats released by: state
    path('statestats', state_total_releases),
    # top 10 parent Cos in total release by: state
    path('topcos', top_parentco_releases),
]
#  top stats have repetitions, FIXME ~ flatten somewhere
