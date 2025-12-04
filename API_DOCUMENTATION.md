# BillForge API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
All endpoints (except auth endpoints) require authentication using Laravel Sanctum.

Include the access token in the Authorization header:
```
Authorization: Bearer {access_token}
```

---

## Authentication Endpoints

### Register User
**POST** `/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "uuid": "9d4e8b2a-1c3d-4e5f-9a8b-7c6d5e4f3a2b",
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2025-12-04T10:00:00.000000Z",
      "updated_at": "2025-12-04T10:00:00.000000Z"
    },
    "token": "1|abcdefghijklmnopqrstuvwxyz123456789"
  }
}
```

### Login
**POST** `/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "uuid": "9d4e8b2a-1c3d-4e5f-9a8b-7c6d5e4f3a2b",
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2025-12-04T10:00:00.000000Z",
      "updated_at": "2025-12-04T10:00:00.000000Z"
    },
    "token": "2|abcdefghijklmnopqrstuvwxyz123456789"
  }
}
```

### Logout
**POST** `/logout`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## Business Endpoints

### Get All Businesses (User's businesses only)
**GET** `/businesses`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "uuid": "8c5e9f3b-2d4e-5f6a-0b9c-8d7e6f5a4b3c",
      "user_uuid": "9d4e8b2a-1c3d-4e5f-9a8b-7c6d5e4f3a2b",
      "name": "Acme Corporation",
      "address": "123 Business St, City, Country",
      "phone": "+1234567890",
      "created_at": "2025-12-04T10:00:00.000000Z",
      "updated_at": "2025-12-04T10:00:00.000000Z"
    }
  ]
}
```

### Create Business
**POST** `/businesses`

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "address": "123 Business St, City, Country",
  "phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "8c5e9f3b-2d4e-5f6a-0b9c-8d7e6f5a4b3c",
    "user_uuid": "9d4e8b2a-1c3d-4e5f-9a8b-7c6d5e4f3a2b",
    "name": "Acme Corporation",
    "address": "123 Business St, City, Country",
    "phone": "+1234567890",
    "created_at": "2025-12-04T10:00:00.000000Z",
    "updated_at": "2025-12-04T10:00:00.000000Z"
  }
}
```

### Get Single Business
**GET** `/businesses/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "8c5e9f3b-2d4e-5f6a-0b9c-8d7e6f5a4b3c",
    "user_uuid": "9d4e8b2a-1c3d-4e5f-9a8b-7c6d5e4f3a2b",
    "name": "Acme Corporation",
    "address": "123 Business St, City, Country",
    "phone": "+1234567890",
    "created_at": "2025-12-04T10:00:00.000000Z",
    "updated_at": "2025-12-04T10:00:00.000000Z"
  }
}
```

### Update Business
**PUT/PATCH** `/businesses/{id}`

**Request Body:**
```json
{
  "name": "Updated Business Name",
  "address": "456 New Address",
  "phone": "+9876543210"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "8c5e9f3b-2d4e-5f6a-0b9c-8d7e6f5a4b3c",
    "user_uuid": "9d4e8b2a-1c3d-4e5f-9a8b-7c6d5e4f3a2b",
    "name": "Updated Business Name",
    "address": "456 New Address",
    "phone": "+9876543210",
    "created_at": "2025-12-04T10:00:00.000000Z",
    "updated_at": "2025-12-04T10:15:00.000000Z"
  }
}
```

### Delete Business
**DELETE** `/businesses/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Business deleted successfully"
  }
}
```

---

## Item Endpoints

### Get All Items
**GET** `/items`

**Query Parameters:**
- `business_uuid` (optional) - Filter by business UUID
- `is_active` (optional) - Filter by active status (true/false)

