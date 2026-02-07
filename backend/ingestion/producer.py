import aio_pika
import json
import os
import logging

logger = logging.getLogger(__name__)

class APIProducer:
    def __init__(self):
        self.connection = None
        self.channel = None
        self.exchange = None
        self.rabbitmq_url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
        self.queue_name = "test_results_queue"

    async def connect(self):
        try:
            self.connection = await aio_pika.connect_robust(self.rabbitmq_url)
            self.channel = await self.connection.channel()
            # Declare queue to ensure it exists
            await self.channel.declare_queue(self.queue_name, durable=True)
            logger.info("Connected to RabbitMQ")
        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            raise

    async def close(self):
        if self.connection:
            await self.connection.close()

    async def publish(self, message: dict):
        if not self.channel:
            raise RuntimeError("RabbitMQ channel is not initialized")
        
        await self.channel.default_exchange.publish(
            aio_pika.Message(
                body=json.dumps(message, default=str).encode(),
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT
            ),
            routing_key=self.queue_name
        )
