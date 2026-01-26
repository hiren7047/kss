# Advanced Event Management System

## Overview
This document describes the advanced event management features implemented for comprehensive NGO event administration, including target tracking, item-based donations, expense planning, and financial analytics.

## Key Features

### 1. Event Target Management
- **Target Amount**: Each event can now have a `targetAmount` field to set fundraising goals
- **Target Achievement Tracking**: Real-time calculation of target achievement percentage
- **Remaining Target**: Shows how much more is needed to reach the target

### 2. Item-Based Donations
- **Event Items**: Create specific items (e.g., chairs, tables, food items) that need funding
- **Item Donations**: Donors can donate specifically for items
- **Item Tracking**: 
  - Total quantity needed vs donated
  - Total amount needed vs donated
  - Completion percentage per item
  - Status: pending, partial, completed

**Example Use Case:**
- Event needs 15 chairs at ₹500 each = ₹7,500
- Donors can donate for specific chairs
- System tracks how many chairs are funded and remaining

### 3. Expense Planning
- **Planned Expenses**: Create expense plans before the event
- **Upcoming Expenses**: Track planned expenses with dates
- **Expense Status**: planned, in_progress, completed, cancelled
- **Priority Levels**: low, medium, high, critical
- **Variance Tracking**: Compare estimated vs actual expenses

### 4. Comprehensive Analytics
- **Financial Analytics**: Complete financial overview of events
- **Donation Analysis**: 
  - General vs item-specific donations
  - Payment mode distribution
  - Donation trends by date
  - Top donors
- **Expense Analysis**: 
  - Planned vs actual expenses
  - Variance calculations
  - Budget status
- **Item Analysis**: 
  - Item completion status
  - Funding progress per item
- **Recommendations**: AI-powered recommendations based on financial health

### 5. Event Dashboard
Complete dashboard view with:
- Financial summary
- Recent donations
- Upcoming expenses
- Top donors
- Item status
- Recommendations

## API Endpoints

### Event Endpoints
- `GET /api/events/:id/analytics` - Get comprehensive financial analytics
- `GET /api/events/:id/dashboard` - Get event dashboard data
- `GET /api/events/:id/items` - Get event items with donation details
- `GET /api/events/:id/summary` - Enhanced summary with target tracking

### Event Items Endpoints
- `POST /api/event-items` - Create event item
- `GET /api/event-items` - Get all items (with eventId query param)
- `GET /api/event-items/event/:eventId` - Get items for specific event
- `GET /api/event-items/:id` - Get item by ID
- `PUT /api/event-items/:id` - Update item
- `DELETE /api/event-items/:id` - Delete item
- `GET /api/event-items/:id/donations` - Get donations for specific item

### Expense Plan Endpoints
- `POST /api/event-expense-plans` - Create expense plan
- `GET /api/event-expense-plans` - Get all plans (with eventId query param)
- `GET /api/event-expense-plans/event/:eventId` - Get plans for specific event
- `GET /api/event-expense-plans/:id` - Get plan by ID
- `PUT /api/event-expense-plans/:id` - Update plan
- `PUT /api/event-expense-plans/:id/approve` - Approve plan
- `DELETE /api/event-expense-plans/:id` - Delete plan

## Data Models

### Event Model (Enhanced)
```javascript
{
  name: String,
  targetAmount: Number,  // NEW: Target fundraising amount
  budget: Number,
  // ... other fields
}
```

### EventItem Model (New)
```javascript
{
  eventId: ObjectId,
  name: String,              // e.g., "Chairs"
  description: String,
  unitPrice: Number,        // Price per unit
  totalQuantity: Number,    // Total needed
  donatedQuantity: Number,  // Quantity funded
  totalAmount: Number,      // Total amount needed
  donatedAmount: Number,    // Amount received
  status: String,           // pending, partial, completed
  priority: String          // low, medium, high, critical
}
```

