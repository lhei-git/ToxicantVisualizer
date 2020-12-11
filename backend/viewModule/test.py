
from django.test import TestCase

class EndpointTestCases(TestCase):
    def setUp(self):
        pass

    def test_status_codes(self):
        get_facilities = self.client.get('/facilities?state=')
        self.assertEqual(get_facilities.status_code, 200)
