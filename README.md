# IShop  
### DHBW Portfolio Project – Modern Distributed E-Commerce System

iShop is a lightweight e-commerce prototype built as part of the Distributed Systems module.  
It demonstrates a modern service-oriented architecture with a static frontend, REST backend, Redis caching and a normalized PostgreSQL database.

---

## Frontend

**Built with:** HTML, CSS, JavaScript

### Services

- **Shopfront**
  - Browse products
  - Add items to shopping cart

- **Shopping Cart**
  - Manage cart items (edit quantities, remove items)
  - Enter address and customer details
  - Select shipping method
  - Proceed to checkout (PayPal mock, Prepaid)

- **Communication**
  - REST API calls to the backend (products, cart, checkout, etc.)

**Optional:** UI/UX design using Figma

---

## Backend

**Built with:** Node.js, Express

### Responsibilities

- Provide REST API endpoints:
  - Products  
  - Cart  
  - Shipping methods  
  - Checkout

- Validate incoming data  
- Communicate with **PostgreSQL** (orders, customers, products)  
- Communicate with **Redis** (cart persistence)  
- Provide a **mock PayPal endpoint** to simulate checkout

---

## Database Schema

A normalized PostgreSQL schema forms the persistent storage layer of iShop.  
The ER diagram below visualizes all entities, attributes and relationships.

### Entity-Relationship Diagram (ERD)

![iShop ERD](db-schema.png)

### Key Entities

- **products** – Catalog entries with price, description and stock  
- **picturelinks** – Image references for products (1:n)  
- **customers** – Unique email-based customer identity  
- **customeraddress** – Multiple address types per customer  
- **orders** – Order header, timestamps, totals, tracking  
- **orderitems** – Line items for each order  
- **payment_methods** – Supported payment options  
- **shipping_methods** – Shipping tiers with code references  
- **order_statuses** – Order lifecycle states  

Foreign keys maintain referential integrity.  
All primary keys use auto-incrementing sequences.

---

## Caching & Shopping Cart

**Built with:** Redis

### Structure

- Key: `cart:{sessionId}` (guest user)  

- Value: JSON object  
  Example:

  ```json
  {
    "1": 2,
    "3": 1
  }
