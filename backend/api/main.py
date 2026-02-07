from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from .database import AsyncSessionLocal, TestResult, TestStatus
from typing import List
import asyncio
import aio_pika
import json
import logging
import os
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api_service")

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")

manager = ConnectionManager()

# Background task to consume processed results and broadcast
async def consume_processed_results():
    while True:
        try:
            connection = await aio_pika.connect_robust(RABBITMQ_URL)
            async with connection:
                channel = await connection.channel()
                # Declare the queue (must match processing service)
                queue = await channel.declare_queue("processed_results_queue", durable=True)
                
                logger.info("Connected to RabbitMQ for broadcasting...")
                
                async with queue.iterator() as queue_iter:
                    async for message in queue_iter:
                        async with message.process():
                            body = message.body.decode()
                            # Broadcast to all connected WebSockets
                            await manager.broadcast(body)
        except Exception as e:
            logger.error(f"RabbitMQ consumer error: {e}")
            await asyncio.sleep(5)  # access Retry delay

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background consumer
    task = asyncio.create_task(consume_processed_results())
    yield
    # Cleanup (if needed)
    task.cancel()

app = FastAPI(title="Manufacturing API Service", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/machines/{machine_id}/status")
async def get_machine_status(machine_id: str, db: AsyncSession = Depends(get_db)):
    # Get the latest result for this machine
    result = await db.execute(
        select(TestResult)
        .where(TestResult.machine_id == machine_id)
        .order_by(TestResult.timestamp.desc())
        .limit(1)
    )
    latest = result.scalar_one_or_none()
    if not latest:
        raise HTTPException(status_code=404, detail="Machine not found")
    return latest

@app.get("/results")
async def get_results(skip: int = 0, limit: int = 20, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TestResult)
        .order_by(TestResult.timestamp.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@app.get("/metrics")
async def get_metrics(db: AsyncSession = Depends(get_db)):
    # Calculate Total, Pass, Fail
    total = await db.scalar(select(func.count(TestResult.id)))
    passed = await db.scalar(select(func.count(TestResult.id)).where(TestResult.status == TestStatus.PASS))
    failed = await db.scalar(select(func.count(TestResult.id)).where(TestResult.status == TestStatus.FAIL))
    
    return {
        "total_tests": total,
        "pass_count": passed,
        "fail_count": failed,
        "pass_rate": (passed / total * 100) if total else 0
    }

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, maybe wait for client messages (ping)
            # For now, just wait indefinitely or handle disconnect
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
