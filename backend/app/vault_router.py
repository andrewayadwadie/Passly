from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from . import models, schemas, security, db
from .auth_router import get_current_user

router = APIRouter(prefix="/vault", tags=["vault"])

@router.get("/items", response_model=List[schemas.VaultItemResponse])
async def list_items(
    query: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(db.get_db)
):
    stmt = select(models.VaultItem).where(models.VaultItem.user_id == current_user.id)
    if query:
        stmt = stmt.where(models.VaultItem.account_name.ilike(f"%{query}%"))
    
    result = await session.execute(stmt)
    return result.scalars().all()

@router.post("/items", response_model=schemas.VaultItemResponse)
async def create_item(
    item: schemas.VaultItemCreate,
    current_user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(db.get_db)
):
    # Check if item with same account_name exists
    result = await session.execute(
        select(models.VaultItem).where(
            models.VaultItem.user_id == current_user.id,
            models.VaultItem.account_name == item.account_name
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Account name already exists")

    encrypted_pwd, nonce = security.encrypt_password(item.password, str(current_user.id))
    
    db_item = models.VaultItem(
        user_id=current_user.id,
        account_name=item.account_name,
        url=item.url,
        login=item.login,
        password_encrypted=encrypted_pwd,
        password_nonce=nonce
    )
    session.add(db_item)
    await session.commit()
    await session.refresh(db_item)
    return db_item

@router.get("/items/{item_id}", response_model=schemas.VaultItemResponse)
async def get_item(
    item_id: str,
    current_user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(db.get_db)
):
    result = await session.execute(
        select(models.VaultItem).where(
            models.VaultItem.id == item_id,
            models.VaultItem.user_id == current_user.id
        )
    )
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@router.post("/items/{item_id}/reveal", response_model=schemas.VaultItemDetail)
async def reveal_password(
    item_id: str,
    current_user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(db.get_db)
):
    result = await session.execute(
        select(models.VaultItem).where(
            models.VaultItem.id == item_id,
            models.VaultItem.user_id == current_user.id
        )
    )
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    decrypted_password = security.decrypt_password(
        db_item.password_encrypted,
        db_item.password_nonce,
        str(current_user.id)
    )
    
    return {
        **db_item.__dict__,
        "password": decrypted_password,
        "password_masked": False
    }

@router.put("/items/{item_id}", response_model=schemas.VaultItemResponse)
async def update_item(
    item_id: str,
    item_update: schemas.VaultItemUpdate,
    current_user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(db.get_db)
):
    result = await session.execute(
        select(models.VaultItem).where(
            models.VaultItem.id == item_id,
            models.VaultItem.user_id == current_user.id
        )
    )
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = item_update.model_dump(exclude_unset=True)
    if "password" in update_data:
        new_pwd = update_data.pop("password")
        encrypted_pwd, nonce = security.encrypt_password(new_pwd, str(current_user.id))
        db_item.password_encrypted = encrypted_pwd
        db_item.password_nonce = nonce
    
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    await session.commit()
    await session.refresh(db_item)
    return db_item

@router.delete("/items/{item_id}")
async def delete_item(
    item_id: str,
    current_user: models.User = Depends(get_current_user),
    session: AsyncSession = Depends(db.get_db)
):
    result = await session.execute(
        select(models.VaultItem).where(
            models.VaultItem.id == item_id,
            models.VaultItem.user_id == current_user.id
        )
    )
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    await session.delete(db_item)
    await session.commit()
    return {"message": "Item deleted"}
