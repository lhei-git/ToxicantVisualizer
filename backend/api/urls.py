from django.contrib import admin
from django.urls import path
from viewModule.views import points, get_facilities, get_chemicals, attr, num_facilities, state_total_releases, \
    timeline_total, top_parentco_releases, timeline_top_parentco_releases, top_chemicals, timeline_top_chemicals, \
    location_summary, top_facility_releases, timeline_top_facility_releases, all_state_total_releases, \
    all_county_total_releases, timeline_top_pbt_chemicals, top_pbt_chemicals

urlpatterns = [
    path('admin/', admin.site.urls),
    path('attr/<slug:attribute>', attr),
    # return distinct facilities within: window, state -- FIXME - Do we need this?
    path('points', points),
    # return distinct facilities within window -- FIXED
    path('facilities', get_facilities),
    # return all chemical releases for a specific facility -- FIXED
    path('facilities/<str:facility_id>/chemicals', get_chemicals),
    # return summary within: window -- FIXME - ?
    path('stats/location/summary', location_summary),
    # return amount of each chemical within: window -- FIXED
    path('stats/location/top_chemicals', top_chemicals),
    # return amount of each PBT chemical within: window -- FIXED
    path('stats/location/top_pbt_chemicals', top_pbt_chemicals),
    # return number of reports by: coord window OR state -- FIXED
    path('stats/location/num_facilities', num_facilities),
    # return top ten polluting facilities by: window -- FIXED
    path('stats/location/facility_releases', top_facility_releases),
    # return top ten polluting parent companies by: window -- FIXED
    path('stats/location/parent_releases', top_parentco_releases),
    # return global amount over time by: window -- FIXED
    path('stats/location/timeline/total', timeline_total),
    # return top ten chemicals over time by: window -- FIXED
    path('stats/location/timeline/top_chemicals', timeline_top_chemicals),
    # return top ten PBT chemicals over time by: window
    path('stats/location/timeline/top_pbt_chemicals', timeline_top_pbt_chemicals),
    # return top ten polluting facilities over time by: window -- FIXED
    path('stats/location/timeline/facility_releases', timeline_top_facility_releases),
    # return top ten polluting parent companies over time by: window -- FIXED
    path('stats/location/timeline/parent_releases', timeline_top_parentco_releases),
    # return total amount stats released by: state -- TODO - add query
    path('stats/state/summary', state_total_releases),
    # return release all states, individually -- FIXME - RAW SQL
    path('stats/state/all', all_state_total_releases),
    # return release all counties, individually -- FIXME - RAW SQL
    path('stats/county/all', all_county_total_releases),
]
