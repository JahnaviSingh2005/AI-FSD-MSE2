# 💰 Personal Expense Management System — Complete Documentation

## MSE-2 Full Stack Development Project | MERN Stack

---

## 📌 Project Overview

A full-stack web application that allows users to **register, login, and manage daily expenses securely**. Built using the **MERN Stack** — MongoDB, Express.js, React.js, and Node.js.

**Live URLs:**
- Frontend (Vercel): `https://ai-fsd-mse-2.vercel.app`
- Backend (Render): `https://ai-fsd-mse2.onrender.com`
- GitHub: `https://github.com/JahnaviSingh2005/AI-FSD-MSE2`

---

## 🏗️ Project Structure

```
AI-FSD-MSE2/
│
├── .gitignore                  # Git ignore rules (node_modules, .env, build)
├── README.md                   # Project overview & setup guide
├── PROJECT_DOCUMENTATION.md    # This file — full documentation
│
├── backend/                    # ─── Node.js + Express API Server ───
│   ├── .env                    # Environment variables (not pushed to GitHub)
│   ├── package.json            # Dependencies & scripts
│   ├── package-lock.json       # Locked dependency versions
│   ├── server.js               # Express app entry point
│   │
│   ├── config/
│   │   └── db.js               # MongoDB connection logic
│   │
│   ├── models/
│   │   ├── User.js             # User schema (bcrypt hashed password)
│   │   └── Expense.js          # Expense schema (linked to User)
│   │
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verification middleware
│   │
│   └── routes/
│       ├── authRoutes.js       # POST /register, POST /login
│       └── expenseRoutes.js    # POST /expense, GET /expenses, DELETE /expense/:id
│
└── frontend/                   # ─── React Application ───
    ├── package.json            # Dependencies & scripts
    ├── public/
    │   └── index.html          # HTML entry point
    │
    └── src/
        ├── index.js            # React DOM render entry
        ├── index.css           # Complete design system (570 lines)
        ├── App.js              # Root component — routing & auth state
        ├── api.js              # All API calls (fetch wrapper)
        │
        └── pages/
            ├── Register.js     # Registration form page
            ├── Login.js        # Login form page
            └── Dashboard.js    # Expense list, add form, filters, stats
```

---

## 🔧 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│                    Deployed on Vercel                        │
│                                                             │
│  ┌──────────┐   ┌──────────┐   ┌────────────────────────┐  │
│  │ Register │   │  Login   │   │      Dashboard         │  │
│  │  Page    │   │  Page    │   │  (Stats + Add + List)  │  │
│  └────┬─────┘   └────┬─────┘   └──────────┬─────────────┘  │
│       │              │                     │                │
│       └──────────────┴─────────────────────┘                │
│                        │                                    │
│                   api.js (fetch)                            │
│              localStorage (JWT token)                       │
└────────────────────────┬────────────────────────────────────┘
                         │  HTTP (REST API)
                         │  Authorization: Bearer <JWT>
┌────────────────────────┴────────────────────────────────────┐
│                    BACKEND (Express.js)                      │
│                    Deployed on Render                        │
│                                                             │
│  server.js ──► CORS + JSON middleware                       │
│       │                                                     │
│       ├── /register  ──► authRoutes.js  ──► User.create()  │
│       ├── /login     ──► authRoutes.js  ──► JWT sign()     │
│       │                                                     │
│       ├── /expense   ──► authMiddleware ──► expenseRoutes  │
│       └── /expenses  ──► (JWT verify)   ──► Expense.find() │
└────────────────────────┬────────────────────────────────────┘
                         │  Mongoose ODM
┌────────────────────────┴────────────────────────────────────┐
│                   DATABASE (MongoDB Atlas)                   │
│                                                             │
│    ┌──────────────┐         ┌──────────────────┐           │
│    │  users       │         │  expenses        │           │
│    │──────────────│         │──────────────────│           │
│    │ name         │    ┌───>│ userId (ref)     │           │
│    │ email (uniq) │────┘    │ title            │           │
│    │ password     │         │ amount           │           │
│    │ (bcrypt)     │         │ category         │           │
│    │ timestamps   │         │ date             │           │
│    └──────────────┘         │ notes            │           │
│                             │ timestamps       │           │
│                             └──────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔹 Part A: Backend Development (6 Marks)

