import os
import threading
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from app.jobs import create_job, update_job, get_job
from app.article import get_article_data
from app.summarizer import get_summary
from app.image_processor import create_story_image

app = FastAPI(title="Article Summarizer API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory to save generated images
OUTPUT_DIR = "tmp_images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

class SummarizeRequest(BaseModel):
    url: str
    sentence_count: Optional[int] = 5
    algorithm: Optional[str] = "luhn"

def process_article_job(job_id: str, request: SummarizeRequest):
    try:
        # 1. Download and parse article
        article_data = get_article_data(request.url)
        
        # 2. Summarize
        summary_sentences = get_summary(article_data["text"], request.sentence_count, request.algorithm)
        
        if not summary_sentences:
            update_job(job_id, status="error", error="Could not generate a summary. The article might be empty or unparseable.")
            return

        images = article_data["images"]
        if not images:
            update_job(job_id, status="error", error="No images found in the article.")
            return

        # 3. Create images
        generated_images = []
        
        image_index = 0
        for i, sentence in enumerate(summary_sentences):
            success = False
            # Try up to len(images) times to find a working image for this sentence
            for _ in range(len(images)):
                img_url = images[image_index % len(images)]
                image_index += 1
                
                output_filename = f"{job_id}_{i}.jpg"
                output_path = os.path.join(OUTPUT_DIR, output_filename)
                
                try:
                    create_story_image(img_url, sentence, output_path)
                    generated_images.append(output_filename)
                    success = True
                    break # Found a working image for this sentence!
                except Exception as e:
                    print(f"Failed to process image {img_url}: {e}")
            
            if not success:
                print(f"Could not generate an image for sentence {i}")
                
        if not generated_images:
            update_job(job_id, status="error", error="Failed to process any images. The website may be blocking image downloads.")
            return
            
        update_job(job_id, status="done", images=generated_images, summary=summary_sentences)

    except Exception as e:
        update_job(job_id, status="error", error=str(e))


@app.post("/api/summarize")
def summarize_article(request: SummarizeRequest, background_tasks: BackgroundTasks):
    job_id = create_job()
    
    # We use threading.Thread or BackgroundTasks to run it asynchronously
    # background_tasks runs after the response is sent.
    background_tasks.add_task(process_article_job, job_id, request)
    
    return {"job_id": job_id}


@app.get("/api/jobs/{job_id}")
def get_job_status(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.get("/api/images/{filename}")
def get_image(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)

