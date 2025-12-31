# 🔐 Passly

### _The Future of Self-Hosted Password Management_

![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

Passly is a production-grade, self-hosted password vault designed for security-conscious users who value both aesthetic excellence and hardcore encryption. Built with a modern **FastAPI** backend and a high-performance **React** frontend, Passly provides a "glassmorphic" futuristic interface to manage your digital life.

---

## ✨ Key Features

- 🌌 **Futuristic UI**: A stunning dark-mode interface with neon accents, framer-motion animations, and responsive glassmorphism.
- 🛡️ **Hardened Security**:
  - **Argon2id**: Industry-leading password hashing for user authentication.
  - **AES-256-GCM**: Military-grade authenticated encryption for all stored credentials.
  - **Per-User HKDF**: Unique encryption keys derived for every user, ensuring absolute isolation.
- 🐳 **Dockerized**: One-click deployment using Docker Compose.
- ⚡ **Developer Centric**: Clean TypeScript codebase, Pydantic v2 validation, and async database operations.

---

## 🏗️ Technical Architecture

### **Security First**

Passly doesn't just store passwords; it shields them.

1. **Master Key**: A system-wide master key is defined at the environment level.
2. **Key Derivation**: We use **HKDF (HMAC-based Extract-and-Expand Key Derivation Function)** to derive a unique 256-bit key for each user, using their unique ID as a salt element.
3. **Nonce Management**: Every password entry is encrypted with a unique, randomly generated 96-bit nonce.
4. **Data Integrity**: AES-GCM provides built-in tag verification to prevent ciphertext tampering.

### **The Stack**

- **Frontend**: Vite, React 19, TypeScript, Tailwind CSS v3, Framer Motion, Lucide icons.
- **Backend**: FastAPI, SQLAlchemy 2.0 (Async), Pydantic v2, Jose (JWT).
- **Infrastructure**: Docker, Docker Compose, PostgreSQL 15.

---

## 🚀 Getting Started

### 1. Requirements

- Docker & Docker Compose
- Node.js (Optional, for local development)
- Python 3.10+ (Optional, for local development)

### 2. Configure Environment

Clone the repository and create your `.env` file:

```bash
cp .env.example .env
```

> [!IMPORTANT]
> Make sure to generate a secure `VAULT_MASTER_KEY` and `JWT_SECRET` before deploying.

### 3. Deployment

Simply run:

```bash
docker compose up --build -d
```

Your vault is now live:

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📸 Screenshots

|     Login Page     |  Vault Dashboard   |
| :----------------: | :----------------: |
| _[Add Screenshot]_ | _[Add Screenshot]_ |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

Built with 💜 by **Andrew Ayad**.