**Example:** `/items?business_uuid=8c5e9f3b-2d4e-5f6a-0b9c-8d7e6f5a4b3c&is_active=true`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
      "business_uuid": "8c5e9f3b-2d4e-5f6a-0b9c-8d7e6f5a4b3c",
      "name": "Premium Widget",
      "sku": "WIDGET-001",
      "description": "High-quality widget for all your needs",
      "base_price": "99.99",
      "is_active": true,
      "created_at": "2025-12-04T10:00:00.000000Z",
      "updated_at": "2025-12-04T10:00:00.000000Z",
      "taxes": [
        {
          "id": 1,
          "uuid": "6a3c7b1d-4e6f-7a8b-2c0d-9e1f8a7b6c5d",
          "item_uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
          "name": "VAT",
          "rate": "10.00",
          "created_at": "2025-12-04T10:00:00.000000Z",
          "updated_at": "2025-12-04T10:00:00.000000Z"
        }
      ],
      "discounts": [
        {
          "id": 1,
          "uuid": "5a2b6c0d-3e7f-8a9b-1c2d-0e3f9a8b7c6d",
          "item_uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
          "type": "percentage",
          "value": "15.00",
          "start_date": "2025-12-01",
          "end_date": "2025-12-31",
          "created_at": "2025-12-04T10:00:00.000000Z",
          "updated_at": "2025-12-04T10:00:00.000000Z"
        }
      ]
    }
  ]
}
```

### Create Item
**POST** `/items`

**Request Body:**
```json
{
  "business_uuid": "8c5e9f3b-2d4e-5f6a-0b9c-8d7e6f5a4b3c",
  "name": "Premium Widget",
  "sku": "WIDGET-001",
  "description": "High-quality widget for all your needs",
  "base_price": 99.99,
  "is_active": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
    "business_uuid": "8c5e9f3b-2d4e-5f6a-0b9c-8d7e6f5a4b3c",
    "name": "Premium Widget",
    "sku": "WIDGET-001",
    "description": "High-quality widget for all your needs",
    "base_price": "99.99",
    "is_active": true,
    "created_at": "2025-12-04T10:00:00.000000Z",
    "updated_at": "2025-12-04T10:00:00.000000Z",
    "taxes": [],
    "discounts": []
  }
}
```

### Get Single Item
**GET** `/items/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
    "business_uuid": "8c5e9f3b-2d4e-5f6a-0b9c-8d7e6f5a4b3c",
    "name": "Premium Widget",
    "sku": "WIDGET-001",
    "description": "High-quality widget for all your needs",
    "base_price": "99.99",
    "is_active": true,
    "created_at": "2025-12-04T10:00:00.000000Z",
    "updated_at": "2025-12-04T10:00:00.000000Z",
    "taxes": [],
    "discounts": []
  }
}
```

### Update Item
**PUT/PATCH** `/items/{id}`

**Request Body:**
```json
{
  "name": "Updated Widget Name",
  "base_price": 89.99
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
    "business_uuid": "8c5e9f3b-2d4e-5f6a-0b9c-8d7e6f5a4b3c",
    "name": "Updated Widget Name",
    "sku": "WIDGET-001",
    "description": "High-quality widget for all your needs",
    "base_price": "89.99",
    "is_active": true,
    "created_at": "2025-12-04T10:00:00.000000Z",
    "updated_at": "2025-12-04T10:15:00.000000Z",
    "taxes": [],
    "discounts": []
  }
}
```

### Delete Item
**DELETE** `/items/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Item deleted successfully"
  }
}
```

---

## Item Tax Endpoints

### Get All Item Taxes
**GET** `/item-taxes`

**Query Parameters:**
- `item_uuid` (optional) - Filter by item UUID

**Example:** `/item-taxes?item_uuid=7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "uuid": "6a3c7b1d-4e6f-7a8b-2c0d-9e1f8a7b6c5d",
      "item_uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
      "name": "VAT",
      "rate": "10.00",
      "created_at": "2025-12-04T10:00:00.000000Z",
      "updated_at": "2025-12-04T10:00:00.000000Z"
    }
  ]
}
```

### Create Item Tax
**POST** `/item-taxes`

**Request Body:**
```json
{
  "item_uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
  "name": "VAT",
  "rate": 10.00
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "6a3c7b1d-4e6f-7a8b-2c0d-9e1f8a7b6c5d",
    "item_uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
    "name": "VAT",
    "rate": "10.00",
    "created_at": "2025-12-04T10:00:00.000000Z",
    "updated_at": "2025-12-04T10:00:00.000000Z"
  }
}
```

### Get Single Item Tax
**GET** `/item-taxes/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "6a3c7b1d-4e6f-7a8b-2c0d-9e1f8a7b6c5d",
    "item_uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
    "name": "VAT",
    "rate": "10.00",
    "created_at": "2025-12-04T10:00:00.000000Z",
    "updated_at": "2025-12-04T10:00:00.000000Z"
  }
}
```

### Update Item Tax
**PUT/PATCH** `/item-taxes/{id}`

**Request Body:**
```json
{
  "rate": 12.50
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "6a3c7b1d-4e6f-7a8b-2c0d-9e1f8a7b6c5d",
    "item_uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
    "name": "VAT",
    "rate": "12.50",
    "created_at": "2025-12-04T10:00:00.000000Z",
    "updated_at": "2025-12-04T10:15:00.000000Z"
  }
}
```

### Delete Item Tax
**DELETE** `/item-taxes/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Tax deleted successfully"
  }
}
```

---

## Item Discount Endpoints

### Get All Item Discounts
**GET** `/item-discounts`

**Query Parameters:**
- `item_uuid` (optional) - Filter by item UUID

**Example:** `/item-discounts?item_uuid=7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "uuid": "5a2b6c0d-3e7f-8a9b-1c2d-0e3f9a8b7c6d",
      "item_uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
      "type": "percentage",
      "value": "15.00",
      "start_date": "2025-12-01",
      "end_date": "2025-12-31",
      "created_at": "2025-12-04T10:00:00.000000Z",
      "updated_at": "2025-12-04T10:00:00.000000Z"
    }
  ]
}
```

### Create Item Discount
**POST** `/item-discounts`

**Request Body:**
```json
{
  "item_uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
  "type": "percentage",
  "value": 15.00,
  "start_date": "2025-12-01",
  "end_date": "2025-12-31"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "5a2b6c0d-3e7f-8a9b-1c2d-0e3f9a8b7c6d",
    "item_uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
    "type": "percentage",
    "value": "15.00",
    "start_date": "2025-12-01",
    "end_date": "2025-12-31",
    "created_at": "2025-12-04T10:00:00.000000Z",
    "updated_at": "2025-12-04T10:00:00.000000Z"
  }
}
```

### Get Single Item Discount
**GET** `/item-discounts/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "5a2b6c0d-3e7f-8a9b-1c2d-0e3f9a8b7c6d",
    "item_uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
    "type": "percentage",
    "value": "15.00",
    "start_date": "2025-12-01",
    "end_date": "2025-12-31",
    "created_at": "2025-12-04T10:00:00.000000Z",
    "updated_at": "2025-12-04T10:00:00.000000Z"
  }
}
```

### Update Item Discount
**PUT/PATCH** `/item-discounts/{id}`

**Request Body:**
```json
{
  "value": 20.00
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "5a2b6c0d-3e7f-8a9b-1c2d-0e3f9a8b7c6d",
    "item_uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
    "type": "percentage",
    "value": "20.00",
    "start_date": "2025-12-01",
    "end_date": "2025-12-31",
    "created_at": "2025-12-04T10:00:00.000000Z",
    "updated_at": "2025-12-04T10:15:00.000000Z"
  }
}
```

### Delete Item Discount
**DELETE** `/item-discounts/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Discount deleted successfully"
  }
}
```

---

## Transaction Endpoints

### Get All Transactions
**GET** `/transactions`

**Query Parameters:**
- `business_uuid` (optional) - Filter by business UUID
- `status` (optional) - Filter by status (pending, paid, cancelled)

**Example:** `/transactions?business_uuid=8c5e9f3b-2d4e-5f6a-0b9c-8d7e6f5a4b3c&status=paid`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "uuid": "4a1b5c9d-2e6f-7a8b-0c9d-3e4f8a7b6c5d",
      "business_uuid": "8c5e9f3b-2d4e-5f6a-0b9c-8d7e6f5a4b3c",
      "customer_name": "Jane Smith",
      "total_amount": "199.98",
      "tax_amount": "19.99",
      "discount_amount": "30.00",
      "final_amount": "189.97",
      "status": "paid",
      "created_at": "2025-12-04T10:00:00.000000Z",
      "updated_at": "2025-12-04T10:30:00.000000Z"
    }
  ]
}
```

