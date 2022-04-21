from config import config

broker_transport_options = {
    'queue_name_prefix': 'sov-local'
}

task_default_queue = config["celery"]["queue"]
broker_url = config["celery"]["broker"]
result_backend = config["celery"]["backend"]