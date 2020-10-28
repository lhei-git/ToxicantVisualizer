from django.contrib import admin
from django.urls import path
from viewModule.views import points, attr, num_facilities, state_total_releases, top_parentco_releases, timeline_top_parentco_releases, top_chemicals, timeline_top_chemicals, location_summary, top_facility_releases, timeline_top_facility_releases, all_state_total_releases, all_county_total_releases

urlpatterns = [
    path('admin/', admin.site.urls),
    path('attr/<slug:attribute>', attr),
    # return distinct facilities within: window, state
    path('facilities', points),
    # return number of facilities within: window
    path('stats/location/num_facilities', num_facilities),
    # return summary within: window
    path('stats/location/summary', location_summary),
    # return amount of each chemical within: window
    path('stats/location/top_chemicals', top_chemicals),
    # return number of reports by: coord window OR state
    path('stats/location/num_facilities', num_facilities),
    # return top ten polluting facilities by: window
    path('stats/location/facility_releases', top_facility_releases),
    # return top ten polluting parent companies by: window
    path('stats/location/parent_releases', top_parentco_releases),
    # return top ten chemicals over time by: window
    path('stats/location/timeline/top_chemicals', timeline_top_chemicals),
    # return top ten polluting facilities over time by: window
    path('stats/location/timeline/facility_releases', timeline_top_facility_releases),
    # return top ten polluting parent companies over time by: window
    path('stats/location/timeline/parent_releases', timeline_top_parentco_releases),

    # return total amount stats released by: state
    path('stats/state/summary', state_total_releases),
    # return release all states, individually
    path('stats/state/all', all_state_total_releases),
    # return release all counties, individually
    path('stats/county/all', all_county_total_releases),
]