### Create Transaction
**POST** `/transactions`

**Request Body:**
```json
{
  "business_uuid": "8c5e9f3b-2d4e-5f6a-0b9c-8d7e6f5a4b3c",
  "customer_name": "Jane Smith",
  "total_amount": 199.98,
  "tax_amount": 19.99,
  "discount_amount": 30.00,
  "final_amount": 189.97,
  "status": "pending"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "4a1b5c9d-2e6f-7a8b-0c9d-3e4f8a7b6c5d",
    "business_uuid": "8c5e9f3b-2d4e-5f6a-0b9c-8d7e6f5a4b3c",
    "customer_name": "Jane Smith",
    "total_amount": "199.98",
    "tax_amount": "19.99",
    "discount_amount": "30.00",
    "final_amount": "189.97",
    "status": "pending",
    "created_at": "2025-12-04T10:00:00.000000Z",
    "updated_at": "2025-12-04T10:00:00.000000Z"
  }
}
```

### Get Single Transaction
**GET** `/transactions/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "4a1b5c9d-2e6f-7a8b-0c9d-3e4f8a7b6c5d",
    "business_uuid": "8c5e9f3b-2d4e-5f6a-0b9c-8d7e6f5a4b3c",
    "customer_name": "Jane Smith",
    "total_amount": "199.98",
    "tax_amount": "19.99",
    "discount_amount": "30.00",
    "final_amount": "189.97",
    "status": "paid",
    "created_at": "2025-12-04T10:00:00.000000Z",
    "updated_at": "2025-12-04T10:30:00.000000Z"
  }
}
```

