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
PORT=3000
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1h
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
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "staff2",
    "email": "staff2@example.com",
    "role": "staff"
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
  "message": "Login successful",
  "token": "jwt_token_here"
}
```

---

### 3. Protected Route

**GET** `/api/protected`

Headers:

```
Authorization: Bearer <your_jwt_token>
```

Response:

```json
{
  "message": "Welcome to the protected route!",
  "user": {
    "id": 1,
    "username": "staff2",
    "role": "staff"
  }
}
```

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

