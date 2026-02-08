# Manufacturing Monitoring Backend

A production-grade backend system for real-time manufacturing monitoring. This system ingests test data from machines, processes it (PASS/FAIL determination), stores it in MySQL, and exposes real-time results via WebSockets and REST APIs to a React dashboard.

## 🏗 System Architecture

The system follows a microservices architecture:

1.  **Ingestion Service** (FastAPI): Receives raw test data from machines, validates it, and pushes to RabbitMQ.
2.  **Processing Service** (Python Worker): Consumes messages, applies business logic (PASS/FAIL), stores to MySQL, and publishes events for real-time broadcasting.
3.  **API Service** (FastAPI): Provides REST endpoints for history/metrics and WebSockets for live updates.
4.  **Frontend Service** (React + Vite): Real-time dashboard using WebSockets and Recharts.

### Tech Stack

*   **Language**: Python 3.10+, TypeScript (React)
*   **Frameworks**: FastAPI, Uvicorn, React, TailwindCSS
*   **Database**: MySQL 8.0 (Async/Await with SQLAlchemy & aiomysql)
*   **Message Queue**: RabbitMQ (aio-pika)
*   **Infrastructure**: Docker, Docker Compose

## 🚀 How to Run Locally

### Prerequisites

*   Docker (Daemon must be running)
*   Docker Compose

### Steps

1.  **Clone the repository**:
    ```bash
    git clone <repo_url>
    cd manufacturing-backend
    ```

2.  **Start all services**:
    ```bash
    docker-compose up --build
    ```

3.  **Access the Dashboard**:
    Open [http://localhost:5173](http://localhost:5173) in your browser.

4.  **Access API Docs**:
    *   Ingestion API: [http://localhost:8001/docs](http://localhost:8001/docs)
    *   Read API: [http://localhost:8000/docs](http://localhost:8000/docs)

5.  **Simulate Data Ingestion**:
    Send a dummy payload to the ingestion service:

    ```bash
    curl -X POST http://localhost:8001/ingest \
      -H "Content-Type: application/json" \
      -d '{
        "barcode": "SN-1001",
        "machine_id": "MACH-01",
        "product_id": "PROD-A",
        "test_step": "voltage_test",
        "measured_value": 85.5,
        "timestamp": "2023-10-27T10:00:00"
      }'
    ```
    
    Check the dashboard to see it appear live!

## 🧪 Testing

Run unit tests via Docker:

```bash
docker-compose run api pytest
```

## 📂 Project Structure

```
.
├── backend/
│   ├── ingestion/    # Ingestion Microservice
│   ├── processing/   # Background Worker
│   └── api/          # Read API & WebSockets
├── frontend/         # React Dashboard
├── docker-compose.yml
└── README.md
```

## 📈 Scalability

*   **Decoupling**: RabbitMQ ensures ingestion handles high throughput without blocking processing.
*   **Stateless**: All services are stateless and can be horizontally scaled (RabbitMQ and MySQL act as bottlenecks, but can be clustered).
*   **Async**: Python `asyncio` ensures high concurrency for I/O bound tasks.
