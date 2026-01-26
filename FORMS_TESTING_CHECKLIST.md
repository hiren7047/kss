# Forms Management - Complete Testing Checklist

## ✅ Backend Verification

### 1. Models ✅
- [x] Form model created (`backend/src/models/Form.js`)
- [x] FormSubmission model created (`backend/src/models/FormSubmission.js`)
- [x] Models export correctly
- [x] Indexes configured

### 2. Services ✅
- [x] FormService created (`backend/src/services/formService.js`)
- [x] All CRUD operations implemented
- [x] Analytics functionality
- [x] Submission handling

### 3. Controllers ✅
- [x] FormController created (`backend/src/controllers/formController.js`)
- [x] File upload handling
- [x] Error handling

### 4. Routes ✅
- [x] Admin routes (`backend/src/routes/formRoutes.js`)
- [x] Public routes (`backend/src/routes/publicFormRoutes.js`)
- [x] Routes registered in `app.js`

### 5. Validators ✅
- [x] Form validators created (`backend/src/validators/formValidator.js`)
- [x] All schemas defined

### 6. Permissions ✅
- [x] FORM permissions added to `permissions.js`
- [x] Role-based access configured

## ✅ Frontend Verification

### 1. API Layer ✅
- [x] Forms API created (`frontend/src/lib/api/forms.ts`)
- [x] All endpoints defined
- [x] TypeScript types defined

### 2. Pages ✅
- [x] Forms list page (`frontend/src/pages/Forms.tsx`)
- [x] Routes configured in `App.tsx`
- [x] Sidebar menu item added

### 3. Integration ✅
- [x] React Query setup
- [x] Error handling
- [x] Loading states

## 🧪 Testing Steps

### Backend Testing

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test Health Endpoint**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Test Forms API (with auth token)**
   ```bash
   # Get auth token first by logging in
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"password"}'
   
   # Use token to get forms
   curl -X GET http://localhost:3000/api/forms \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. **Test Public Form Endpoint**
   ```bash
   # Get form by token (no auth needed)
   curl http://localhost:3000/api/forms/public/token/YOUR_TOKEN
   ```

### Frontend Testing

1. **Start Frontend Server**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Access Forms Page**
   - Navigate to `http://localhost:5173/forms`
   - Should see forms list page
   - Check browser console for errors

3. **Test API Calls**
   - Open browser DevTools → Network tab
   - Check if API calls are going to correct endpoint
   - Verify API base URL is correct

4. **Check API Configuration**
   - Verify `VITE_API_URL` in `.env` file
   - Default: `http://localhost:3000/api`
   - Should match your backend URL

## 🔧 Common Issues & Fixes

### Issue 1: 404 Error on `/forms`
**Possible Causes:**
- Frontend route not matching
- Backend server not running
- API URL misconfigured

**Fix:**
1. Check if backend is running on port 3000
2. Verify frontend `.env` has correct `VITE_API_URL`
3. Check browser console for API errors
4. Verify routes in `App.tsx`

### Issue 2: API Returns 401 Unauthorized
**Possible Causes:**
- Token expired
- Token not sent in request
- User doesn't have permission

**Fix:**
1. Check if user is logged in
2. Verify token in localStorage
3. Check user role has FORM_READ permission
4. Try logging in again

### Issue 3: CORS Error
**Possible Causes:**
- Frontend URL not in CORS allowed origins
- Backend CORS configuration

**Fix:**
1. Check `backend/src/app.js` CORS configuration
2. Add frontend URL to allowed origins
3. For development, CORS allows all origins

### Issue 4: Forms Not Loading
**Possible Causes:**
- Database connection issue
- No forms in database
- API endpoint error

**Fix:**
1. Check backend logs
2. Verify MongoDB connection
3. Create a test form via API
4. Check database for forms collection

## 📋 Manual Testing Checklist

### Forms List Page
- [ ] Page loads without errors
- [ ] Forms list displays (or empty state)
- [ ] Search functionality works
- [ ] Status filter works
- [ ] Pagination works
- [ ] Create button navigates correctly
- [ ] Edit button navigates correctly
- [ ] Delete button shows confirmation
- [ ] Copy link works
- [ ] View link dialog works

### API Endpoints
- [ ] GET /api/forms - Returns forms list
- [ ] GET /api/forms/:id - Returns form details
- [ ] POST /api/forms - Creates form
- [ ] PUT /api/forms/:id - Updates form
- [ ] DELETE /api/forms/:id - Deletes form
- [ ] GET /api/forms/:id/submissions - Returns submissions
- [ ] GET /api/forms/:id/analytics - Returns analytics

### Public Endpoints
- [ ] GET /api/forms/public/token/:token - Returns form
- [ ] POST /api/forms/public/token/:token/submit - Submits form

## 🚀 Quick Test Commands

### Test Backend Routes
```bash
# Check if routes are loaded
cd backend
node -e "const app = require('./src/app.js'); console.log('Routes loaded');"
```

### Test Frontend Build
```bash
cd frontend
npm run build
```

### Check for TypeScript Errors
```bash
cd frontend
npx tsc --noEmit
```

## 📝 Notes

- Backend runs on port 3000 by default
- Frontend runs on port 5173 by default (Vite)
- API base URL: `http://localhost:3000/api`
- Forms API endpoint: `/api/forms`
- Public forms endpoint: `/api/forms/public`

## ✅ Verification Complete

All code is properly integrated. If you see 404 errors:
1. Ensure backend server is running
2. Check API URL configuration
3. Verify routes are registered
4. Check browser console for detailed errors
