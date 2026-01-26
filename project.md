You are a senior backend architect.

Build a complete, production-ready BACKEND SYSTEM for a Non-Profit NGO named
“KSS – Krishna Sada Sahayate”.

Tech Stack:
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Role Based Access Control (RBAC)
- MVC + Service architecture
- Clean folder structure
- REST APIs only (no frontend)

------------------------------------
CORE BACKEND PRINCIPLES
------------------------------------
- High transparency
- Finance-first architecture
- Audit friendly
- Secure
- Scalable
- Maintainable
- No hard delete (soft delete only)
- Every financial action must be traceable

------------------------------------
PROJECT FOLDER STRUCTURE
------------------------------------
/src
 ├── config
 │   ├── db.js
 │   ├── env.js
 │   ├── roles.js
 │   └── permissions.js
 ├── models
 ├── controllers
 ├── services
 ├── routes
 ├── middlewares
 ├── utils
 ├── validators
 ├── logs
 ├── uploads
 ├── app.js
 └── server.js

------------------------------------
ROLES
------------------------------------
- SUPER_ADMIN
- ADMIN
- ACCOUNTANT
- EVENT_MANAGER
- VOLUNTEER_MANAGER
- AUDITOR (read-only)

------------------------------------
AUTHENTICATION & AUTHORIZATION
------------------------------------
- JWT based auth
- Login with email or mobile + password
- Password hashing (bcrypt)
- Role based route protection
- Action-level permission checks
- Login activity logging
- Token refresh logic

------------------------------------
DATABASE MODELS (MONGOOSE)
------------------------------------

1️⃣ User Model
- name
- email
- mobile
- password
- role
- status (active/inactive)
- lastLogin
- createdAt

2️⃣ Member Model
- memberId (auto-generated unique)
- name
- photo
- email
- mobile
- address
- memberType (donor/volunteer/beneficiary/core)
- idProof
- joinDate
- status
- notes
- softDelete

3️⃣ Donation Model
- donorName
- memberId (optional ref)
- amount
- purpose (event/general/emergency)
- paymentMode (upi/cash/bank)
- transactionId
- eventId (optional)
- receiptNumber
- createdAt
- createdBy
- softDelete

4️⃣ Expense Model
- title
- category
- amount
- eventId (optional)
- billUrl
- approvedBy
- approvalStatus (pending/approved/rejected)
- createdAt
- softDelete

5️⃣ Event Model
- name
- description
- location
- startDate
- endDate
- budget
- managerId
- status
- softDelete

6️⃣ VolunteerAssignment Model
- volunteerId
- eventId
- role
- attendance
- remarks

7️⃣ Wallet Model (SINGLE DOCUMENT)
- totalDonations
- totalExpenses
- availableBalance
- restrictedFunds
- updatedAt

8️⃣ Document Model
- title
- category
- fileUrl
- visibility (public/private)
- uploadedBy
- uploadedAt

9️⃣ AuditLog Model
- userId
- action
- module
- oldData
- newData
- timestamp
- ipAddress

------------------------------------
BUSINESS LOGIC RULES
------------------------------------
- Wallet balance auto-updates ONLY via donation & expense APIs
- Expense cannot be approved if balance is insufficient
- Donation delete = soft delete + wallet recalculation
- Every CREATE / UPDATE / DELETE must create audit log
- Auditors have READ ONLY access
- Super Admin only can permanently delete data

------------------------------------
API MODULES
------------------------------------

AUTH APIs:
- POST /auth/login
- POST /auth/logout
- POST /auth/refresh

MEMBER APIs:
- POST /members
- GET /members
- GET /members/:id
- PUT /members/:id
- DELETE /members/:id (soft)

DONATION APIs:
- POST /donations
- GET /donations
- GET /donations/report
- GET /donations/member/:id

EXPENSE APIs:
- POST /expenses
- PUT /expenses/:id/approve
- GET /expenses
- GET /expenses/report

EVENT APIs:
- POST /events
- GET /events
- PUT /events/:id
- GET /events/:id/summary

VOLUNTEER APIs:
- POST /volunteers/assign
- GET /volunteers/event/:id

WALLET APIs:
- GET /wallet/summary

DOCUMENT APIs:
- POST /documents/upload
- GET /documents

AUDIT APIs:
- GET /audit/logs

------------------------------------
UTILS & HELPERS
------------------------------------
- Receipt number generator
- Member ID generator
- Date range filters
- Pagination helper
- Excel/PDF export helper

------------------------------------
SECURITY
------------------------------------
- Input validation (Joi / Zod)
- Rate limiting
- Helmet
- CORS config
- Secure file upload handling

------------------------------------
OUTPUT EXPECTATION
------------------------------------
- Write clean production-grade code
- Separate controllers, services, models
- Use async/await
- Add comments where needed
- Create reusable services
- Make APIs ready for frontend & mobile app

Build step-by-step and ensure correctness.

Design a professional, modern, transparent, and scalable ADMIN PANEL for a non-profit NGO named 
“KSS – Krishna Sada Sahayate”.

The admin panel should feel trustworthy, donation-focused, data-driven, and easy to operate 
even by non-technical NGO staff.

