# LegalMetrix: Deployment & Configuration Guide

## 1. Quick Start (Development Mode)

The application includes an embedded profile that requires zero external setup.

### Backend:
```bash
cd server
mvn spring-boot:run
```
* Backend starts at `http://localhost:8080`
* Swagger UI documentation available at `http://localhost:8080/swagger-ui.html`
* H2 DB console available at `http://localhost:8080/h2-console`

### Frontend:
```bash
cd client
npm install
npm run dev
```
* Frontend starts at `http://localhost:5173`

---

## 2. Production Deployment (Docker Compose with MySQL 8)

### Run all services in containers:
```bash
docker-compose up -d --build
```

Services:
* `mysql`: Port 3306 (MySQL 8 database)
* `backend`: Port 8080 (Spring Boot Java 21)
* `frontend`: Port 80 (Nginx serving built React Vite frontend and reverse-proxying `/api`)

---

## 3. Environment Variables (.env)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile (`dev` or `mysql`) | `dev` |
| `DB_URL` | MySQL JDBC Connection URL | `jdbc:mysql://localhost:3306/legalmetrix` |
| `DB_USERNAME` | MySQL database username | `root` |
| `DB_PASSWORD` | MySQL database password | `root` |
| `JWT_SECRET` | Secret key for JWT signing | `404E6352...` |
| `FILE_STORAGE_PATH` | Directory for PDF/DOCX storage | `./uploads` |
