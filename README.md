# SGQ Atlas Pro

## Structure
This project is divided into two parts:
- **frontend/**: React + Vite application.
- **backend/**: Node.js + Express + Sequelize API.

## Setup
### Backend
1. Go to `backend/` directory.
2. Run `npm install`.
3. Create `.env` file (copy from `.env.example` if available) or set environment variables.
4. Run `npm run dev` for development or `npm start` for production.

### Frontend
1. Go to `frontend/` directory.
2. Run `npm install`.
3. Run `npm run dev` to start the development server.
4. Run `npm run build` to create static files for production.

## Deployment on Hostinger
1. **Backend**: Create a Node.js Application pointing to the `backend` directory (or upload `backend` files). Set environment variables (DB credentials, PORT).
2. **Frontend**: Build locally (`npm run build` inside `frontend`) and upload the `dist` folder contents to `public_html`.
