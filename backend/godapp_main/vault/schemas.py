from datetime import datetime

from pydantic import BaseModel, ConfigDict


class VaultEntrySchema(BaseModel):
    """Schema for a VaultEntry."""

    id: int
    name: str
    url: str | None = None
    data: str  # E2E encrypted data
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VaultEntryCreateSchema(BaseModel):
    """Schema for creating a VaultEntry."""

    name: str
    url: str | None = None
    data: str  # Expecting E2E encrypted data from the client
