from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponse
import base64
import binascii

import os


class AuthMiddleware(MiddlewareMixin):
    def process_request(self, request):
        try:
            if os.environ.get('DJANGO_SETTINGS') == 'dev':
                return None
            header = request.headers.get('Authorization')
            if header is None or base64.b64decode(header).decode('ascii') != os.environ.get('API_KEY'):
                return HttpResponse('Unauthorized', status=401)
        except binascii.Error:
            return HttpResponse('Unauthorized', status=401)
        else:
            return None
