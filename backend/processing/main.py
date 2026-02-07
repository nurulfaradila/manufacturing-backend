import aio_pika
import asyncio
import json
import os
import logging
import functools
from datetime import datetime
from database import TestResult, TestStatus, AsyncSessionLocal, init_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("processing_service")

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
QUEUE_NAME = "test_results_queue"

PASS_THRESHOLD = 80.0  # Dummy business logic threshold

async def process_message(channel: aio_pika.abc.AbstractChannel, message: aio_pika.IncomingMessage):
    async with message.process():
        try:
            data = json.loads(message.body.decode())
            logger.info(f"Received message: {data}")
            
            # Business Logic
            measured_value = data.get("measured_value", 0.0)
            status = TestStatus.PASS if measured_value >= PASS_THRESHOLD else TestStatus.FAIL
            
            # Store in Database
            async with AsyncSessionLocal() as session:
                new_result = TestResult(
                    barcode=data.get("barcode"),
                    machine_id=data.get("machine_id"),
                    product_id=data.get("product_id"),
                    measured_value=measured_value,
                    status=status,
                    timestamp=datetime.fromisoformat(data.get("timestamp"))
                )
                session.add(new_result)
                await session.commit()
                
                logger.info(f"Processed and saved result for barcode {data.get('barcode')} as {status.value}")

                # Publish processed result for Real-time API
                await channel.default_exchange.publish(
                    aio_pika.Message(
                        body=json.dumps({
                            "barcode": new_result.barcode,
                            "machine_id": new_result.machine_id,
                            "product_id": new_result.product_id,
                            "measured_value": new_result.measured_value,
                            "status": new_result.status.value,
                            "timestamp": new_result.timestamp.isoformat()
                        }).encode(),
                        delivery_mode=aio_pika.DeliveryMode.PERSISTENT
                    ),
                    routing_key="processed_results_queue"
                )

        except Exception as e:
            logger.error(f"Error processing message: {e}")

async def main():
    # ... (init_db logic)
    await init_db()
    
    logger.info("Connecting to RabbitMQ...")
    connection = await aio_pika.connect_robust(RABBITMQ_URL)
    
    async with connection:
        channel = await connection.channel()
        # Declare queue (ensure it matches producer)
        queue = await channel.declare_queue(QUEUE_NAME, durable=True)
        # Declare output queue for API service
        await channel.declare_queue("processed_results_queue", durable=True)
        
        logger.info("Waiting for messages...")
        
        # Use partial to pass the channel to the callback
        on_message = functools.partial(process_message, channel)
        
        await queue.consume(
            on_message
        )
        
        # Keep running
        await asyncio.Future()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Processing service stopped")
