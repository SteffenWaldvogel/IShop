# IShop  
### DHBW Portfolio Project – Modern Distributed E-Commerce System

iShop is a lightweight e-commerce prototype built as part of the Distributed Systems module at DHBW.  
It demonstrates a modern service-oriented architecture with a static frontend, REST backend, Redis caching and a normalized PostgreSQL database.

---

## Features Overview

- Product catalog rendered dynamically
- Session-based shopping cart persisted in Redis
- Checkout flow with Mock PayPal and Prepaid payment
- Normalized PostgreSQL database for orders, customers, products and shipping/payment methods
- Planned order confirmation page with map, tracking and order details
- Clean separation between frontend, backend, caching and database layers

---

## Frontend

**Built with:** HTML, CSS, JavaScript

### Services

- **Shopfront**
  - Browse products
  - Add products to the cart

- **Shopping Cart**
  - View cart items
  - Edit product quantities
  - Remove items from the cart
  - Enter customer + address data
  - Select shipping method
  - Proceed to checkout (Mock PayPal or Prepaid)

- **Order Confirmation (Planned)**
  - Map rendering the shipping address
  - Display of all order details
  - Tracking number shown once assigned

- **Communication**
  - REST API calls to the backend:
    - Products  
    - Cart  
    - Checkout  
    - Shipping methods  

**Optional:** UI/UX prototyping using Figma.

---

## Backend

**Built with:** Node.js, Express

### Responsibilities

- Provide REST API endpoints for:
  - Products  
  - Cart  
  - Shipping methods  
  - Checkout  

- Validate incoming data  
- Communicate with **PostgreSQL** for persistent business entities  
- Communicate with **Redis** for shopping cart caching  
- Provide a **mock PayPal endpoint** to simulate checkout behavior

---

## Database Schema

A normalized PostgreSQL schema forms the persistent storage layer of iShop.  
The ER diagram visualizes all entities, their attributes and relationships.

### Entity-Relationship Diagram (ERD)

![iShop ERD](db-schema.png)

### Key Entities

- **products** – Catalog entries with name, description, price and stock  
- **picturelinks** – One or more image URLs per product  
- **customers** – Customer data (email is unique)  
- **customeraddress** – Multiple address types per customer (e.g. shipping, billing)  
- **orders** – Order header including totals, tracking number, payment/shipping method  
- **orderitems** – Line items of each order  
- **payment_methods** – PayPal mock, Prepaid, etc.  
- **shipping_methods** – Standard, Express, Premium (DB-driven configuration)  
- **order_statuses** – Order lifecycle states  

Foreign keys maintain referential integrity.  
All IDs are generated through PostgreSQL sequences.

---

## Caching & Shopping Cart

**Built with:** Redis

### Structure

- Key pattern:
  - `cart:{sessionId}`

- Value format:
  ```json
  {
    "1": 2,
    "3": 1
  }
