# EduSphere | MERN Stack School Management System

This is a comprehensive school management system constructed using the MERN stack (MongoDB, Express, React, Node.js), styling with Tailwind CSS, data visualizations with Recharts, and reports with jsPDF.

## Key Features

- **JWT Authentication & RBAC**: Safe log-ins for Admin and Teacher roles.
- **Data Records CRUD**: Monitor and manage Classes, Students, and Teachers.
- **Attendance Logging**: Log daily attendance grid sheets.
- **Fees Invoices**: Record fee payments and review transaction logs.
- **Class Analytics**: Render male/female student ratio pie charts.
- **Finance Analytics**: Compare tuition earnings vs payroll outlays in area charts.
- **PDF Reports**: Export student registries or fee histories instantly.
- **Dark Mode**: Supports light and dark modes.

---

## Folder Layout

```
school-management-system/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route logic controllers
│   ├── middleware/      # JWT validation / role filters
│   ├── models/          # Database Schemas (User, Student, Class, etc.)
│   ├── routes/          # REST Endpoint routes mapping
│   ├── Dockerfile       # Backend container file
│   ├── server.js        # Express application entrypoint
│   └── seed.js          # Database seeding script
├── frontend/
│   ├── nginx.conf       # SPA Nginx redirection config
│   ├── Dockerfile       # Frontend container file
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/             # React application source code
└── docker-compose.yml   # Multi-container conductor
```

---

## Setup & Local Run Instructions

### 1. Active Workspace Note
To get the most out of your coding agent, set the project directory as the active workspace path:
`C:\Users\NIRAJ MAHAJAN\.gemini\antigravity\scratch\school-management-system`

### 2. Run Database Seeding
First, navigate to the `backend` directory, install packages, and seed database records:
```bash
cd backend
npm install
npm run seed
```
This loads test accounts, classes, teachers, student rosters, fees payment receipts, and attendance data.

### 3. Start Local Development Servers

- **Backend API**:
  ```bash
  cd backend
  npm install
  npm run dev
  ```
  The API launches on port `5000` (connecting to `mongodb://localhost:27017/school_db`).

- **Frontend React**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  The Vite server launches on port `3000`.

Open [http://localhost:3000](http://localhost:3000) and sign in using:
- **Admin**: `admin` / `admin123`
- **Teacher**: `teacher` / `teacher123`

---

## Docker-Compose Production Deployment

Build and spin up the complete cluster (Database, API, Web Server) using:
```bash
docker-compose up --build
```
This will:
- Spin up MongoDB on port `27017`.
- Spin up the backend API on port `5000`.
- Serve the React SPA through Nginx on port `80`.

Open [http://localhost](http://localhost) in your web browser.
