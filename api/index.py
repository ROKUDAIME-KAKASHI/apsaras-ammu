import sys
import os

# Add the backend directory to the sys.path so it can import app.py
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app import app
