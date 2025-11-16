# Order Status Refresh Feature

## Overview

Users (and admins) can now **refresh the status of all their orders** with one click. The system fetches the latest status from the SMM provider API and updates all orders in the database.

## How It Works

### 1. Multi-Order Status API

The system uses the provider's batch status endpoint to efficiently check multiple orders:

```
POST https://viieagency.com/api/v2
Parameters:
  - key: your_api_key
  - action: status
  - orders: "1,10,100" (comma-separated, up to 100 IDs)

Response:
{
  "1": {
    "charge": "0.27819",
    "start_count": "3572",
    "status": "Partial",
    "remains": "157",
    "currency": "USD"
  },
  "10": {
    "error": "Incorrect order ID"
  },
  "100": {
    "charge": "1.44219",
    "start_count": "234",
    "status": "In progress",
    "remains": "10",
    "currency": "USD"
  }
}
```

### 2. Batch Processing

The system automatically handles large order lists:
- **Batch Size**: 100 orders per request (API limit)
- **Auto-batching**: If you have 250 orders, it makes 3 requests
- **Error Handling**: Individual order errors don't stop the entire refresh
- **Success Tracking**: Shows how many orders updated successfully

### 3. Database Updates

For each order, the system updates:
- ✅ **status** - Current order status (Completed, In progress, Partial, etc.)
- ✅ **charge** - Actual cost charged by provider
- ✅ **start_count** - Starting count when order began
- ✅ **remains** - How many items remain to be delivered
- ✅ **currency** - Currency of the charge (usually USD)

## User Interface

### Location: My Orders Page (`/my-orders`)

### Main Refresh Button

**Appearance**:
```
┌─────────────────────────────────────────┐
│  [🔄 Refresh All Statuses (45)]        │
│  [↻ Reload List]  [+ Add Order ID]    │
│                                         │
│  💡 Click "Refresh All Statuses" to    │
│     get the latest status for all      │
│     45 orders from the provider        │
└─────────────────────────────────────────┘
```

**Features**:
- 🟢 **Green button** - Prominent and easy to find
- 🔢 **Order count badge** - Shows how many orders will refresh
- ⏳ **Loading state** - "Refreshing..." with spinning icon
- ℹ️ **Helpful hint** - Explains what the button does
- 🚫 **Disabled when loading** - Prevents multiple clicks

### Status Display

Each order shows:

| Field | Description | Example |
|-------|-------------|---------|
| **ID** | Order ID | 12345 |
| **Date** | Order creation date/time | 2024-01-15 10:30:00 |
| **Link** | Target URL | https://youtube.com/... |
| **Charge** | Actual cost | 0.27819 |
| **Start Count** | Initial count | 3572 |
| **Quantity** | Ordered amount | 1000 |
| **Service** | Service name | YouTube Views |
| **Status** | Current status | In progress |
| **Remains** | Items pending | 157 |

### Status Colors

Status badges are color-coded:

- 🟢 **Completed** - Green badge with checkmark
- 🟡 **In Progress** - Yellow badge
- 🟡 **Partial** - Yellow badge
- 🔵 **Pending** - Blue badge
- 🔴 **Error/Canceled** - Red badge
- ⚪ **Other** - Gray badge

## User Flow

### Step-by-Step Usage

1. **Navigate to My Orders**
   ```
   User → Dashboard → My Orders
   ```

2. **View Orders List**
   ```
   System shows all user's orders with current status
   ```

3. **Click "Refresh All Statuses"**
   ```
   Button changes to "Refreshing..." with spinning icon
   ```

4. **System Processes**
   ```
   - Fetches all order IDs
   - Splits into batches of 100
   - Calls provider API for each batch
   - Updates database with new status
   - Updates UI with fresh data
   ```

5. **See Results**
   ```
   Toast message: "45 orders updated successfully"
   Table updates with latest status
   ```

### Example Scenarios

#### Scenario 1: Small Order List (10 orders)
```
1. User clicks "Refresh All Statuses (10)"
2. System makes 1 API call with all 10 IDs
3. All 10 orders update in 2 seconds
4. Toast: "10 orders updated successfully"
```

#### Scenario 2: Large Order List (250 orders)
```
1. User clicks "Refresh All Statuses (250)"
2. System makes 3 API calls:
   - Batch 1: Orders 1-100
   - Batch 2: Orders 101-200
   - Batch 3: Orders 201-250
3. All orders update in 6 seconds
4. Toast: "250 orders updated successfully"
```

#### Scenario 3: Partial Errors
```
1. User clicks "Refresh All Statuses (50)"
2. System processes all orders
3. 3 orders have "Incorrect order ID" error
4. Toast: "47 orders updated successfully (3 failed)"
```

## Technical Implementation

### Frontend (`app/my-orders/page.tsx`)

