"""Gunicorn configuration for production deployment"""
import os
import multiprocessing

# Server Configuration
bind = f"0.0.0.0:{os.getenv('PORT', 8001)}"
workers = int(os.getenv('WORKERS', multiprocessing.cpu_count() * 2 + 1))
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 120
keepalive = 2
preload_app = True

# Logging
loglevel = os.getenv('LOG_LEVEL', 'info').lower()
accesslog = '-'
errorlog = '-'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = 'notez_fun_backend'

# Security
limit_request_line = 4096
limit_request_fields = 100
limit_request_field_size = 8190

# Performance
worker_tmp_dir = '/dev/shm'

# Graceful timeout for worker restart
graceful_timeout = 120

# Callbacks
def when_ready(server):
    server.log.info("NOTEZ FUN Backend is ready to serve requests")

def worker_int(worker):
    worker.log.info("Worker received INT or QUIT signal")

def pre_fork(server, worker):
    server.log.info("Worker spawned (pid: %s)", worker.pid)

def post_fork(server, worker):
    server.log.info("Worker spawned (pid: %s)", worker.pid)
