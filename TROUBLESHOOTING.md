# Troubleshooting Guide

## Common Errors and Solutions

### 1. "next is not a function" Error

**Cause:** Middleware error handling issue

**Solution:** ✅ Fixed in latest update
- Middleware now properly handles errors
- Added proper error checking for `req.user`

### 2. 400 Bad Request on Vendor Login

**Cause:** No vendor account exists in database

**Solution:** Create a vendor account:
```bash
cd server
npm run create-vendor
```

This creates:
- Email: `vendor@printflow.com`
- Password: `vendor123`

Or manually create via API:
```bash
POST http://localhost:5000/api/auth/vendor/register
{
  "name": "Vendor Name",
  "email": "vendor@test.com",
  "password": "password123",
  "role": "VENDOR"
}
```

**Note:** You may need to add a vendor register endpoint if it doesn't exist.

### 3. 500 Internal Server Error on Upload

**Possible Causes:**
1. MongoDB not connected
2. Missing JWT_SECRET
3. File upload directory permissions
4. PrintJob model token generation issue

**Solutions:**

**Check MongoDB connection:**
- Ensure `.env` has correct `MONGO_URI`
- Check if MongoDB is running
- Test connection: `mongosh "your_connection_string"`

**Check JWT_SECRET:**
- Add to `.env`: `JWT_SECRET=your-secret-key-min-32-chars`

**Check uploads directory:**
- Directory is auto-created at `server/uploads/`
- Ensure write permissions

**Check server logs:**
- Look for specific error messages in console
- Check if PrintJob model is loading correctly

### 4. Socket.IO Connection Issues

**Symptoms:**
- "WebSocket connection failed"
- Socket not receiving updates

**Solutions:**
- Ensure backend is running before frontend
- Check CORS settings in `server.js`
- Verify `CLIENT_URL` in `.env` matches frontend URL
- Check browser console for specific errors

### 5. Authentication Errors

**401 Unauthorized:**
- Token missing or invalid
- JWT_SECRET mismatch
- User not found in database

**403 Forbidden:**
- Wrong role (student trying vendor route, etc.)
- User role doesn't match required role

**Solutions:**
- Check token in localStorage
- Verify JWT_SECRET is set
- Ensure user exists in database
- Check user role matches route requirements

## Quick Fixes

### Reset Everything:
1. Stop both servers
2. Clear browser localStorage
3. Restart backend: `cd server && npm run dev`
4. Restart frontend: `cd client && npm run dev`

### Create Test Accounts:

**Student:**
```bash
POST http://localhost:5000/api/auth/student/register
{
  "name": "Test Student",
  "email": "student@test.com",
  "password": "password123",
  "studentId": "STU001"
}
```

**Vendor:**
```bash
cd server
npm run create-vendor
```

## Debugging Steps

1. **Check Backend Logs:**
   - Look for error messages in terminal
   - Check for database connection errors
   - Verify routes are being hit

2. **Check Frontend Console:**
   - Open browser DevTools
   - Check Network tab for failed requests
   - Look for error messages in Console

3. **Verify Environment Variables:**
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key_here
   CLIENT_URL=http://localhost:5173
   ```

4. **Test API Endpoints:**
   ```bash
   # Health check
   curl http://localhost:5000/health
   
   # Should return: {"status":"PrintFlow backend running 🚀"}
   ```

## Still Having Issues?

1. Check server terminal for detailed error messages
2. Verify all dependencies are installed: `npm install`
3. Ensure MongoDB is accessible
4. Check file permissions for uploads directory
5. Verify all environment variables are set