### A1. MongoDB Schema — User (`backend/models/User.js`)

```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,           // Ensures no duplicate emails
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,          // Never returned in queries by default
  },
}, { timestamps: true });
```

**Password Hashing (bcrypt):**
```javascript
// Pre-save hook — automatically hashes password before storing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);          // 12 salt rounds
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare passwords during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

### A2. MongoDB Schema — Expense (`backend/models/Expense.js`)

```javascript
const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',                               // References the User model
    required: [true, 'User ID is required'],
  },
  title:    { type: String, required: true, trim: true, maxlength: 100 },
  amount:   { type: Number, required: true, min: [0.01, 'Must be > 0'] },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Travel', 'Bills', 'Shopping', 'Healthcare',
           'Entertainment', 'Education', 'Other'],
  },
  date:  { type: Date, required: true, default: Date.now },
  notes: { type: String, trim: true, maxlength: 250 },
}, { timestamps: true });

// Index for faster queries by user
expenseSchema.index({ userId: 1, date: -1 });
```

### A3. REST APIs (`backend/routes/`)

#### POST /register (`authRoutes.js`)
```javascript
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  // 1. Validate all fields are present
  // 2. Check if email already exists in DB
  // 3. Create user (password auto-hashed by pre-save hook)
  // 4. Generate JWT token
  // 5. Return { success, token, user }
});
```

#### POST /login (`authRoutes.js`)
```javascript
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // 1. Find user by email (with +password to include hashed password)
  // 2. Compare password using bcrypt
  // 3. Generate JWT token
  // 4. Return { success, token, user }
});
```

#### POST /expense (Protected) (`expenseRoutes.js`)
```javascript
router.post('/', async (req, res) => {
  // req.user is set by authMiddleware
  const expense = await Expense.create({
    userId: req.user._id,    // From JWT-verified user
    title, amount, category, date, notes
  });
  // Returns { success, expense }
});
```

#### GET /expenses (Protected) (`expenseRoutes.js`)
```javascript
router.get('/', async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.category && req.query.category !== 'All') {
    filter.category = req.query.category;   // Category filter (bonus)
  }
  const expenses = await Expense.find(filter).sort({ date: -1 });
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  // Returns { success, count, total, expenses }
});
```

---

## 🔹 Part B: Authentication & Middleware (3 Marks)

### B1. JWT Token Generation (`authRoutes.js`)

```javascript
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },              // Payload — stores user ID
    process.env.JWT_SECRET,      // Secret key from .env
    { expiresIn: '7d' }         // Token expires in 7 days
  );
};
```

**Flow:**
1. User sends email + password to `/login`
2. Server verifies credentials against MongoDB
3. Server generates a JWT containing the user's ID
4. Token is returned to the frontend
5. Frontend stores token in `localStorage`
6. All subsequent requests include the token in the `Authorization` header

### B2. Auth Middleware (`backend/middleware/authMiddleware.js`)

```javascript
const protect = async (req, res, next) => {
  // 1. Extract token from "Authorization: Bearer <token>" header
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Reject if no token
  if (!token) return res.status(401).json({ message: 'No token provided' });

  // 3. Verify token signature
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 4. Attach user info to request object
  req.user = await User.findById(decoded.id).select('-password');

  // 5. Proceed to the route handler
  next();
};
```

**Protected routes use it like this:**
```javascript
router.use(protect);  // All routes in this file are now protected
```

---

## 🔹 Part C: Frontend Development (4 Marks)

### C1. Pages/Components

| Component | File | Purpose |
|-----------|------|---------|
| **Register** | `pages/Register.js` | Registration form (name, email, password) |
| **Login** | `pages/Login.js` | Login form (email, password) |
| **Dashboard** | `pages/Dashboard.js` | Stats cards, add expense form, expense list, filters |
| **App** | `App.js` | Root component — manages auth state & page routing |

### C2. Form Handling (Register Example)

```javascript
const [form, setForm] = useState({ name: '', email: '', password: '' });

