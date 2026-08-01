import os
import sys
from pathlib import Path

# Make sure the Django project (config, accounts, tasks) is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from django.core.wsgi import get_wsgi_application

app = get_wsgi_application()