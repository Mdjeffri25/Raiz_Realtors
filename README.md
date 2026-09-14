# RAIZ REALTORS

A full-stack Real Estate CRM designed to manage leads, property inventory, bookings, sales follow-ups, and operational activities in one place.

## Live Application

- Frontend: https://raiz-realtors.vercel.app
- Backend API: https://raiz-realtors.onrender.com
- Health Check: https://raiz-realtors.onrender.com/api/health

> Note: The backend is deployed on Render and the database is hosted on a managed MySQL service. Free-tier infrastructure may require a short startup time after inactivity.

---

## Features

### Lead Management
- Create and manage leads
- Search and view lead information
- Track lead stages:
  - New
  - Contacted
  - Site Visit
  - Interested
  - Negotiation
  - Booked
  - Lost
- Assign leads to sales employees
- Track follow-up dates and notes

### Property Management
- Manage projects
- Manage buildings under projects
- Manage individual units
- Track:
  - Unit number
  - Unit type
  - Price
  - Availability status
  - Building
- View available inventory

### Booking Management
- Book an available property unit for a lead
- Automatically update the unit status to BOOKED
- Automatically move the lead to BOOKED stage
- Prevent double booking of the same unit

### Dashboard
- Total leads
- Qualified leads
- Booked leads
- Total bookings
- Available units
- Sales pipeline
- Today's follow-ups
- Recent bookings
- Recent activity
- Project-wise unit availability

### Authentication & Authorization
- JWT-based authentication
- BCrypt password hashing
- Role-based access control
- Supported roles:
  - ADMIN
  - SALES
  - BACK_OFFICE
  - AUDITOR

### Audit Logs
Important business actions are recorded with:
- User
- Action
- Entity
- Entity ID
- Details
- Timestamp

---

## Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Axios

### Backend
- Java
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA / Hibernate
- Bean Validation
- Maven

### Database
- MySQL

### Deployment
- Vercel - Frontend
- Render - Backend
- Managed MySQL - Database

---

## Project Structure

```text
Raiz_Realtors/
│
├── Real-Estate-BackEnd/
│   └── RaizRealtors/
│       ├── src/
│       │   └── main/
│       │       ├── java/
│       │       │   └── org/example/raizrealtors/
│       │       │       ├── auth/
│       │       │       ├── security/
│       │       │       ├── user/
│       │       │       ├── lead/
│       │       │       ├── property/
│       │       │       ├── booking/
│       │       │       ├── dashboard/
│       │       │       ├── audit/
│       │       │       └── config/
│       │       └── resources/
│       │
│       └── pom.xml
│
├── Real-Estate-FrontEnd/
│   └── project/
│       ├── src/
│       │   ├── api/
│       │   ├── components/
│       │   ├── context/
│       │   ├── pages/
│       │   └── ...
│       ├── package.json
│       └── vite.config.js
│
└── .gitignore