const handleChange = (e) =>
  setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

const handleSubmit = async (e) => {
  e.preventDefault();
  const data = await registerUser(form.name, form.email, form.password);
  if (data.success) {
    localStorage.setItem('token', data.token);       // Store JWT
    localStorage.setItem('user', JSON.stringify(data.user));
    onLogin(data.user);                               // Navigate to Dashboard
  }
};
```

### C3. JWT Token Storage

```javascript
// On login/register success:
localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));

// On logout:
localStorage.removeItem('token');
localStorage.removeItem('user');

// On API calls (api.js):
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});
```

### C4. API Layer (`frontend/src/api.js`)

```javascript
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const registerUser = async (name, email, password) => { /* POST /register */ };
export const loginUser    = async (email, password)        => { /* POST /login    */ };
export const addExpense   = async (expenseData)            => { /* POST /expense  */ };
export const getExpenses  = async (category = 'All')       => { /* GET /expenses  */ };
export const deleteExpense = async (id)                    => { /* DELETE /expense/:id */ };
```

---

## 🔹 Part D: Functionality & Features (2 Marks)

### D1. Core Features
- ✅ **Add new expenses** — Title, Amount, Category, Date, Notes
- ✅ **View all expenses** — Sorted by date (newest first)
- ✅ **Delete expenses** — With confirmation dialog

### D2. Bonus Features
- ✅ **Filter by category** — Filter chips: All, Food, Travel, Bills, Shopping, Healthcare, Entertainment, Education, Other
- ✅ **Total expense amount** — Displayed in stats cards
- ✅ **Monthly total** — Current month expenses
- ✅ **Average per entry** — Total ÷ number of transactions
- ✅ **Transaction count** — Number of expense entries

---

## 🔐 Security Implementation

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcrypt with 12 salt rounds |
| Token auth | JWT with 7-day expiry |
| Password hidden | `select: false` on schema — never returned in API responses |
| Protected routes | `authMiddleware.js` verifies token on every expense API call |
| CORS | Only allows requests from configured frontend origin |
| Input validation | Mongoose schema validators + route-level checks |

---

## 🛠️ Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React.js | 18.x |
| Styling | Vanilla CSS (custom design system) | — |
| Backend | Node.js + Express.js | Express 4.18 |
| Database | MongoDB (Mongoose ODM) | Mongoose 8.2 |
| Auth | JWT (jsonwebtoken) + bcryptjs | JWT 9.0 |
| Deployment | Vercel (frontend) + Render (backend) | — |

### Dependencies

**Backend (`backend/package.json`):**
```json
{
  "bcryptjs": "^2.4.3",       // Password hashing
  "cors": "^2.8.5",           // Cross-Origin Resource Sharing
  "dotenv": "^16.4.5",        // Environment variables from .env
  "express": "^4.18.2",       // Web framework
  "jsonwebtoken": "^9.0.2",   // JWT token generation & verification
  "mongoose": "^8.2.0"        // MongoDB ODM
}
```

**Frontend:** React 18, React DOM, React Scripts (Create React App)

---

## 💻 Commands Used

### Initial Setup
```bash
# Create backend
mkdir backend && cd backend
npm init -y
npm install express mongoose bcryptjs jsonwebtoken cors dotenv
npm install --save-dev nodemon

# Create frontend
npx create-react-app frontend
```

### Running Locally
```bash
# Terminal 1 — Backend
cd backend
npm run dev          # Uses nodemon for hot-reload (port 5000)

# Terminal 2 — Frontend
cd frontend
npm start            # React dev server (port 3000)
```

### Git & Deployment
```bash
# Initialize repo and push
git init
git add .
git commit -m "Initial commit: Personal Expense Management System (MERN Stack)"
git remote add origin https://github.com/JahnaviSingh2005/AI-FSD-MSE2.git
git branch -M main
git push -u origin main

