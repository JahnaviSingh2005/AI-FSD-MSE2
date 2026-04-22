# 💰 Personal Expense Management System (MERN Stack)

A full-stack expense tracking application built with **MongoDB, Express, React, and Node.js**.

## 🚀 Features

- **User Authentication** — Register & Login with JWT-based security
- **Add Expenses** — Title, Amount, Category, Date, and Notes
- **View All Expenses** — Dashboard with your full expense history
- **Filter by Category** — Food, Travel, Bills, Shopping, Healthcare, Entertainment, Education, Other
- **Total Expense Summary** — See your total spending at a glance
- **Delete Expenses** — Remove any expense entry

## 🏗️ Project Structure

```
├── backend/              # Node.js + Express API
│   ├── config/
│   │   └── db.js         # MongoDB connection
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verify middleware
│   ├── models/
│   │   ├── User.js       # User schema (bcrypt hashed password)
│   │   └── Expense.js    # Expense schema
│   ├── routes/
│   │   ├── authRoutes.js     # POST /register, POST /login
│   │   └── expenseRoutes.js  # POST /expense, GET /expenses
│   └── server.js         # Express app entry point
│
└── frontend/             # React application
    └── src/
        ├── components/   # Reusable UI components
        ├── pages/        # Register, Login, Dashboard
        ├── context/      # Auth context (token management)
        └── App.js        # Routing
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js >= 16
- MongoDB running locally (or MongoDB Atlas URI)

### Backend

```bash
cd backend
npm install
# Edit .env with your MongoDB URI and JWT secret
npm run dev
# Runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

## 🔑 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login, returns JWT |
| POST | `/expense` | ✅ | Add new expense |
| GET | `/expenses` | ✅ | Get all user expenses |
| GET | `/expenses?category=Food` | ✅ | Filter by category |
| DELETE | `/expense/:id` | ✅ | Delete an expense |

## 🛡️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs |
