import os
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from argon2 import PasswordHasher
from datetime import datetime, timedelta
from typing import Optional, Any
from jose import jwt, JWTError
from .config import settings

ph = PasswordHasher()

def get_password_hash(password: str) -> str:
    return ph.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return ph.verify(hashed_password, plain_password)
    except:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)
    return encoded_jwt

# Vault Encryption
def derive_user_key(user_id: str) -> bytes:
    master_key = base64.b64decode(settings.VAULT_MASTER_KEY)
    hkdf = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=user_id.encode(),
    )
    return hkdf.derive(master_key)

def encrypt_password(password: str, user_id: str) -> tuple[str, str]:
    key = derive_user_key(user_id)
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, password.encode(), None)
    return base64.b64encode(ciphertext).decode(), base64.b64encode(nonce).decode()

def decrypt_password(encrypted_password: str, nonce: str, user_id: str) -> str:
    key = derive_user_key(user_id)
    aesgcm = AESGCM(key)
    ciphertext = base64.b64decode(encrypted_password)
    nonce_bytes = base64.b64decode(nonce)
    decrypted_data = aesgcm.decrypt(nonce_bytes, ciphertext, None)
    return decrypted_data.decode()
