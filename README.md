# IShop
# Portfolio DHBW

## FrontEnd:
- Built with: HTML, CSS, JS
- Services: 
    - Shopfront to browse products, add them to cart
    - Shopping Cart: Manage Shopping cart (edit, delete products from cart), enter address, choose shipping, go to checkout (Paypal, Prepaid)
    - Communication: REST API Endpoints
- Optional: Design with Figma

## Backend:
- Built with: Node.js, Express
- Responsibilities: 
    - Serve API Endpoints for products, cart, shipping, checkout
    - Validate inputs, Communicate with Postgre, Redis
    - Provide a mock Paypal endpoint

## Database Schema

The iShop backend uses a normalized PostgreSQL schema.  
The ER diagram below visualizes all tables, their relationships and constraints.

### Entity-Relationship Diagram (ERD)

![iShop ERD](db-schema.png)

### Overview

Key components of the schema include:

- **products**: Product catalog with name, description, price and available stock.
- **picturelinks**: Image references for each product (1:n relation).
- **customers**: Customer identity with unique email.
- **customeraddress**: Multiple address types per customer (e.g. shipping, billing).
- **orders**: Order header including totals, timestamps, shipping and payment information.
- **orderitems**: Line items belonging to an order (n:1).
- **payment_methods**: Supported payment options such as PayPal or Prepaid.
- **shipping_methods**: Shipping tiers with codes used by the frontend.
- **order_statuses**: Representing the status lifecycle (Pending, Paid, Shipped, ...).

Foreign key constraints enforce referential integrity across the entire system.  
Auto-incrementing sequences are used for ID generation.


## Caching / Cart:
- Built with: Redis
- Key structure: cart:{sessionId} or cart:user:{userId}
- Value Content: field(productid), value(quantity), Example: cart:abc123 -> {"1": 2, "3": 1}

## Checkout:
- Built with: Mock Paypal, Prepaid(PO-Invoice to mail)
- Paypal is added but is using MockData to simulate the checkout

## Shipping:
- Express, Standard shipping Options
- Map Integration for the Address
- Updates once a trackingnumber is added

