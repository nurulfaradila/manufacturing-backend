from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Float, DateTime, Enum, Integer
from datetime import datetime
import os
import enum

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+aiomysql://user:password@mysql/manufacturing_db")

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

class Base(DeclarativeBase):
    pass

class TestStatus(str, enum.Enum):
    PASS = "PASS"
    FAIL = "FAIL"

class TestResult(Base):
    __tablename__ = "test_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    barcode: Mapped[str] = mapped_column(String(255), index=True)
    machine_id: Mapped[str] = mapped_column(String(50), index=True)
    product_id: Mapped[str] = mapped_column(String(50))
    measured_value: Mapped[float] = mapped_column(Float)
    status: Mapped[TestStatus] = mapped_column(Enum(TestStatus))
    timestamp: Mapped[datetime] = mapped_column(DateTime)

# Note: No init_db here as the processing service or generic init script should handle migration/creation.
