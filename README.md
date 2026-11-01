# 🎓 Student Management System API

A RESTful Student Management System built using **Node.js, Express.js, MongoDB, and Mongoose**, following the MVC architecture.

This backend application allows administrators to manage students, courses, multiple course enrollments, and attendance records securely using JWT authentication.

## 🚀 Features

### 🔐 Admin Authentication
- Secure admin login with JWT
- Password hashing using bcryptjs
- Protected API endpoints
- Admin profile management
- Token-based authentication

### 👨‍🎓 Student Management
- Create students
- Get all students
- Get student by ID
- Update student details
- Delete students
- Search students by name
- Filter students by course and age
- Sorting and pagination

### 📚 Course Management
- Create courses
- View all courses
- Course duration and pricing
- Course status management at the model level

### 🎯 Multiple Course Enrollment
- Enroll students in multiple courses
- Prevent duplicate enrollments
- View enrollments by student
- View enrollments by course
- Update enrollment status
- Track active, completed, and cancelled enrollments

### 📅 Attendance Management
- Mark students as present or absent
- Track attendance by course enrollment
- Prevent duplicate attendance records for the same date
- Update attendance records
- Generate attendance summaries
- Calculate attendance percentages

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript Runtime |
| Express.js | Backend Framework |
| MongoDB | NoSQL Database |
| Mongoose | Object Data Modeling |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| dotenv | Environment Configuration |
| CORS | Cross-Origin Resource Sharing |
| Nodemon | Development Server |

## 📁 Project Structure

```text
student-management/
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── models/
│   │   ├── admin.model.js
│   │   ├── student.model.js
│   │   ├── course.model.js
│   │   ├── enrollment.model.js
│   │   └── attendance.model.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── student.controller.js
│   │   ├── course.controller.js
│   │   ├── enrollment.controller.js
│   │   └── attendance.controller.js
│   │
│   ├── middleware/
│   │   └── auth.middleware.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── student.routes.js
│   │   ├── course.routes.js
│   │   ├── enrollment.routes.js
│   │   └── attendance.routes.js
│   │
│   ├── scripts/
│   │   ├── createAdmin.js
│   │   ├── initEnrollmentIndexes.js
│   │   └── initAttendanceIndexes.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/student-management.git
cd student-management
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_jwt_secret
JWT_EXPIRES_IN=1h
```

Generate a secure JWT secret:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Never commit your `.env` file or real credentials.

### 4. Create an Admin Account

The project includes an admin creation script.

```bash
node src/scripts/createAdmin.js "System Admin" "admin@example.com" "YOUR_STRONG_PASSWORD"
```

Use a unique password containing 12–72 characters.

For production, use a secure password input method instead of passing passwords through command-line arguments.

### 5. Initialize Database Indexes

```bash
node src/scripts/initEnrollmentIndexes.js
node src/scripts/initAttendanceIndexes.js
```

### 6. Start the Development Server

```bash
npm run dev
```

Expected output:

```text
MongoDB Connected: ...
Server running on port 5000
```

API Base URL:

```text
http://localhost:5000
```

## 🔗 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Admin Login |
| GET | `/api/auth/me` | Get Admin Profile |

### Student Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/students` | Create Student |
| GET | `/api/students` | Get All Students |
| GET | `/api/students/:id` | Get Student by ID |
| PUT | `/api/students/:id` | Update Student |
| DELETE | `/api/students/:id` | Delete Student |

#### Search, Filter and Pagination

```http
GET /api/students?search=kamal
GET /api/students?course=DevOps
GET /api/students?minAge=18&maxAge=25
GET /api/students?page=1&limit=10
GET /api/students?sort=newest
```

### Course Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/courses` | Create Course |
| GET | `/api/courses` | Get All Courses |

### Enrollment Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/enrollments` | Enroll Student |
| GET | `/api/enrollments` | Get All Enrollments |
| GET | `/api/enrollments/student/:studentId` | Get Student Enrollments |
| GET | `/api/enrollments/course/:courseId` | Get Course Enrollments |
| PATCH | `/api/enrollments/:id/status` | Update Enrollment Status |

### Attendance Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/attendance` | Mark Attendance |
| GET | `/api/attendance` | Get All Attendance Records |
| GET | `/api/attendance/enrollment/:id` | Get Attendance Report |
| PATCH | `/api/attendance/:id` | Update Attendance |

## 🔐 Authentication

All student, course, enrollment, and attendance APIs require an admin JWT token.

### Admin Login

**POST** `/api/auth/login`

Request:

```json
{
  "email": "admin@example.com",
  "password": "YOUR_ADMIN_PASSWORD"
}
```

Successful login returns a JWT token.

Include that token in protected API requests:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📌 Example API Requests

### Create Student

**POST** `/api/students`

```json
{
  "name": "Kamal Perera",
  "email": "kamal@example.com",
  "age": 22,
  "phone": "0771234567",
  "course": "MERN Stack"
}
```

### Create Course

**POST** `/api/courses`

```json
{
  "title": "MERN Stack Premium Program",
  "description": "Full Stack Development Program",
  "duration": 6,
  "price": 15000,
  "status": "active"
}
```

### Enroll Student

**POST** `/api/enrollments`

```json
{
  "studentId": "YOUR_STUDENT_ID",
  "courseId": "YOUR_COURSE_ID"
}
```

### Update Enrollment Status

**PATCH** `/api/enrollments/YOUR_ENROLLMENT_ID/status`

```json
{
  "status": "completed"
}
```

### Mark Attendance

**POST** `/api/attendance`

```json
{
  "enrollmentId": "YOUR_ENROLLMENT_ID",
  "date": "2026-11-01",
  "status": "present",
  "notes": "Attended live class"
}
```

### Update Attendance

**PATCH** `/api/attendance/YOUR_ATTENDANCE_ID`

```json
{
  "status": "absent",
  "notes": "Attendance corrected"
}
```

## 📊 Attendance Calculation

Attendance percentage is calculated using:

```text
Attendance Percentage = (Present Classes / Total Recorded Classes) × 100
```

Example:

```text
Total Recorded Classes: 20
Present Classes: 17
Absent Classes: 3

Attendance Percentage: 85%
```

The percentage is based on recorded attendance dates, not the complete scheduled course timetable.

## 🏗️ Architecture

The project follows MVC principles:

```text
Client / Postman
       |
       v
Express Application
       |
       v
Routes
       |
       v
JWT Authentication Middleware
       |
       v
Controllers
       |
       v
Mongoose Models
       |
       v
MongoDB Database
```

## 🔒 Security Features

- JWT authentication for protected endpoints
- bcrypt password hashing
- Environment-based secrets
- Admin-only API access
- Mongoose schema validation
- MongoDB unique indexes
- Duplicate enrollment prevention
- Duplicate attendance prevention
- ObjectId validation
- Centralized Express error handling

**Production note:** This is an educational backend project. Before public deployment, implement additional security controls such as login rate limiting, secure CORS configuration, HTTPS, token revocation, monitoring, and automated testing.

## 🚧 Future Improvements

- Student login and role-based permissions
- Class session scheduling
- Bulk attendance marking
- Course re-enrollment
- Attendance reports and analytics
- Student payment management
- Certificate management
- Email notifications
- Admin dashboard using React
- Automated testing with Vitest
- Docker deployment and CI/CD

## 📄 License

No license has been specified yet. Add a `LICENSE` file if you want to define permissions for reuse and distribution.
