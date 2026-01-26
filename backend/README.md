# KSS Backend API

Backend API for KSS - Krishna Sada Sahayate NGO Management System.

## Features

- 🔐 JWT-based authentication with role-based access control (RBAC)
- 👥 Member management (Donors, Volunteers, Beneficiaries, Core Team)
- 💰 Donation tracking with receipt generation
- 💸 Expense management with approval workflow
- 📅 Event management
- 👨‍👩‍👧‍👦 Volunteer assignment and attendance tracking
- 💳 Wallet balance tracking (auto-calculated)
- 📄 Document management
- 📊 Audit logging for all actions
- 🔒 Security features (Helmet, CORS, Rate Limiting)
- ✅ Input validation with Joi
- 🗑️ Soft delete (no hard deletes)

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Joi Validation
- Bcrypt for password hashing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - MongoDB connection string
   - JWT secret key
   - Other environment variables

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/mobile + password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Members
- `POST /api/members` - Create member
- `GET /api/members` - Get all members (with pagination)
- `GET /api/members/:id` - Get member by ID
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Soft delete member

### Donations
- `POST /api/donations` - Create donation
- `GET /api/donations` - Get all donations (with filters)
- `GET /api/donations/report` - Get donation report
- `GET /api/donations/member/:id` - Get donations by member
- `GET /api/donations/:id` - Get donation by ID
- `DELETE /api/donations/:id` - Soft delete donation

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - Get all expenses (with filters)
- `GET /api/expenses/report` - Get expense report
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id/approve` - Approve/reject expense
- `DELETE /api/expenses/:id` - Soft delete expense

### Events
- `POST /api/events` - Create event
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `GET /api/events/:id/summary` - Get event summary (donations, expenses, volunteers)
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Soft delete event

### Volunteers
- `POST /api/volunteers/assign` - Assign volunteer to event
- `GET /api/volunteers/event/:id` - Get volunteers by event
- `PUT /api/volunteers/:id/attendance` - Update attendance
- `DELETE /api/volunteers/:id` - Remove volunteer from event

### Wallet
- `GET /api/wallet/summary` - Get wallet summary

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get document by ID
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Audit Logs
- `GET /api/audit/logs` - Get audit logs (with filters)

## Roles & Permissions

### Roles
- `SUPER_ADMIN` - Full access
- `ADMIN` - Administrative access
- `ACCOUNTANT` - Financial operations
- `EVENT_MANAGER` - Event management
- `VOLUNTEER_MANAGER` - Volunteer management
- `AUDITOR` - Read-only access

### Permission System
Each role has specific permissions for different modules. See `src/config/permissions.js` for details.

## Database Models

1. **User** - System users (admins, staff)
2. **Member** - NGO members (donors, volunteers, beneficiaries)
3. **Donation** - Donation records
4. **Expense** - Expense records
5. **Event** - Event records
6. **VolunteerAssignment** - Volunteer-event assignments
7. **Wallet** - Single document for NGO balance
8. **Document** - Document storage
9. **AuditLog** - Audit trail

## Business Logic

- Wallet balance is **auto-calculated** from donations and approved expenses
- Expenses cannot be approved if wallet balance is insufficient
- All deletions are **soft deletes** (softDelete flag)
- Every CREATE/UPDATE/DELETE action creates an audit log
- Receipt numbers are auto-generated (format: KSS-YYYYMMDD-XXXXX)
- Member IDs are auto-generated (format: MEM-YYYY-XXXXX)

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- Helmet for security headers
- CORS configuration
- Input validation with Joi
- Role-based access control

## Error Handling

All errors are handled by a centralized error handler middleware. Errors return JSON responses with:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // For validation errors
}
```

## Development

```bash
# Run in development mode with nodemon
npm run dev

# Run tests (when implemented)
npm test
```

## Production

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Configure proper CORS origins
4. Use a production MongoDB instance
5. Set up proper logging
6. Use process manager (PM2) for running the server

## Project Structure

```
/src
 ├── config/          # Configuration files
 ├── models/          # Mongoose models
 ├── controllers/     # Route controllers
 ├── services/        # Business logic
 ├── routes/          # API routes
 ├── middlewares/     # Express middlewares
 ├── utils/           # Utility functions
 ├── validators/      # Joi validation schemas
 ├── app.js           # Express app setup
 └── server.js        # Server entry point
```

## License

ISC