### Update Transaction
**PUT/PATCH** `/transactions/{id}`

**Request Body:**
```json
{
  "status": "paid"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "4a1b5c9d-2e6f-7a8b-0c9d-3e4f8a7b6c5d",
    "business_uuid": "8c5e9f3b-2d4e-5f6a-0b9c-8d7e6f5a4b3c",
    "customer_name": "Jane Smith",
    "total_amount": "199.98",
    "tax_amount": "19.99",
    "discount_amount": "30.00",
    "final_amount": "189.97",
    "status": "paid",
    "created_at": "2025-12-04T10:00:00.000000Z",
    "updated_at": "2025-12-04T10:30:00.000000Z"
  }
}
```

### Delete Transaction
**DELETE** `/transactions/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Transaction deleted successfully"
  }
}
```

---

## Transaction Item Endpoints

### Get All Transaction Items
**GET** `/transaction-items`

**Query Parameters:**
- `transaction_uuid` (optional) - Filter by transaction UUID
- `item_uuid` (optional) - Filter by item UUID

**Example:** `/transaction-items?transaction_uuid=4a1b5c9d-2e6f-7a8b-0c9d-3e4f8a7b6c5d`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "uuid": "3a0b4c8d-1e5f-6a7b-9c0d-2e3f7a6b5c4d",
      "transaction_uuid": "4a1b5c9d-2e6f-7a8b-0c9d-3e4f8a7b6c5d",
      "item_uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
      "quantity": 2,
      "base_price": "99.99",
      "discount_amount": "15.00",
      "tax_amount": "9.99",
      "total_price": "194.97",
      "created_at": "2025-12-04T10:00:00.000000Z",
      "updated_at": "2025-12-04T10:00:00.000000Z"
    }
  ]
}
```

### Create Transaction Item
**POST** `/transaction-items`

**Request Body:**
```json
{
  "transaction_uuid": "4a1b5c9d-2e6f-7a8b-0c9d-3e4f8a7b6c5d",
  "item_uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
  "quantity": 2,
  "base_price": 99.99,
  "discount_amount": 15.00,
  "tax_amount": 9.99,
  "total_price": 194.97
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "3a0b4c8d-1e5f-6a7b-9c0d-2e3f7a6b5c4d",
    "transaction_uuid": "4a1b5c9d-2e6f-7a8b-0c9d-3e4f8a7b6c5d",
    "item_uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
    "quantity": 2,
    "base_price": "99.99",
    "discount_amount": "15.00",
    "tax_amount": "9.99",
    "total_price": "194.97",
    "created_at": "2025-12-04T10:00:00.000000Z",
    "updated_at": "2025-12-04T10:00:00.000000Z"
  }
}
```

### Get Single Transaction Item
**GET** `/transaction-items/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "3a0b4c8d-1e5f-6a7b-9c0d-2e3f7a6b5c4d",
    "transaction_uuid": "4a1b5c9d-2e6f-7a8b-0c9d-3e4f8a7b6c5d",
    "item_uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
    "quantity": 2,
    "base_price": "99.99",
    "discount_amount": "15.00",
    "tax_amount": "9.99",
    "total_price": "194.97",
    "created_at": "2025-12-04T10:00:00.000000Z",
    "updated_at": "2025-12-04T10:00:00.000000Z"
  }
}
```

### Update Transaction Item
**PUT/PATCH** `/transaction-items/{id}`

**Request Body:**
```json
{
  "quantity": 3,
  "total_price": 284.96
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "3a0b4c8d-1e5f-6a7b-9c0d-2e3f7a6b5c4d",
    "transaction_uuid": "4a1b5c9d-2e6f-7a8b-0c9d-3e4f8a7b6c5d",
    "item_uuid": "7b4d8a2c-3e5f-6a7b-1c9d-0e8f7a6b5c4d",
    "quantity": 3,
    "base_price": "99.99",
    "discount_amount": "15.00",
    "tax_amount": "9.99",
    "total_price": "284.96",
    "created_at": "2025-12-04T10:00:00.000000Z",
    "updated_at": "2025-12-04T10:15:00.000000Z"
  }
}
```

### Delete Transaction Item
**DELETE** `/transaction-items/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Transaction item deleted successfully"
  }
}
```

---

## Payment Endpoints

### Get All Payments
**GET** `/payments`

**Query Parameters:**
- `transaction_uuid` (optional) - Filter by transaction UUID
- `method` (optional) - Filter by payment method

**Example:** `/payments?transaction_uuid=4a1b5c9d-2e6f-7a8b-0c9d-3e4f8a7b6c5d&method=credit_card`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "uuid": "2a9b3c7d-0e4f-5a6b-8c9d-1e2f6a5b4c3d",
      "transaction_uuid": "4a1b5c9d-2e6f-7a8b-0c9d-3e4f8a7b6c5d",
      "method": "credit_card",
      "amount": "189.97",
      "paid_at": "2025-12-04T10:30:00.000000Z",
      "created_at": "2025-12-04T10:30:00.000000Z",
      "updated_at": "2025-12-04T10:30:00.000000Z"
    }
  ]
}
```

