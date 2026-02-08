from fastapi import FastAPI, HTTPException, status
from models import TestResultPayload
from producer import APIProducer
import logging
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ingestion_service")

producer = APIProducer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await producer.connect()
    yield
    # Shutdown
    await producer.close()

app = FastAPI(title="Ingestion Service", lifespan=lifespan)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/ingest", status_code=status.HTTP_202_ACCEPTED)
async def ingest_test_result(payload: TestResultPayload):
    try:
        await producer.publish(payload.model_dump())
        logger.info(f"Ingested result for barcode: {payload.barcode}")
        return {"message": "Data received and queued"}
    except Exception as e:
        logger.error(f"Error publishing message: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
