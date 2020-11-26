from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponse
import base64
import binascii

import os


class AuthMiddleware(MiddlewareMixin):
    def process_request(self, request):
        try:
            decoded = base64.b64decode(request.headers.get('Authorization'))
            if not 'Authorization' in request.headers or decoded.decode('ascii') != os.environ.get('API_KEY'):
                return HttpResponse('Unauthorized', status=401)
        except binascii.Error:
            return HttpResponse('Unauthorized', status=401)
        else:
            return None
