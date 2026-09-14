import uuid
import threading

# Simple in-memory job store
# Format: { "job_id": { "status": "pending|done|error", "images": [], "summary": [], "error": "" } }
jobs = {}
jobs_lock = threading.Lock()

def create_job():
    job_id = str(uuid.uuid4())
    with jobs_lock:
        jobs[job_id] = {
            "status": "pending",
            "images": [],
            "summary": [],
            "error": None
        }
    return job_id

def update_job(job_id: str, status: str, images: list = None, summary: list = None, error: str = None):
    with jobs_lock:
        if job_id in jobs:
            jobs[job_id]["status"] = status
            if images is not None:
                jobs[job_id]["images"] = images
            if summary is not None:
                jobs[job_id]["summary"] = summary
            if error is not None:
                jobs[job_id]["error"] = error

def get_job(job_id: str):
    with jobs_lock:
        return jobs.get(job_id)