Target users:
- Super Admin (Founder / Owner)
- Admin / Office Staff
- Accountant
- Event Manager
- Volunteer Manager

Theme & UI Style:
- Clean, minimal, professional NGO-style UI
- Light background with green/blue trust colors
- Dashboard-focused layout
- Card-based stats
- Sidebar navigation (collapsible)
- Fully responsive (desktop + tablet + mobile)
- Icons for every menu
- Charts, graphs, and tables everywhere possible

-----------------------------------
MAIN MODULES & SCREENS
-----------------------------------

1️⃣ AUTHENTICATION & ACCESS
- Login (Email / Mobile + Password)
- OTP based login (optional)
- Forgot password
- Role based access control (RBAC)
- Audit log for every admin action

-----------------------------------

2️⃣ DASHBOARD (HOME)
Show everything at a glance:

Top KPI Cards:
- Total Members
- Total Volunteers
- Total Donations (All Time)
- Total Donations (This Month)
- Available NGO Balance
- Active Events
- Upcoming Events
- Pending Requests

Graphs:
- Monthly Donation Graph
- Expense vs Donation Comparison
- Member Growth Chart
- Event-wise fund usage chart

Quick Actions:
- Add Member
- Add Donation
- Create Event
- Approve Expense
- Upload Report

-----------------------------------

3️⃣ MEMBER MANAGEMENT
Full registration & tracking of all NGO members.

Features:
- Add / Edit / Delete Member
- Member Types:
  - Donor
  - Volunteer
  - Beneficiary
  - Core Team
- Full Registration Form:
  - Name
  - Photo
  - Mobile
  - Email
  - Address
  - ID Proof
  - Joining Date
  - Membership ID (auto-generated)
  - Status (Active / Inactive)
- Member Profile Page:
  - Donation history
  - Event participation
  - Certificates
  - Notes & remarks
- Export member list (PDF / Excel)

-----------------------------------

4️⃣ DONATION MANAGEMENT (VERY IMPORTANT)
Transparency-focused donation system.

Features:
- Add Donation (Online / Cash / Bank / UPI)
- Auto receipt generation (PDF)
- Donation fields:
  - Donor Name
  - Member ID (optional)
  - Amount
  - Purpose (Event / General / Emergency)
  - Payment Mode
  - Transaction ID
  - Date
- Donation Categories:
  - Event-wise
  - Cause-wise
  - General Fund
- Donation Reports:
  - Daily / Monthly / Yearly
  - Donor-wise report
- Public transparency-ready data structure

-----------------------------------

5️⃣ EXPENSE & FUND UTILIZATION
Complete expense tracking.

Features:
- Add Expense
- Expense Approval Workflow
- Expense Fields:
  - Expense Title
  - Category
  - Amount
  - Event linked (optional)
  - Bill Upload
  - Approved By
  - Date
- Expense vs Donation comparison
- Auto remaining balance calculation
- Accountant-only access for approval

-----------------------------------

6️⃣ EVENT MANAGEMENT
Manage all NGO activities.

Features:
- Create / Edit / Delete Events
- Event Fields:
  - Event Name
  - Description
  - Location
  - Start Date – End Date
  - Event Budget
  - Event Manager
- Event Dashboard:
  - Total Funds Collected
  - Total Expenses
  - Remaining Amount
  - Volunteers Assigned
- Upload Event Photos & Reports
- Event completion status

-----------------------------------

7️⃣ VOLUNTEER MANAGEMENT
Dedicated volunteer system.

Features:
- Volunteer registration
- Skill-based tagging
- Availability status
- Assign volunteers to events
- Volunteer attendance
- Performance notes
- Certificate generation

-----------------------------------

8️⃣ NGO WALLET & BALANCE SYSTEM
Central NGO financial overview.

Features:
- Current Available Balance
- Fund Source Breakdown
- Restricted Funds vs Open Funds
- Event locked budgets
- Alerts for low balance
- Auto calculation only (no manual edit)

-----------------------------------

9️⃣ DOCUMENT & REPORT MANAGEMENT
Transparency proof section.

Features:
- Upload Documents:
  - Audit Reports
  - Utilization Certificates
  - Event Reports
  - Legal Documents
- Categorized folders
- Public/Private visibility toggle
- Downloadable PDFs

-----------------------------------

🔟 COMMUNICATION SYSTEM
Internal & external communication.

Features:
- Bulk SMS
- Bulk Email
- WhatsApp integration (optional)
- Message templates
- Event reminder messages
- Donation thank-you messages

-----------------------------------

1️⃣1️⃣ SETTINGS & CONFIGURATION
- NGO Profile Details
- Bank / UPI Details
- Logo & Branding
- User Roles & Permissions
- Receipt Format Settings
- Notification Settings

-----------------------------------

1️⃣2️⃣ SECURITY & TRANSPARENCY
- Action Logs (who did what & when)
- Read-only mode for auditors
- Data export for government use
- No data deletion without super admin approval

-----------------------------------

FINAL DESIGN EXPECTATION
- Feels like a government-level trusted NGO portal
- Easy navigation for non-technical users
- High transparency
- Finance-first architecture
- Clean charts, tables, and summaries
- Professional typography and spacing
