from django.contrib import admin
from django.urls import path
from viewModule.views import get_facilities, get_chemicals, state_total_releases, \
    timeline_total, top_parentco_releases, timeline_top_parentco_releases, top_chemicals, timeline_top_chemicals, \
    location_summary, top_facility_releases, timeline_top_facility_releases, \
    timeline_top_pbt_chemicals, all_state_total_releases, \
    all_county_total_releases, \
    get_chemicals_in_window, country_summary, health_check, homepoint


''' This list acts as a controller for the API endpoints while path() marks an element for inclusion'''
# See - https://docs.djangoproject.com/en/3.1/topics/http/urls/

urlpatterns = [
    path('_health', health_check),
    # root page for API
    path('', homepoint),
    # admin page for backend
    path('admin/', admin.site.urls),
    # return distinct facilities for a state and requested specs.
    path('facilities', get_facilities),
    # return distinct facilities for a state and year
    path('chemicals', get_chemicals_in_window),
    # return all chemical releases for a specific facility
    path('facilities/<str:facility_id>/chemicals', get_chemicals),
    # return summary for a state and year
    path('stats/location/summary', location_summary),
    # return summary for each county for a state and year
    path('stats/summary', country_summary),
    # return amount of each chemical for a state and year
    path('stats/location/top_chemicals', top_chemicals),
    # return top ten polluting facilities for a state and year
    path('stats/location/facility_releases', top_facility_releases),
    # return top ten polluting parent companies for a state and year
    path('stats/location/parent_releases', top_parentco_releases),
    # return global amount over time for a state and year
    path('stats/location/timeline/total', timeline_total),
    # return top ten chemicals over time for a state and year
    path('stats/location/timeline/top_chemicals', timeline_top_chemicals),
    # return top ten PBT chemicals over time for a state and year
    path('stats/location/timeline/top_pbt_chemicals', timeline_top_pbt_chemicals),
    # return top ten polluting facilities over time by for a state and year
    path('stats/location/timeline/facility_releases', timeline_top_facility_releases),
    # return top ten polluting parent companies over time for a state and year
    path('stats/location/timeline/parent_releases', timeline_top_parentco_releases),
    # return total amount stats released for a state
    path('stats/state/summary', state_total_releases),
    # return release all states, individually
    path('stats/state/all', all_state_total_releases),
    # return release all counties, individually
    path('stats/county/all', all_county_total_releases)
]
