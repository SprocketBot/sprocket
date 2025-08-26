import os, json
from pathlib import Path

def load_secret_from_file(file_path, fallback=None):
    """Load secret from file if it exists, otherwise return fallback"""
    if Path(file_path).exists():
        with open(file_path, 'r') as f:
            return f.read().strip()
    return fallback

def get_config_value(env_key, config_dict, config_key, default=None):
    """Get config value from environment, config dict, or default"""
    # 1. Check environment variable first
    env_value = os.environ.get(env_key)
    if env_value is not None:
        return env_value
    
    # 2. Check config dict
    keys = config_key.split('.')
    value = config_dict
    try:
        for key in keys:
            value = value[key]
        return value
    except (KeyError, TypeError):
        pass
    
    # 3. Return default
    return default

# Load environment
env = os.environ.get("ENV", "development")

# Load base configurations
with open("../config/default.json", "r") as f:
    defaultConfig = json.loads(f.read())

with open(f"../config/{env}.json", "r") as f:
    envConfig = json.loads(f.read())

# Merge configurations
base_config = {**defaultConfig, **envConfig}

# Helper function to build RabbitMQ URL with authentication
def build_rabbitmq_url():
    """Build RabbitMQ URL with optional authentication from environment variables"""
    base_url = get_config_value("TRANSPORT_URL", base_config, "transport.url")
    rmq_user = os.environ.get("RABBITMQ_DEFAULT_USER")
    rmq_pass = os.environ.get("RABBITMQ_DEFAULT_PASS")
    
    if rmq_user and rmq_pass and base_url:
        # Parse the base URL to inject credentials
        from urllib.parse import urlparse, urlunparse
        parsed = urlparse(base_url)
        
        # Inject credentials into the URL
        if parsed.scheme in ['amqp', 'amqps']:
            # Replace netloc with credentials
            netloc = f"{rmq_user}:{rmq_pass}@{parsed.hostname}"
            if parsed.port:
                netloc += f":{parsed.port}"
            
            new_parsed = parsed._replace(netloc=netloc)
            return urlunparse(new_parsed)
    
    return base_url

# Enhanced config with environment variable support
config = {
    # Database
    "db": {
        "host": get_config_value("DB_HOST", base_config, "db.host"),
        "port": int(get_config_value("DB_PORT", base_config, "db.port", 5432)),
        "username": get_config_value("DB_USERNAME", base_config, "db.username"),
        "password": os.environ.get("DB_PASSWORD") or load_secret_from_file("../secret/db-password.txt"),
        "database": get_config_value("DB_DATABASE", base_config, "db.database"),
    },
    
    # Redis
    "redis": {
        "host": get_config_value("REDIS_HOST", base_config, "redis.host"),
        "port": int(get_config_value("REDIS_PORT", base_config, "redis.port", 6379)),
        "password": os.environ.get("REDIS_PASSWORD") or load_secret_from_file("../secret/redis-password.txt"),
        "secure": get_config_value("REDIS_SECURE", base_config, "redis.secure", "false").lower() == "true",
    },
    
    # MinIO
    "minio": {
        "endpoint": get_config_value("MINIO_ENDPOINT", base_config, "minio.endPoint"),
        "port": int(get_config_value("MINIO_PORT", base_config, "minio.port", 9000)),
        "access_key": os.environ.get("MINIO_ACCESS_KEY") or load_secret_from_file("../secret/minio-access.txt"),
        "secret_key": os.environ.get("MINIO_SECRET_KEY") or load_secret_from_file("../secret/minio-secret.txt"),
        "secure": get_config_value("MINIO_USE_SSL", base_config, "minio.useSSL", "false").lower() == "true",
    },
    
    # Transport
    "transport": {
        "url": build_rabbitmq_url(),
        "celery_queue": get_config_value("CELERY_QUEUE", base_config, "transport.celery-queue"),
        "analytics_queue": get_config_value("TRANSPORT_ANALYTICS_QUEUE", base_config, "transport.analytics_queue"),
    },
}

# Add any remaining config from base_config that wasn't explicitly mapped
for key, value in base_config.items():
    if key not in config:
        config[key] = value
