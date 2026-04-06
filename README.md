backend URL is VITE_API_URL=https://project-full-stack-mern-application-pro.onrender.com/api
front end -protaskersapp.netlify.app



Project-Full-Stack-MERN-Application-Pro-Tasker/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── server.ts
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.tsx
│   └── vite.config.ts
│
└── README.md

This is a full-stack task management app I built using the MERN stack.
Users can register, log in, create projects, and manage tasks inside each project.

Technology stack -
Frontend: React (Vite + TypeScript), Context API, Axios
Backend: Node.js, Express, MongoDB, Mongoose
Auth: JWT + bcrypt

Features
User registration & login
JWT authentication
Create and view projects
Add, update, and delete tasks
Protected route

Features
User registration & login
JWT authentication
Create and view projects
Add, update, and delete tasks
Protected route

Frontend

Dependencies:

axios
react
react-dom
react-router-dom

Backend

Dependencies:

bcrypt
cors
dotenv
express
jsonwebtoken
mongoose