```typescript
const refreshOrderStatuses = async () => {
  // 1. Get all order IDs
  const ids = orders.map(o => o.orderId)
  
  // 2. Process in batches of 100
  for (let i = 0; i < ids.length; i += 100) {
    const batchIds = ids.slice(i, i + 100)
    
    // 3. Fetch status from provider
    const statuses = await smmApi.getMultipleOrderStatus(batchIds)
    
    // 4. Update each order in database
    for (const [orderId, status] of Object.entries(statuses)) {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify(status)
      })
    }
  }
  
  // 5. Update UI
  setOrders(updatedOrders)
}
```

### API Client (`lib/api.ts`)

```typescript
async getMultipleOrderStatus(orderIds: number[]): Promise<MultipleOrderStatus> {
  const ordersString = orderIds.join(",")
  return await this.makeRequest({ 
    action: "status", 
    orders: ordersString 
  })
}
```

### Backend API (`app/api/orders/[id]/route.ts`)

Updates order status in database:
```typescript
PATCH /api/orders/:orderId
Body: {
  status: "In progress",
  charge: "0.27819",
  start_count: "3572",
  remains: "157",
  currency: "USD"
}
```

## Status Values

### Common Status Values

| Status | Meaning | Next Action |
|--------|---------|-------------|
| **Pending** | Order received, not started | Wait |
| **In progress** | Currently being processed | Wait |
| **Partial** | Partially completed | Wait or request refill |
| **Completed** | Fully completed | Can request refill if drops |
| **Processing** | Being worked on | Wait |
| **Canceled** | Order canceled | Check refund |
| **Error** | Something went wrong | Contact support |

### Status Transitions

Typical order lifecycle:
```
Pending → In progress → Completed
                     ↓
                  Partial (if issues)
```

## Benefits

### For Users

✅ **Stay Updated** - Always know current order status  
✅ **One Click** - Refresh all orders at once  
✅ **Real-time Data** - Direct from provider API  
✅ **Error Visibility** - See which orders have issues  
✅ **Track Progress** - Monitor "remains" count  

### For Admins

✅ **User Support** - Help users check order status  
✅ **Bulk Updates** - Refresh hundreds of orders  
✅ **Data Accuracy** - Keep database synchronized  
✅ **Troubleshooting** - Identify problematic orders  

## Troubleshooting

### Button Not Working

**Check**:
- Are you logged in?
- Do you have any orders?
- Is the button disabled (already refreshing)?

**Solution**: Wait for current refresh to complete

### Orders Not Updating

**Possible Causes**:
1. Provider API is down
2. Invalid order IDs
3. Network issues

**Solution**: 
- Try individual order status check
- Check provider dashboard
- Try again in a few minutes

### Slow Refresh

**This is normal if**:
- You have many orders (100+)
- System processes 100 at a time
- Each batch takes 2-3 seconds

**Expected Times**:
- 50 orders: ~3 seconds
- 100 orders: ~3 seconds
- 200 orders: ~6 seconds
- 500 orders: ~15 seconds

### Partial Success Message

**Example**: "47 orders updated successfully (3 failed)"

**Meaning**: 
- 47 orders updated fine
- 3 orders had errors (probably invalid IDs)
- Check console for specific error details

**Action**: 
- Most orders updated successfully
- Failed orders might be deleted or invalid
- No action needed if most succeeded

## Best Practices

### When to Refresh

1. **After Placing Orders** - Wait 5 minutes, then refresh
2. **Check Progress** - Refresh every hour for active orders
3. **Before Refill** - Always refresh to see current remains
4. **Troubleshooting** - Refresh if status seems stuck

### Performance Tips

1. **Don't Spam** - Wait for refresh to complete
2. **Batch Window** - Orders refresh 100 at a time
3. **Off-Peak Hours** - Faster during low-traffic times
4. **Regular Intervals** - Don't refresh more than every 5 minutes

### Data Interpretation

1. **Remains > 0** - Order still processing
2. **Remains = 0** - Order complete
3. **Status = Partial** - Some items dropped, may need refill
4. **Charge** - Actual provider cost (might differ from estimate)

## API Limits

- **Max Orders per Request**: 100
- **Format**: Comma-separated string
- **Example**: "1,2,3,4,5,...,100"
- **Auto-batching**: System handles this automatically

## Security

- ✅ User can only refresh their own orders
- ✅ Admin can refresh all orders
- ✅ API key not exposed to client
- ✅ Session-based authentication required

## Summary

The Order Status Refresh feature provides:

✅ **One-Click Updates** - Refresh all orders instantly  
✅ **Batch Processing** - Handles any number of orders  
✅ **Real-Time Data** - Direct from provider API  
✅ **Error Handling** - Graceful handling of failures  
✅ **User Feedback** - Clear success/error messages  
✅ **Visual Updates** - Immediate UI refresh  

**Result**: Users always have up-to-date information about their orders! 🎯

