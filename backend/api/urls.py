from django.contrib import admin
from django.urls import path
from viewModule.views import dist_fac, attr, num_facilities, state_total_releases, top_parentco_releases, chem_counts, location_summary, top_facility_releases

urlpatterns = [
    path('admin/', admin.site.urls),
    path('attr/<slug:attribute>', attr),
    # return distinct facilities within: window, state
    path('facilities', dist_fac),
    # return number of facilities within: window
    path('stats/location/num_facilities', num_facilities),
    # return summary within: window
    path('stats/location/summary', location_summary),
    # return number of each chemical within: window
    path('stats/location/chemcounts', chem_counts),
    # return number of reports by: coord window OR state
    path('stats/location/num_facilities', num_facilities),
    # return top ten polluting facilities by: window
    path('stats/location/facility_releases', top_facility_releases),
    # return top ten polluting parent companies by: window
    path('stats/location/parent_releases', top_parentco_releases),
    # return total amount stats released by: state
    path('stats/state/summary', state_total_releases),
]
