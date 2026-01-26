# Events Seed Data Script

## Overview
This script creates comprehensive test data for events management system including:
- Multiple events with different statuses
- Event items (chairs, tables, etc.)
- Item-based donations
- Expense plans
- General donations
- Completed expenses

## Usage

Run the seed script from the backend directory:

```bash
cd backend
npm run seed:events
```

Or directly:

```bash
node src/scripts/seedEventsData.js
```

## Test Data Created

### Events Created:

1. **Medical Health Camp** (Planned)
   - Target: ₹100,000
   - Budget: ₹75,000
   - Items: Medical Equipment, Medicines
   - Expense Plans: Venue Rental, Doctor Fees
   - Donations: ₹40,000

2. **Food Distribution Drive** (Planned - Fully Funded)
   - Target: ₹50,000
   - Budget: ₹50,000
   - Items: Rice Bags, Cooking Oil
   - Donations: ₹50,000 (fully funded!)

3. **Education Workshop** (Planned - Partial Funding)
   - Target: ₹50,000
   - Budget: ₹35,000
   - Items: Study Materials
   - Donations: ₹22,000

4. **Blood Donation Camp** (Completed)
   - Target: ₹30,000
   - Budget: ₹25,000
   - Donations: ₹25,000

5. **Daughter's Function (Samuh Lag)** (Planned) ⭐
   - Target: ₹200,000
   - Budget: ₹150,000
   - Items: 
     - 15 Chairs (₹500 each = ₹7,500)
     - 5 Tables (₹2,000 each = ₹10,000)
   - Item Donations:
     - 15 chairs funded (₹7,500)
     - 5 tables funded (₹10,000)
   - General Donations: ₹55,000
   - Expense Plans: Catering, Decoration, Sound System, Photography

6. **Ongoing Community Health Program** (Ongoing)
   - Target: ₹250,000
   - Budget: ₹200,000
   - Donations: ₹150,000
   - Expenses: ₹60,000 (approved)

7. **Cancelled Fundraising Event** (Cancelled)
   - Target: ₹60,000
   - Budget: ₹50,000

8. **Large Community Event** (Planned)
   - Target: ₹400,000
   - Budget: ₹300,000
   - Multiple Items: Tents, Chairs, Tables, Sound System, Lighting, Food
   - All items 30% funded
   - General donations: ₹100,000

## Testing Scenarios

After running the seed script, you can test:

### 1. Events List Page
- ✅ View all events with different statuses
- ✅ See target amounts and funding progress
- ✅ Filter by status (All, Upcoming, Ongoing, Completed)

### 2. Event Detail Page
- ✅ View comprehensive dashboard
- ✅ Check target achievement
- ✅ See item funding status
- ✅ View expense plans

### 3. Item-Based Donations
- ✅ View items for "Daughter's Function"
- ✅ See chairs and tables with funding progress
- ✅ Check item-specific donations

### 4. Expense Planning
- ✅ View planned expenses
- ✅ See estimated vs actual amounts
- ✅ Check expense categories

### 5. Analytics
- ✅ View financial analytics
- ✅ Check donation breakdown
- ✅ See item completion percentages
- ✅ View expense variance

## Notes

- The script uses the existing admin user (admin@kss.org) as manager
- If admin doesn't exist, it creates a test manager
- All donations are marked as 'completed'
- Item donations automatically update item statistics
- The script can be run multiple times (it won't delete existing data unless uncommented)

## Clean Up (Optional)

To clear test data before re-seeding, uncomment these lines in the script:

```javascript
await Event.deleteMany({ name: { $regex: /^(Test|Sample|Medical|Food|Education|Blood|Daughter)/i } });
await EventItem.deleteMany({});
await EventExpensePlan.deleteMany({});
```

**⚠️ Warning:** This will delete all matching events and related data!

## Example Test Flow

1. Run seed script: `npm run seed:events`
2. Login to admin panel
3. Go to Events page
4. Click on "Daughter's Function (Samuh Lag)"
5. Check Items tab - see chairs and tables with funding
6. Check Expense Plans tab - see planned expenses
7. Check Analytics tab - see comprehensive analysis
8. Test creating new items and expense plans
9. Test making item-specific donations

## Troubleshooting

If you get errors:
- Make sure MongoDB is running
- Check that admin user exists (run `npm run seed:admin` first)
- Verify environment variables are set correctly
- Check console for specific error messages

Happy Testing! 🎉
