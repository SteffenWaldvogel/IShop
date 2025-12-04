# IShop  
### DHBW Portfolio Project – Modern Distributed E-Commerce System

iShop ist ein moderner, modular aufgebauter E-Commerce-Prototyp, entwickelt im DHBW-Modul **Verteilte Systeme**.  
Das Projekt demonstriert eine serviceorientierte Architektur mit:

- **Static Frontend (HTML, CSS, JS)**
- **REST Backend (Node.js + Express)**
- **Redis Cache** für sessionbasierte Warenkörbe
- **PostgreSQL Datenbank** für persistente Geschäftsobjekte

Ziel ist es, einen vollständigen Bestellprozess mit klar getrennten Schichten (Frontend, Backend, Cache, Datenbank) abzubilden.

---

## Inhaltsverzeichnis

1. [Features](#features)  
2. [Architekturüberblick](#architekturüberblick)  
3. [Projektstruktur](#projektstruktur)  
4. [Voraussetzungen](#voraussetzungen)  
   - [Node.js](#nodejs)  
   - [PostgreSQL](#postgresql)  
   - [Redis unter Windows (WSL)](#redis-unter-windows-wsl)  
5. [PostgreSQL Setup](#postgresql-setup)  
6. [Redis Setup](#redis-setup)  
7. [Environment-Konfiguration](#environment-konfiguration)  
8. [Backend starten](#backend-starten)  
9. [Frontend starten](#frontend-starten)  
10. [Datenbankmodell](#datenbankmodell)  
11. [Pflicht-Stammdaten](#pflicht-stammdaten)  
12. [Redis & Caching](#redis--caching)  
13. [Future Work](#future-work)

---

## Features

- Dynamischer Produktkatalog  
- Session-basierter Warenkorb in Redis  
- REST-API für:
  - Produkte  
  - Warenkorb  
  - Versandarten  
  - Checkout  
  - Bestellungen (Order Details)
- Vollständiger Checkout-Flow:
  - Kundendaten  
  - Rechnungs- & Lieferadresse  
  - Versandart (DB-gesteuert)  
  - Zahlungsart (Prepaid & Mock PayPal)
- Vollständig normalisierte PostgreSQL-Datenbank
- Order Confirmation Page:
  - Bestellstatus  
  - Trackingnummer  
  - Artikelübersicht  
  - Lieferadresse per Live-Karte (OpenStreetMap + Leaflet)

---

## Architekturüberblick

```text
Frontend (Static HTML/CSS/JS)
        ↓ REST
Backend (Node.js + Express)
        ↓
PostgreSQL (Persistent Data)
Redis (Session Cache)
```

---

## Projektstruktur

```text
IShop/
├─ backend/
│  ├─ server.js
│  ├─ config/
│  │  ├─ db.js
│  │  ├─ redisClient.js
│  │  └─ paypalClient.js
│  ├─ routes/
│  │  ├─ products.js
│  │  ├─ shipping.js
│  │  ├─ cart.js
│  │  ├─ checkout.js
│  │  └─ orders.js
│  ├─ package.json
│  └─ package-lock.json
│
├─ frontend/
│  ├─ html/
│  │  ├─ index.html
│  │  ├─ checkout.html
│  │  └─ order-confirmation.html
│  ├─ app.js
│  ├─ checkout.js
│  ├─ checkout-session-cart.js
│  ├─ checkout-validation.js
│  ├─ order-confirmation.js
│  ├─ style.css
│  └─ images/
│
├─ db/
│  └─ init.sql
│
├─ db-schema.png
└─ README.md
```

---

## Voraussetzungen

Für den vollständigen Betrieb werden benötigt:

- **Node.js** (empfohlen: aktuelle LTS-Version)  
- **npm** (kommt mit Node.js)  
- **PostgreSQL** inkl. **pgAdmin4**  
- **Redis**  
- Unter Windows: **WSL** (z. B. Ubuntu) zur Installation von Redis  
- **Git** zum Klonen des Repositories  
- Optional: **Visual Studio Code** mit der *Live Server*-Erweiterung

### Node.js

1. Offizielle Webseite öffnen:  
   <https://nodejs.org/en/download>
2. Passenden Installer für dein System herunterladen  
3. Setup ausführen und bis zum Ende durchklicken  
4. In PowerShell prüfen:

```powershell
node -v
npm -v
```

Wenn beides eine Version ausgibt, ist Node.js korrekt installiert.

### PostgreSQL

1. Offizielle Webseite:  
   <https://www.postgresql.org/download/>
2. Installer für dein System herunterladen (inkl. pgAdmin4)  
3. Während der Installation:
   - Benutzername (z. B. `postgres`)  
   - Passwort merken → wird in `.env` benötigt
4. Nach der Installation pgAdmin4 starten, Verbindung testen

### Redis unter Windows (WSL)

Redis wird offiziell nicht nativ für Windows ausgeliefert.  
Empfohlen ist daher die Installation über das **Windows Subsystem for Linux (WSL)**.

1. PowerShell als Administrator öffnen:

```powershell
wsl --install -d Ubuntu
```

2. Nach Neustart in Ubuntu einen Benutzer anlegen  
3. Redis in Ubuntu installieren:

```bash
sudo apt update
sudo apt install redis-server
```

4. Redis starten:

```bash
redis-server
```

Redis lauscht dann standardmäßig auf `localhost:6379` (aus Sicht von WSL).  
Die Node.js-Anwendung verbindet sich über `REDIS_HOST` und `REDIS_PORT` mit diesem Dienst.

---

## PostgreSQL Setup

### 1. Datenbank erstellen

In psql oder im pgAdmin Query Tool:

```sql
CREATE DATABASE ishop;
```

### 2. Initialisierungsskript `db/init.sql` ausführen

1. In **pgAdmin4** die Datenbank `ishop` auswählen  
2. Rechtsklick → **Query Tool**  
3. Datei `db/init.sql` öffnen  
4. Auf **Execute** (Blitzsymbol) klicken  

Das Skript legt alle benötigten Tabellen, Sequenzen, Primary Keys und Foreign Keys an.  
Die Tabellen sind danach strukturell korrekt, aber noch ohne Standard-Stammdaten (siehe [Pflicht-Stammdaten](#pflicht-stammdaten)).

---

## Redis Setup

Unter Windows über WSL (Ubuntu):

```bash
sudo apt update
sudo apt install redis-server
redis-server
```

Redis muss laufen, bevor das Backend startet, damit der Warenkorb korrekt gespeichert werden kann.

---

## Environment-Konfiguration

Im Ordner **`backend/`** muss eine Datei `.env` angelegt werden.  
Sie enthält die Verbindungsdaten für PostgreSQL, Redis und den PayPal-Mock.

Beispiel:

```env
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=ishop

REDIS_HOST=localhost
REDIS_PORT=6379

PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_ENV=sandbox
```

- `PGUSER` und `PGPASSWORD` müssen zu deiner PostgreSQL-Installation passen  
- `PGDATABASE` muss auf die angelegte DB (`ishop`) zeigen  

---

## Backend starten

Im Projektordner:

```bash
cd backend
npm install
node server.js
```

Wenn alles korrekt ist, erscheint in der Konsole z. B.:

```text
Server bereit auf Port 3000
Mit Redis-Server verbunden
```

Das Backend ist dann erreichbar unter:

```text
http://localhost:3000
```

---

## Frontend starten

Das Frontend ist als **statische Webseite** im Ordner `frontend/html/` aufgebaut.

### Variante A: VS Code Live Server

1. Ordner `frontend/html` in VS Code öffnen  
2. `index.html` öffnen  
3. Rechtsklick → **Open with Live Server**  
4. Browser öffnet die Shop-Startseite (z. B. `http://127.0.0.1:5500/`)

### Variante B: Einfacher HTTP-Server

Alternativ im Terminal:

```bash
cd frontend/html
npx http-server .
```

Dann im Browser die angegebene URL (z. B. `http://127.0.0.1:8080`) öffnen.

---

## Datenbankmodell

Die PostgreSQL-Datenbank bildet das persistente Rückgrat von iShop.  
Das ER-Diagramm (`db-schema.png`) zeigt alle Tabellen und Beziehungen:

![ERD](db-schema.png)

Wichtige Tabellen:

- `products`, `picturelinks`  
- `customers`, `customeraddress`  
- `orders`, `orderitems`  
- `payment_methods`, `shipping_methods`, `order_statuses`

---

## Pflicht-Stammdaten

Nach dem Ausführen von `db/init.sql` sind die Tabellen zwar angelegt, aber leer.  
Damit der Shop funktionsfähig ist, müssen mindestens einige Stammdaten eingefügt werden.

Diese Inserts können z. B. im pgAdmin Query Tool ausgeführt werden:

```sql
-- Order Status
INSERT INTO public.order_statuses (name, description) VALUES
  ('Created',   'Order has been created'),
  ('Paid',      'Payment received'),
  ('Shipped',   'Order has been shipped'),
  ('Completed', 'Order completed'),
  ('Cancelled', 'Order cancelled');

-- Payment Methods
INSERT INTO public.payment_methods (name, description) VALUES
  ('payment-prepaid-banktransfer', 'Prepaid by bank transfer'),
  ('payment-paypal-mock',          'PayPal mock');

-- Shipping Methods
INSERT INTO public.shipping_methods (name, cost, description, code) VALUES
  ('Standard Shipping', 5.00, '3–5 business days', 'standard');
```

Optional können zusätzlich Beispielprodukte und Bilder eingefügt werden, um den Katalog zu füllen.

---

## Redis & Caching

Der Warenkorb wird nicht in der relationalen Datenbank, sondern im **Redis-Cache** gehalten.

**Key-Pattern:**

```text
cart:{sessionId}
```

**Value-Beispiel:**

```json
{
  "1": 2,
  "3": 1
}
```

- Key: Session-ID des Nutzers  
- Value: JSON-Objekt (Produkts-ID → Menge)  

Vorteile:

- Sehr schnelle Zugriffe  
- Keine unnötige Belastung der PostgreSQL-Datenbank  
- Daten sind nur temporär (Session-basiert)

---

## Future Work

Mögliche Erweiterungen:

- Benutzeraccounts und Authentifizierung  
- Admin-Panel zum Verwalten von Produkten, Bestellungen und Kunden  
- Modernes UI/UX-Redesign (z. B. mit TailwindCSS oder einem React-Frontend)  
- Erweiterter Bestell- und Tracking-Workflow  
- Integration weiterer Zahlungsanbieter (Stripe, Klarna, Sofort, etc.)

---