### Create Payment
**POST** `/payments`

**Request Body:**
```json
{
  "transaction_uuid": "4a1b5c9d-2e6f-7a8b-0c9d-3e4f8a7b6c5d",
  "method": "credit_card",
  "amount": 189.97,
  "paid_at": "2025-12-04T10:30:00"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "2a9b3c7d-0e4f-5a6b-8c9d-1e2f6a5b4c3d",
    "transaction_uuid": "4a1b5c9d-2e6f-7a8b-0c9d-3e4f8a7b6c5d",
    "method": "credit_card",
    "amount": "189.97",
    "paid_at": "2025-12-04T10:30:00.000000Z",
    "created_at": "2025-12-04T10:30:00.000000Z",
    "updated_at": "2025-12-04T10:30:00.000000Z"
  }
}
```

### Get Single Payment
**GET** `/payments/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "2a9b3c7d-0e4f-5a6b-8c9d-1e2f6a5b4c3d",
    "transaction_uuid": "4a1b5c9d-2e6f-7a8b-0c9d-3e4f8a7b6c5d",
    "method": "credit_card",
    "amount": "189.97",
    "paid_at": "2025-12-04T10:30:00.000000Z",
    "created_at": "2025-12-04T10:30:00.000000Z",
    "updated_at": "2025-12-04T10:30:00.000000Z"
  }
}
```

### Update Payment
**PUT/PATCH** `/payments/{id}`

**Request Body:**
```json
{
  "method": "cash",
  "amount": 189.97
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "2a9b3c7d-0e4f-5a6b-8c9d-1e2f6a5b4c3d",
    "transaction_uuid": "4a1b5c9d-2e6f-7a8b-0c9d-3e4f8a7b6c5d",
    "method": "cash",
    "amount": "189.97",
    "paid_at": "2025-12-04T10:30:00.000000Z",
    "created_at": "2025-12-04T10:30:00.000000Z",
    "updated_at": "2025-12-04T10:45:00.000000Z"
  }
}
```

### Delete Payment
**DELETE** `/payments/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Payment deleted successfully"
  }
}
```

---

## Error Responses

### Validation Error (422)
```json
{
  "success": false,
  "data": {
    "errors": {
      "email": [
        "The email field is required."
      ],
      "password": [
        "The password must be at least 8 characters."
      ]
    }
  }
}
```

### Not Found (404)
```json
{
  "success": false,
  "data": {
    "message": "Business not found"
  }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "data": {
    "message": "Unauthenticated."
  }
}
```

### Server Error (500)
```json
{
  "success": false,
  "data": {
    "message": "Server Error"
  }
}
```

---

## Notes

1. **All endpoints require authentication** except the auth endpoints (register, login)
2. **UUID fields** are used for all relationships instead of numeric IDs
3. **User-scoped data**: Users can only access businesses they own, and all related data is filtered accordingly
4. **Timestamps**: All timestamps are in ISO 8601 format (UTC)
5. **Decimal values**: All monetary values are returned as strings with 2 decimal places
6. **Filtering**: Most index endpoints support filtering via query parameters
