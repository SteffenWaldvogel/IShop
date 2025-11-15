# IShop
#Portfolio DHBW

##FrontEnd:
- Built with: HTML, CSS, JS
- Services: 
    - Shopfront to browse products, add them to cart
    - Shopping Cart: Manage Shopping cart (edit, delete products from cart), enter address, choose shipping, go to checkout (Paypal, Prepaid)
    - Communication: RET API Endpoints

##Backend:
- Built with: Node.js, Express
- Responsibilities: 
    - Serve API Endpoints for products, cart, shipping, checkout
    - Validate inputs, Communicate with Postgre, Redis
    - Provide a mock Paypal endpoint

##Database:
- Built with: PostgreSQL
- Tables: 
    - Products: id, productname, description, price, image_url, amount(stock)
    - Customers: id, firstname, lastname, email, address, address2, country, currency
    - Orders: id, customerid, totalamount, orderitems, createdat, status, shipping, trackingnumber
    - Orderitems: id, orderid, productid, quantity, unitprice

##Caching / Cart:
- Built with: Redis
- Key structure: cart:{sessionId} or cart:user:{userId}
- Value Content: field(productid), value(quantity), Example: cart:abc123 -> {"1": 2, "3": 1}

##Checkout:
- Built with: Mock Paypal, Prepaid(PO-Invoice to mail)
- Paypal is added but is using MockData to simulate the checkout

##Shipping:
- Express, Standard shipping Options
- Map Integration for the Address
- Updates once a trackingnumber is added

