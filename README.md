# Roxiler - Store Ratings (Intern Coding Challenge)

This repository contains a simple full-stack application for submitting and managing store ratings.

## Structure
- `backend/` - Express.js API with SQLite database
- `frontend/` - React.js application created with Create React App

## Quick start (local)

Prerequisites: Node.js (14+), npm

1. Backend
   - cd backend
   - copy `.env.example` to `.env` and update values if needed
   - npm install
   - npm run dev (or npm start)

2. Frontend
   - cd frontend
   - npm install
   - npm start

The frontend dev server proxies API requests to `http://localhost:5000`.

## API
See `backend/` for routes. Key endpoints:
- POST `/api/auth/signup`
- POST `/api/auth/login`
- Protected routes under `/api/admin`, `/api/user`, `/api/owner`

## Notes
- JWT secret should be set in `.env` as `JWT_SECRET`.
- Database file: `backend/database.sqlite` is created automatically.

## Development
- Use nodemon for backend while developing: `npm run dev` in the backend directory.

## License
MIT
