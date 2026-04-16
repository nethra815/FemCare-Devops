# FemCare - Women's Healthcare Management Platform

A comprehensive MERN stack application for women's healthcare management, featuring menstrual cycle tracking, fertility predictions, doctor appointments, and health records management.

## 🌟 Features

### For Patients
- **Cycle Tracking** - Log menstrual cycles with symptoms, flow levels, and notes
- **Fertility Predictions** - Fertility window predictions based on cycle history
- **Doctor Appointments** - Browse and book appointments with verified healthcare providers
- **Health Records** - Secure storage and management of medical records

### For Doctors
- **Patient Management** - View and manage patient appointments
- **Medical Records** - Access patient health history and cycle data
- **Appointment Tracking** - Track completed, upcoming, and cancelled appointments

### For Admins
- **User Management** - Approve doctors

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone git@github.com:nethra815/FemCare.git
cd healthcare-mern
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

```
### 3. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

```

## 📁 Project Structure

```
healthcare-mern/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Express backend
│   ├── src/
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Custom middleware
│   │   ├── scripts/      # Database scripts
│   │   ├── tests/        # Unit tests
│   │   └── server.js     # Entry point
│   ├── .env              # Environment variables
│   └── package.json
│
├── components/           # Shared UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── styles/              # Global styles
├── docs/                # Documentation
└── package.json         # Root package.json
```

## 📊 Database Schema

### User Model
- Authentication and profile data
- Role-based permissions
- Linked to Patient/Doctor profiles

### Patient Model
- Personal health information
- Cycle history
- Appointment records

### Doctor Model
- Professional credentials
- Specializations
- Availability schedule

### Cycle Model
- Menstrual cycle data
- Symptoms and flow tracking
- Fertility predictions

### Appointment Model
- Booking information
- Status tracking
- Doctor-patient linkage

### Technology Stack
```
Frontend:  React 18 + Vite + Tailwind CSS
Backend:   Node.js + Express + MongoDB
Testing:   Node.js built-in test runner
Database:  MongoDB with Mongoose ODM
```
**Built with ❤️ for women's healthcare**
