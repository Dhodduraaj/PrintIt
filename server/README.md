# PrintFlow Backend Server

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the `server` directory with:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
```

### 3. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### 4. Create Initial Vendor Account

You can create a vendor account using MongoDB directly or create a script. For testing, you can use the register endpoint with role "VENDOR".

## API Endpoints

### Authentication
- `POST /api/auth/student/register` - Student registration
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/vendor/login` - Vendor login

### Student Routes (Protected)
- `POST /api/student/upload` - Upload document
- `GET /api/student/job/:jobId` - Get job status
- `GET /api/student/latest-job` - Get latest job
- `POST /api/student/payment/:jobId` - Submit payment

### Vendor Routes (Protected)
- `GET /api/vendor/jobs` - Get all jobs
- `POST /api/vendor/jobs/:jobId/approve` - Approve and start printing
- `POST /api/vendor/jobs/:jobId/verify-payment` - Verify payment
- `POST /api/vendor/jobs/:jobId/complete` - Mark job as done
- `GET /api/vendor/jobs/:jobId/download` - Download file

### Admin Routes (Protected)
- `GET /api/admin/analytics` - Get system analytics

## Socket.IO Events

### Server Emits:
- `newJob` - New job created
- `jobUpdated` - Job status updated
- `jobStatusUpdate` - Job status changed
- `queueUpdate` - Queue position updated

### Client Can Listen:
- `queueUpdate` - Receive queue updates
- `jobStatusUpdate` - Receive job status changes

## File Uploads

Uploaded files are stored in `server/uploads/` directory. Make sure this directory exists or it will be created automatically.
