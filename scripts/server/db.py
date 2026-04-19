from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from config.machine import MACHINE_CONFIG

DATABASE_URL = "postgresql+asyncpg://user:password@localhost:5432/zolai"


async def get_async_engine():
    """Create async SQLAlchemy engine with machine-optimized settings."""
    return create_async_engine(
        DATABASE_URL,
        pool_size=MACHINE_CONFIG.db_pool_size,
        max_overflow=MACHINE_CONFIG.db_max_overflow,
        echo=MACHINE_CONFIG.db_echo,
        pool_pre_ping=True,
        pool_recycle=3600,
        connect_args={"timeout": 10, "command_timeout": 60},
    )


async def get_async_session_factory():
    """Create async session factory."""
    engine = await get_async_engine()
    return sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@asynccontextmanager
async def get_async_session() -> AsyncIterator[AsyncSession]:
    """Get async database session with context manager."""
    factory = await get_async_session_factory()
    async with factory() as session:
        yield session


async def batch_insert(
    session: AsyncSession, model, items: list, batch_size: int | None = None
) -> int:
    """Batch insert items efficiently."""
    batch_size = batch_size or MACHINE_CONFIG.batch_size
    count = 0

    for i in range(0, len(items), batch_size):
        batch = items[i : i + batch_size]
        session.add_all([model(**item) for item in batch])
        await session.commit()
        count += len(batch)

    return count


async def batch_query(
    session: AsyncSession, query, batch_size: int | None = None
) -> AsyncIterator[list]:
    """Batch query results efficiently."""
    batch_size = batch_size or MACHINE_CONFIG.batch_size
    offset = 0

    while True:
        result = await session.execute(query.offset(offset).limit(batch_size))
        items = result.scalars().all()
        if not items:
            break
        yield items
        offset += batch_size
