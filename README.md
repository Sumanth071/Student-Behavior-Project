# AI-Based Student Behaviour Analysis and Performance Monitoring System

A full-stack MERN web application for colleges to monitor student behaviour, academic performance, and risk indicators through a modern analytics dashboard.

## Tech Stack

- React.js
- Tailwind CSS
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Recharts

## Main Modules

- Authentication with role-based login
- Dashboard
- Student Management
- Attendance Management
- Marks Management
- Behaviour Tracking
- Reports and Analytics
- Notifications and Alerts

## Extra Features Added

- Dark mode toggle
- Export student report to PDF
- Search and filter by class, department, section, and semester
- Risk student highlight section on the dashboard

## Roles

- Admin
- Teacher
- Student
- Parent

## Demo Credentials

- Admin: `admin@campusai.edu` / `password123`
- Teacher: `teacher@campusai.edu` / `password123`
- Student: `student@campusai.edu` / `password123`
- Parent: `parent@campusai.edu` / `password123`

## Behaviour Score Formula

The behaviour score is calculated from:

- Attendance rate: 25%
- Average marks: 35%
- Participation: 15%
- Discipline: 15%
- Assignment submission rate: 10%

Risk levels:

- Low: score `>= 75`
- Medium: score `>= 50` and `< 75`
- High: score `< 50`

## Project Structure

```text
SMS/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── data/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
└── README.md
```

## Setup Instructions

### 1. Configure Environment Variables

Create local environment files from the examples:

- Copy `server/.env.example` to `server/.env`
- Copy `client/.env.example` to `client/.env`

### 2. Install Dependencies

Server:

```powershell
cd server
npm install
```

Client:

```powershell
cd client
npm install
```

### 3. Start MongoDB

Use local MongoDB or MongoDB Atlas. By default the backend expects:

```env
MONGO_URI=mongodb://127.0.0.1:27017/ai-student-monitoring
```

### 4. Seed Demo Data

```powershell
cd server
npm run seed
```

If `AUTO_SEED=true`, the backend also seeds automatically when the database is empty.

### 5. Run the Application

Backend:

```powershell
cd server
npm run dev
```

Frontend:

```powershell
cd client
npm run dev
```

Frontend URL:

- `http://localhost:5173`

Backend URL:

- `http://localhost:5000`

## API Overview

### Auth

- `POST /api/auth/login`
- `GET /api/auth/profile`

### Dashboard

- `GET /api/dashboard/summary`

### Students

- `GET /api/students`
- `GET /api/students/:id`
- `POST /api/students`
- `PUT /api/students/:id`
- `DELETE /api/students/:id`

### Attendance

- `GET /api/attendance`
- `POST /api/attendance`
- `PUT /api/attendance/:id`
- `DELETE /api/attendance/:id`

### Marks

- `GET /api/marks`
- `POST /api/marks`
- `PUT /api/marks/:id`
- `DELETE /api/marks/:id`

### Behaviour

- `GET /api/behaviour`
- `GET /api/behaviour/student/:studentId`
- `POST /api/behaviour`
- `PUT /api/behaviour/:id`
- `DELETE /api/behaviour/:id`

### Reports

- `GET /api/reports/analytics`
- `GET /api/reports/students/:studentId`

### Notifications

- `GET /api/notifications`
- `POST /api/notifications`
- `PUT /api/notifications/:id`
- `DELETE /api/notifications/:id`

## Deployment Notes

### Frontend

- Deploy the `client` folder to Vercel or Netlify
- Set `VITE_API_URL` to the deployed backend API URL

### Backend

- Deploy the `server` folder to Render, Railway, or Cyclic
- Set `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, and `AUTO_SEED`

### MongoDB

- Use MongoDB Atlas for cloud deployment

## Submission Highlights

- Professional dashboard UI with responsive sidebar and top navbar
- Role-based authentication
- Beginner-friendly folder structure
- Full CRUD functionality
- Behaviour score analytics with risk prediction
- Seed data for instant demo
- PDF export for presentation impact
- Dark mode for polished UX

