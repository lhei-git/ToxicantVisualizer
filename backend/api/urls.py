from django.contrib import admin
from django.urls import path
from viewModule.views import demo, points, p_count, attr, facilities, state_total_releases, top_parentco_releases, chem_counts, location_summary, location_releases_by_facility, location_releases_by_parent

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', admin.site.urls),
    path('attr/<slug:attribute>', attr),
    # return all reports within: window coords
    path('facilities', points),
    # return summary within: window coords
    path('stats/location/summary', location_summary),
    # return number of each chemical within: window coords
    path('stats/location/chem_counts', chem_counts),
    # return number of reports by: coord window OR state
    path('stats/location/num_facilities', p_count),
    # return top ten polluting facilities by: coord window
    path('stats/location/facility_releases', location_releases_by_facility),
    # return top ten polluting parent companies by: coord window
    path('stats/location/parent_releases', location_releases_by_parent),
    # return total amount stats released by: state
    path('stats/state/summary', state_total_releases),
    # top 10 parent Cos in total release by: state
    path('stats/state/topcos', top_parentco_releases),
]
#  top stats have repetitions, FIXME ~ flatten somewhere
