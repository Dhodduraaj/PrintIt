# PrintFlow - Complete Setup Guide

## ✅ Backend Setup Complete!

The backend server has been fully configured with:
- ✅ Socket.IO integration for real-time updates
- ✅ All API routes (Student, Vendor, Admin)
- ✅ File upload handling with Multer
- ✅ Authentication middleware
- ✅ PrintJob model and database structure
- ✅ Payment verification system
- ✅ Queue management system

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd server
```

**Create `.env` file:**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_min_32_chars
CLIENT_URL=http://localhost:5173
```

**Start the server:**
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📋 What Was Fixed

### Backend Issues Resolved:
1. **Socket.IO Setup** - Added Socket.IO server initialization
2. **Middleware Order** - Fixed CORS and JSON middleware placement
3. **File Upload** - Added Multer for handling document uploads
4. **Routes** - Created all required routes:
   - Student routes (upload, queue, payment)
   - Vendor routes (jobs, approve, verify, complete)
   - Admin routes (analytics)
5. **Models** - Created PrintJob model with token generation
6. **Controllers** - Implemented all business logic
7. **Real-time Updates** - Socket.IO events for queue updates

### Frontend Updates:
1. **Socket Context** - Improved error handling and reconnection
2. **API Configuration** - Centralized API base URL

## 🔧 Testing the Connection

1. Start the backend server first
2. Check backend health: `http://localhost:5000/health`
3. Start the frontend
4. Socket.IO should connect automatically (check browser console)

## 📝 Create Test Accounts

### Student Account:
```bash
POST http://localhost:5000/api/auth/student/register
{
  "name": "Test Student",
  "email": "student@test.com",
  "password": "password123",
  "studentId": "STU001"
}
```

### Vendor Account:
You'll need to create this directly in MongoDB or modify the register endpoint to allow vendor registration.

## 🐛 Troubleshooting

### Connection Refused Errors:
- Make sure backend is running on port 5000
- Check `.env` file exists and has correct values
- Verify MongoDB connection string is correct

### Socket.IO Connection Failed:
- Backend must be running before frontend
- Check CORS settings in `server.js`
- Verify `CLIENT_URL` matches your frontend URL

### File Upload Issues:
- Ensure `server/uploads/` directory exists (created automatically)
- Check file size limits (10MB max)
- Verify file types (PDF, DOC, DOCX only)

## 📁 Project Structure

```
server/
├── src/
│   ├── config/        # Database configuration
│   ├── controllers/   # Business logic
│   ├── middleware/     # Auth & upload middleware
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── app.js          # Express app setup
│   └── server.js       # Server with Socket.IO
└── uploads/            # Uploaded files (auto-created)

client/
├── src/
│   ├── components/     # Reusable components
│   ├── contexts/       # Auth & Socket contexts
│   ├── pages/          # All page components
│   ├── utils/          # Utilities
│   └── App.jsx         # Main app with routing
```

## 🎯 Next Steps

1. Set up MongoDB (local or Atlas)
2. Create `.env` file with your credentials
3. Start backend server
4. Start frontend server
5. Test the application!

The backend is now fully functional and ready to handle all frontend requests! 🚀
