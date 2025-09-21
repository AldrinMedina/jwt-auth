# 🔐 JWT Authentication (Node.js Backend)

This project demonstrates how to implement **JWT-based authentication** in a Node.js backend using **Express.js**.
It supports **user registration, login, and protected routes** with role-based access.

---

## 🚀 Features

* User registration with hashed passwords (bcrypt)
* User login with JWT issuance
* Protected routes with JWT verification
* Role-based authorization (`admin`, `staff`, etc.)
* Token expiration handling

---

## 📦 Tech Stack

* [Node.js](https://nodejs.org/)
* [Express.js](https://expressjs.com/)
* [bcryptjs](https://www.npmjs.com/package/bcryptjs) (password hashing)
* [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) (JWT handling)
* [dotenv](https://www.npmjs.com/package/dotenv) (environment variables)

---

## ⚙️ Installation

Clone the repo and install dependencies:

```bash
git clone https://github.com/your-username/jwt-auth-backend.git
cd jwt-auth-backend
npm install
```

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Database Configuration
DB_HOST=db.[your-project-ref].supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=[your-supabase-database-password]

# Alternative: You can also use the full connection string
# DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[your-project-ref].supabase.co:5432/postgres

# JWT Configuration
JWT_SECRET=[your-generated-jwt-secret-key]
JWT_EXPIRES_IN=7d

# Optional: Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

```

---

## ▶️ Running the Server

```bash
npm run dev
```

Server will start at:
👉 `http://localhost:3000`

---

## 📌 API Endpoints

### 1. Register User

**POST** `/api/auth/register`

Request body:

```json
{
  "username": "staff2",
  "email": "staff2@example.com",
  "password": "password123",
  "role": "staff"
}
```

Response:

```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": "64d594df-34e6-4d93-85c3-d7f091d92f20",
            "username": "staff2",
            "email": "staff2@example.com",
            "role": "staff",
            "updatedAt": "2025-09-21T03:36:06.690Z",
            "createdAt": "2025-09-21T03:36:06.690Z"
        },
        "token": "jwt_token_here"
    }
}

```

---

### 2. Login User

**POST** `/api/auth/login`

Request body:

```json
{
  "email": "staff2@example.com",
  "password": "password123"
}
```

Response:

```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": "0f4293b4-828f-4fe9-83a0-dde4e4ebd643",
            "username": "staff",
            "email": "staff@example.com",
            "role": "staff",
            "createdAt": "2025-09-19T16:45:39.402Z",
            "updatedAt": "2025-09-19T16:45:39.402Z"
        },
        "token": "jwt_token_here"
    }
}

```

---


---

### 4. Role-Based Access (Optional)

If your app uses roles:

* Admin-only routes check `req.user.role === "admin"`

Example middleware:

```js
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
```

---

## 🧪 Testing

Use **Postman** or **cURL** to test the API.
Example cURL for login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff2@example.com","password":"password123"}'
```

---

## 📖 Notes

* Always keep your `JWT_SECRET` safe and never push it to GitHub.
* Use HTTPS in production.
* Refresh tokens can be added for better security.

---

## 📝 License

This project is for **educational purposes** only.

