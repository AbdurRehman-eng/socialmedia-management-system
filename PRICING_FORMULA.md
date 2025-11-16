# SMM Panel Pricing Formula

## Overview
All prices in this system are in **Philippine Pesos (₱)**.

## Important: Understanding "Per 1000"
In the SMM industry, service rates are quoted **per 1000 units**. This is the standard practice.

For example:
- YouTube Views are priced per 1000 views
- Instagram Followers are priced per 1000 followers
- Facebook Likes are priced per 1000 likes

## Pricing Formula

### Step-by-Step Calculation

**YOUR PRICE PER 1000 = PROVIDER RATE PER 1000 × 1.5**

The 1.5 multiplier means you add 50% markup to the provider's rate.

### Examples

#### Example 1: YouTube Views
```
Provider Rate: ₱10.00 per 1000 views
Your Price:    ₱10.00 × 1.5 = ₱15.00 per 1000 views
Your Profit:   ₱15.00 - ₱10.00 = ₱5.00 per 1000 views

If a customer orders 5000 views:
- Cost to you: (₱10.00 / 1000) × 5000 = ₱50.00
- Customer pays: (₱15.00 / 1000) × 5000 = ₱75.00
- Your profit: ₱75.00 - ₱50.00 = ₱25.00
```

#### Example 2: Instagram Followers  
```
Provider Rate: ₱20.00 per 1000 followers
Your Price:    ₱20.00 × 1.5 = ₱30.00 per 1000 followers
Your Profit:   ₱30.00 - ₱20.00 = ₱10.00 per 1000 followers

If a customer orders 2000 followers:
- Cost to you: (₱20.00 / 1000) × 2000 = ₱40.00
- Customer pays: (₱30.00 / 1000) × 2000 = ₱60.00
- Your profit: ₱60.00 - ₱40.00 = ₱20.00
```

#### Example 3: TikTok Likes
```
Provider Rate: ₱5.00 per 1000 likes
Your Price:    ₱5.00 × 1.5 = ₱7.50 per 1000 likes
Your Profit:   ₱7.50 - ₱5.00 = ₱2.50 per 1000 likes

If a customer orders 10000 likes:
- Cost to you: (₱5.00 / 1000) × 10000 = ₱50.00
- Customer pays: (₱7.50 / 1000) × 10000 = ₱75.00
- Your profit: ₱75.00 - ₱50.00 = ₱25.00
```

## How It Works in the Application

### 1. Service List Display
When users browse services, they see:
- Service name and description
- Your price per 1000 units (calculated with 50% markup)
- Minimum and maximum order quantities

### 2. Order Calculation
When a user places an order:
```
1. Get provider rate per 1000 (e.g., ₱10.00)
2. Calculate your rate per 1000: ₱10.00 × 1.5 = ₱15.00
3. Calculate price per unit: ₱15.00 / 1000 = ₱0.015
4. Multiply by quantity: ₱0.015 × quantity
```

### 3. Example Order Flow
```
Customer orders 3500 YouTube Views
Provider rate: ₱10.00 per 1000 views

Step 1: Calculate your rate per 1000
  Your rate = ₱10.00 × 1.5 = ₱15.00 per 1000

Step 2: Calculate price per unit
  Price per unit = ₱15.00 / 1000 = ₱0.015

Step 3: Calculate total cost
  Total = ₱0.015 × 3500 = ₱52.50

Customer is charged: ₱52.50
Your cost: (₱10.00 / 1000) × 3500 = ₱35.00
Your profit: ₱52.50 - ₱35.00 = ₱17.50
```

## Coin System

In this platform, we use a coin system where:
- **1 coin = ₱1.00** (Philippine Peso)

So when we say a service costs 52.50 coins, it means ₱52.50.

## Adjusting Markup

The default markup is **1.5 (50% markup)**, but you can adjust this:

### Global Markup
You can change the default markup in the database settings:
```sql
UPDATE settings SET value = '2.0' WHERE key = 'default_markup';
```
This would change to 100% markup (double the provider price).

### Per-Service Markup
You can set custom markup for specific services in the `pricing_rules` table:
```sql
INSERT INTO pricing_rules (service_id, markup) 
VALUES (12345, 2.0);  -- 100% markup for service #12345
```

### Custom Fixed Price
You can also set a fixed price for a service:
```sql
INSERT INTO pricing_rules (service_id, custom_price) 
VALUES (12345, 25.00);  -- Fixed at ₱25.00 per 1000, regardless of provider price
```

## Summary

✅ **Provider rates are PER 1000 units**  
✅ **Your price = Provider rate × 1.5 (50% markup)**  
✅ **All prices in Philippine Pesos (₱)**  
✅ **1 coin = ₱1.00**  
✅ **Markup is configurable globally or per-service**

## Scripts Available

### Get All Service Prices
```bash
npx tsx scripts/get-service-prices.ts
```
This will fetch all services from your provider and show:
- Provider rate per 1000
- Your price per 1000 (with markup)
- Your profit per 1000
- Organized by category

### Quick Calculation
For any service:
1. Find the provider rate per 1000
2. Multiply by 1.5 to get your price per 1000
3. Divide by 1000 to get price per unit
4. Multiply by order quantity to get total cost

**Formula**: `Total = (Provider_Rate_Per_1000 × 1.5 / 1000) × Quantity`

