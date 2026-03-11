# 🚀 Hired. — Déploiement Railway

## Structure du projet

```
hired_groq/
├── backend/        ← Service 1 (FastAPI + Python)
├── frontend/       ← Service 2 (React + Vite)
└── RAILWAY_DEPLOY.md
```

---

## Étapes de déploiement

### 1. Pusher sur GitHub
```bash
git init
git add .
git commit -m "initial"
git remote add origin https://github.com/TON_COMPTE/hired.git
git push -u origin main
```

### 2. Créer le projet Railway
- Aller sur [railway.app](https://railway.app)
- New Project → Deploy from GitHub repo → sélectionner ton repo

### 3. Ajouter Postgres
- Dans le projet Railway : **+ New** → **Database** → **Add PostgreSQL**
- Railway crée automatiquement `DATABASE_URL`

### 4. Configurer le service **Backend**
- Dans le service `hired` (ou renommer en `backend`)
- **Settings** → **Source** → Root Directory: `backend`
- **Variables** → Ajouter:
  ```
  GROQ_API_KEY=gsk_xxxxxxxxxxxx
  SECRET_KEY=une-cle-secrete-longue-et-random
  JSEARCH_API_KEY=ta_cle_rapidapi  (optionnel)
  DATABASE_URL=${{Postgres.DATABASE_URL}}
  ALLOWED_ORIGINS=["https://TON_FRONTEND.up.railway.app"]
  ```

### 5. Ajouter le service **Frontend**
- **+ New** → **GitHub Repo** → même repo
- **Settings** → **Source** → Root Directory: `frontend`
- **Variables** → Ajouter:
  ```
  VITE_API_URL=https://TON_BACKEND.up.railway.app/api
  ```

### 6. Vérifier
- Backend: `https://TON_BACKEND.up.railway.app/docs` → Swagger UI
- Frontend: `https://TON_FRONTEND.up.railway.app`

---

## Variables d'environnement résumé

| Service   | Variable          | Valeur                                      |
|-----------|-------------------|---------------------------------------------|
| Backend   | `GROQ_API_KEY`    | Ta clé Groq (groq.com)                      |
| Backend   | `SECRET_KEY`      | Chaîne aléatoire sécurisée                  |
| Backend   | `DATABASE_URL`    | `${{Postgres.DATABASE_URL}}`                |
| Backend   | `ALLOWED_ORIGINS` | `["https://ton-frontend.up.railway.app"]`   |
| Frontend  | `VITE_API_URL`    | `https://ton-backend.up.railway.app/api`    |

---

## Test local (sans Docker)
```bash
# Backend
cd backend
pip install -r requirements.txt
cp ../.env.example .env  # remplir les clés
uvicorn app.main:app --reload --port 8000

# Frontend (autre terminal)
cd frontend
npm install
npm run dev
```
