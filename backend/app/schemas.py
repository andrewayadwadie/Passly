from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

# Auth Schemas
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Vault Schemas
class VaultItemBase(BaseModel):
    account_name: str
    url: Optional[str] = None
    login: Optional[str] = None

class VaultItemCreate(VaultItemBase):
    password: str

class VaultItemUpdate(BaseModel):
    account_name: Optional[str] = None
    url: Optional[str] = None
    login: Optional[str] = None
    password: Optional[str] = None

class VaultItemResponse(VaultItemBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    password_masked: bool = True

    class Config:
        from_attributes = True

class VaultItemDetail(VaultItemResponse):
    password: str
