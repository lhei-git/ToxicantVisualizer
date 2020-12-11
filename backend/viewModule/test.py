
from django.test import TestCase

class EndpointTestCases(TestCase):
    def setUp(self):
        pass

    def test_status_codes(self):
        
        # handling to remove authentiacation during tests
        with self.modify_settings(MIDDLEWARE={
            'remove': [
                'api.middleware.auth.AuthMiddleware'
            ]
        }):

            ''' Respone objects are constructed from the Client() class '''
            # NOTE - Only the state param needs to be supplied to get back a valid 20 resposne, no need for providing a value
            
            get_facilities = self.client.get('/facilities?state=')
            get_chemicals_in_window = self.client.get('/chemicals?state=')
            get_chemicals = self.client.get('/facilities/XYZ/chemicals?state=')
            location_summary =  self.client.get('/stats/location/summary?state=')
            country_summary = self.client.get('/stats/summary?state=')
            top_chemicals = self.client.get('/stats/location/top_chemicals?state=')
            top_facility_releases = self.client.get('/stats/location/facility_releases?state=')
            top_parentco_releases = self.client.get('/stats/location/parent_releases?state=')
            timeline_total = self.client.get('/stats/location/timeline/total?state=')
            timeline_top_chemicals = self.client.get(
                                            '/stats/location/timeline/top_chemicals?state=')
            timeline_top_pbt_chemicals = self.client.get(
                                        '/stats/location/timeline/top_pbt_chemicals?state=')
            timeline_top_facility_releases = self.client.get(
                                        '/stats/location/timeline/facility_releases?state=')
            timeline_top_parentco_releases = self.client.get(
                                        '/stats/location/timeline/parent_releases?state=')
            state_total_releases = self.client.get('/stats/state/summary?state=')
            all_state_total_releases = self.client.get('/stats/state/all?state=')
            all_county_total_releases = self.client.get('/stats/county/all?state=')
    


            ''' Each endpoint will be pinged to check if it is up and running by the status code it returns'''

            self.assertEqual(get_facilities.status_code, 200, 'Error: get_facilities')
            self.assertEqual(get_chemicals_in_window.status_code, 200,
                                                 'Error: get_chemicals_in_window')
            self.assertEqual(get_chemicals.status_code, 200, 'Error: get_chemicals')
            self.assertEqual(location_summary.status_code, 200, 'Error: location_summary')
            self.assertEqual(country_summary.status_code, 200, 'Error: country_summary')
            self.assertEqual(top_chemicals.status_code, 200, 'Error: top_chemicals')
            self.assertEqual(top_facility_releases.status_code, 200, 'Error: top_facility_releases')
            self.assertEqual(top_parentco_releases.status_code, 200, 'Error: top_parentco_releases')
            self.assertEqual(timeline_total.status_code, 200, 'Error: timeline_total')
            self.assertEqual(timeline_top_chemicals.status_code, 200, 'Error: timeline_top_chemicals')
            self.assertEqual(timeline_top_pbt_chemicals.status_code, 200, 
                                                            'Error: timeline_top_pbt_chemicals')
            self.assertEqual(timeline_top_facility_releases.status_code, 200, 
                                                        'Error: timeline_top_facility_releases')
            self.assertEqual(timeline_top_parentco_releases.status_code, 200, 
                                                        'Error: timeline_top_parentco_releases')
            self.assertEqual(state_total_releases.status_code, 200, 'Error: state_total_releases')
            self.assertEqual(all_state_total_releases.status_code, 200, 
                                                            'Error: all_state_total_releases')
            self.assertEqual(all_county_total_releases.status_code, 200, 
                                                        'Error: all_county_total_releases')

        
    def test_validity(self):
        # mock testing with 'pytest-postgresql' not possible for many to many models currently, refer to postman testing in doc
        pass