# After making changes
git add .
git commit -m "your message"
git push origin main
# Both Render and Vercel auto-redeploy on push
```

---

## 🌐 Environment Variables

### Backend (`.env` — local / Render dashboard)
```
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/expense_manager
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=https://ai-fsd-mse-2.vercel.app
```

### Frontend (Vercel dashboard)
```
REACT_APP_API_URL=https://ai-fsd-mse2.onrender.com
```

---

## 🚀 Deployment Summary

| Service | Platform | Root Directory | Build Command | Start Command |
|---------|----------|---------------|---------------|---------------|
| Backend | Render | `backend` | `npm install` | `node server.js` |
| Frontend | Vercel | `frontend` | `npm run build` | — (static) |
| Database | MongoDB Atlas | — | — | — |

---

## 📊 API Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `POST` | `/register` | ❌ | Register new user |
| `POST` | `/login` | ❌ | Login & get JWT token |
| `POST` | `/expense` | ✅ | Add a new expense |
| `GET` | `/expenses` | ✅ | Get all user expenses |
| `GET` | `/expenses?category=Food` | ✅ | Filter expenses by category |
| `DELETE` | `/expense/:id` | ✅ | Delete an expense |

### Sample API Requests & Responses

**Register:**
```
POST /register
Body: { "name": "Jahnavi", "email": "j@test.com", "password": "123456" }
Response: { "success": true, "token": "eyJhbG...", "user": { "id": "...", "name": "Jahnavi", "email": "j@test.com" } }
```

**Login:**
```
POST /login
Body: { "email": "j@test.com", "password": "123456" }
Response: { "success": true, "token": "eyJhbG...", "user": {...} }
```

**Add Expense:**
```
POST /expense
Headers: Authorization: Bearer eyJhbG...
Body: { "title": "Lunch", "amount": 250, "category": "Food", "date": "2026-04-22" }
Response: { "success": true, "expense": {...} }
```

**Get Expenses:**
```
GET /expenses
Headers: Authorization: Bearer eyJhbG...
Response: { "success": true, "count": 5, "total": 1250.00, "expenses": [...] }
```

---

## 🎨 UI/UX Design

- **Theme:** Dark mode with purple accent (`#7c3aed`)
- **Font:** Inter (Google Fonts)
- **Design Patterns:** Glassmorphism, gradient buttons, subtle animations
- **Responsive:** Mobile-friendly layout with CSS Grid and media queries
- **Animations:** `fadeSlideUp` for cards, `fadeIn` for alerts, `spin` for loader
- **Category Colors:** Each expense category has a unique color badge

---

## 📝 Question-to-Code Mapping

| Question Part | Marks | Files Involved | Status |
|--------------|:-----:|----------------|:------:|
| A1 — User Schema | 2 | `backend/models/User.js` | ✅ |
| A2 — Expense Schema | 2 | `backend/models/Expense.js` | ✅ |
| A3 — REST APIs | 2 | `backend/routes/authRoutes.js`, `expenseRoutes.js`, `server.js` | ✅ |
| B1 — JWT Auth | 1.5 | `backend/routes/authRoutes.js` (generateToken) | ✅ |
| B2 — Auth Middleware | 1.5 | `backend/middleware/authMiddleware.js` | ✅ |
| C1 — React Pages | 2 | `frontend/src/pages/Register.js`, `Login.js`, `Dashboard.js` | ✅ |
| C2 — Form + JWT Storage | 2 | `frontend/src/pages/*.js`, `api.js`, `App.js` | ✅ |
| D1 — Add & View Expenses | 1 | `Dashboard.js`, `expenseRoutes.js` | ✅ |
| D2 — Filter + Total (Bonus) | 1 | `Dashboard.js`, `expenseRoutes.js` | ✅ |
| **Total** | **15** | | ✅ |
