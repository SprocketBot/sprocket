from config import config
from urllib.parse import urlparse

broker_transport_options = {
    'queue_name_prefix': 'sov-local'
}

task_default_queue = config["celery"]["queue"]
broker_url = config["celery"]["broker"]
result_backend = config["celery"]["backend"]


# If we're using SSL, specify the server_hostname
_BROKER_URL = urlparse(config["celery"]["broker"])
SECURE = _BROKER_URL.scheme.endswith("s")
_SERVER_HOSTNAME = _BROKER_URL.hostname

# This option isn't documented anywhere in Celery's docs, and I don't fully understand why it works
# Something to do with rabbitmq.dev.spr.ocket.cloud requiring SNI support
# https://www.ssllabs.com/ssltest/analyze.html?d=rabbitmq.dev.spr.ocket.cloud > "This site works only in browsers with SNI support."
# https://github.com/celery/py-amqp/blob/98f6d364188215c2973693a79e461c7e9b54daef/amqp/transport.py#L488
broker_use_ssl = None

if SECURE:
    broker_use_ssl = {
        'server_hostname': _SERVER_HOSTNAME
    }