### EventExpensePlan Model (New)
```javascript
{
  eventId: ObjectId,
  title: String,
  category: String,
  estimatedAmount: Number,
  actualAmount: Number,
  plannedDate: Date,
  status: String,           // planned, in_progress, completed, cancelled
  priority: String,
  isApproved: Boolean
}
```

### Donation Model (Enhanced)
```javascript
{
  // ... existing fields
  eventItemId: ObjectId,    // NEW: Link to specific item
  donationType: String,     // NEW: general, item_specific, expense_specific
  itemQuantity: Number      // NEW: Quantity donated for item
}
```

## Usage Examples

### Creating an Event with Target
```javascript
POST /api/events
{
  "name": "Daughter's Function",
  "targetAmount": 100000,  // Set target
  "budget": 80000,
  "startDate": "2026-02-01",
  "endDate": "2026-02-05",
  "managerId": "..."
}
```

### Creating Event Items
```javascript
POST /api/event-items
{
  "eventId": "...",
  "name": "Chairs",
  "description": "15 chairs needed",
  "unitPrice": 500,
  "totalQuantity": 15,
  "priority": "high"
}
```

### Making Item-Specific Donation
```javascript
POST /api/donations
{
  "donorName": "John Doe",
  "amount": 2500,
  "eventId": "...",
  "eventItemId": "...",      // Link to chair item
  "donationType": "item_specific",
  "itemQuantity": 5,         // Donating for 5 chairs
  "paymentMode": "upi"
}
```

### Creating Expense Plan
```javascript
POST /api/event-expense-plans
{
  "eventId": "...",
  "title": "Catering",
  "category": "Food",
  "estimatedAmount": 30000,
  "plannedDate": "2026-02-03",
  "priority": "high"
}
```

### Getting Event Analytics
```javascript
GET /api/events/:id/analytics

Response:
{
  "success": true,
  "data": {
    "financialSummary": {
      "targetAmount": 100000,
      "totalDonations": 75000,
      "targetAchievement": 75,
      "availableBalance": 50000,
      ...
    },
    "donationAnalysis": {
      "total": 75000,
      "itemDonations": {...},
      "byPaymentMode": {...}
    },
    "itemAnalysis": {
      "items": [...],
      "itemCompletionPercentage": 60
    },
    "recommendations": [...]
  }
}
```

## Business Logic

### Item Donation Flow
1. Admin creates event item (e.g., 15 chairs at ₹500 each)
2. Donor makes donation specifying `eventItemId` and `itemQuantity`
3. System automatically:
   - Updates item's `donatedAmount` and `donatedQuantity`
   - Updates item status (pending → partial → completed)
   - Links donation to item

### Target Achievement
- Calculated as: `(totalDonations / targetAmount) * 100`
- Shows real-time progress toward fundraising goal
- Helps identify events that need more promotion

### Expense Planning
- Create expense plans before event
- Track planned vs actual expenses
- Get variance analysis
- Link expense plans to actual expenses when created

## Admin Benefits

1. **Complete Financial Visibility**: See target vs actual, item funding status, expense planning
2. **Better Planning**: Plan expenses in advance and track them
3. **Donor Engagement**: Allow donors to fund specific items they care about
4. **Data-Driven Decisions**: Analytics and recommendations help make informed decisions
5. **Transparency**: Clear tracking of where money comes from and goes

## Permissions

All endpoints require authentication and appropriate permissions:
- `EVENT_CREATE` - Create events, items, expense plans
- `EVENT_READ` - View events, analytics, dashboard
- `EVENT_UPDATE` - Update events, items, expense plans
- `EVENT_DELETE` - Delete events, items, expense plans
- `EXPENSE_APPROVE` - Approve expense plans

## Notes

- All models support soft delete
- All operations are audited
- Item donations automatically update item statistics
- Analytics are calculated in real-time
- Recommendations are generated based on financial health indicators
