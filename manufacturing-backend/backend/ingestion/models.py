from pydantic import BaseModel, Field
from datetime import datetime

class TestResultPayload(BaseModel):
    barcode: str = Field(..., description="Unique barcode of the product")
    machine_id: str = Field(..., description="ID of the machine performing the test")
    product_id: str = Field(..., description="ID of the product type")
    test_step: str = Field(..., description="Name of the test step")
    measured_value: float = Field(..., description="The value measured during the test")
    timestamp: datetime = Field(..., description="Time when the test occurred")

    class Config:
        json_schema_extra = {
            "example": {
                "barcode": "123456789",
                "machine_id": "JIG-01",
                "product_id": "PROD-X",
                "test_step": "voltage_check",
                "measured_value": 5.12,
                "timestamp": "2023-10-27T10:00:00Z"
            }
        }
