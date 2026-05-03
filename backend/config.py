import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    PORT = int(os.environ.get('PORT', 5000))
    DOCUMENT_EXPIRY = int(os.environ.get('DOCUMENT_EXPIRY', 600))
    STORAGE_LIMIT = int(os.environ.get('STORAGE_LIMIT', 1000))
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 512 * 1024))
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')
