# IShop  
### DHBW Portfolio Project – Moderne verteilte E‑Commerce-Komponente

iShop ist ein moderner, modular aufgebauter E‑Commerce‑Prototyp,
entwickelt im DHBW‑Modul **Verteilte Systeme**.  
Das Projekt demonstriert eine serviceorientierte Architektur mit klar getrennten Schichten:

- **Frontend (HTML, CSS, JavaScript)**  
  Klassisches clientseitiges Web-Frontend ohne SPA-Framework, mit  
  **Bootstrap 5** zur Gestaltung eines modernen, responsiven UI und  
  **Leaflet / OpenStreetMap** für die Kartenanzeige auf der Bestellbestätigungsseite.

- **REST‑Backend (Node.js + Express)**  
  Kapselt Geschäftslogik für Produkte, Warenkorb, Checkout und Bestellungen.

- **Redis‑Cache** für sessionbasierte Warenkörbe

- **PostgreSQL‑Datenbank** für persistente Geschäftsobjekte (Produkte, Kunden, Bestellungen, Stammdaten)

Ziel ist es, einen vollständigen Bestellprozess von der Produktauswahl bis zur Bestellbestätigung abzubilden
und dabei die typischen Schichten eines verteilten Systems (Frontend, Backend, Cache, Datenbank) praktisch
umzusetzen.

---

## Inhaltsverzeichnis

1. [Features](#features)  
2. [Architekturüberblick](#architekturüberblick)  
3. [Projektstruktur](#projektstruktur)  
4. [Voraussetzungen & verwendete Technologien](#voraussetzungen--verwendete-technologien)  
5. [PostgreSQL Setup](#postgresql-setup)  
6. [Redis Setup](#redis-setup)  
7. [Environment-Konfiguration](#environment-konfiguration)  
8. [Backend starten](#backend-starten)  
9. [Frontend starten](#frontend-starten)  
10. [Datenbankmodell](#datenbankmodell)  
11. [Pflicht-Stammdaten](#pflicht-stammdaten)  
12. [Redis & Caching](#redis--caching)  
13. [Software Design der Komponente](#software-design-der-komponente)  
14. [Designentscheidungen](#designentscheidungen)  
15. [Integration in die Gesamtsoftware](#integration-in-die-gesamtsoftware)  
16. [Abweichungen vom-acd](#abweichungen-vom-acd)  
17. [Future Work](#future-work)  

---

## Features

- Dynamischer Produktkatalog mit Daten aus PostgreSQL  
- Session-basierter Warenkorb in Redis  
- REST‑API für:
  - Produkte  
  - Warenkorb  
  - Versandarten  
  - Checkout  
  - Bestellungen (Order Details)
- Vollständiger Checkout‑Flow:
  - Kundendaten  
  - Rechnungs‑ & Lieferadresse  
  - Versandart (DB‑gesteuert)  
  - Zahlungsart (Vorkasse + PayPal‑Mock)
- Bootstrap‑UI für konsistente Formulare, Karten-Layout und Buttons  
- Vollständig normalisierte PostgreSQL‑Datenbank  
- Bestellbestätigungsseite mit:
  - Bestellstatus  
  - Trackingnummer  
  - Artikelübersicht  
  - Anzeige der Lieferadresse auf einer Live‑Karte (OpenStreetMap + Leaflet)

---

## Architekturüberblick

```text
Browser (Frontend: HTML/CSS/JS + Bootstrap)
        │
        │  REST (JSON)
        ▼
Backend (Node.js + Express)
        │
        ├─ PostgreSQL (persistente Daten: Produkte, Kunden, Bestellungen, Stammdaten)
        └─ Redis (Session-basierte Warenkörbe)
```

Das Frontend spricht ausschließlich über REST‑Endpunkte mit dem Backend.
Das Backend kapselt Geschäftslogik und Datenzugriffe und trennt kurzlebige
Session-Daten (Redis) von langlebigen, transaktionalen Geschäftsdaten (PostgreSQL).

---

## Projektstruktur

Die Projektstruktur ist in Frontend, Backend und Datenbankskripte getrennt:

```text
IShop/
├─ backend/
│  ├─ server.js                  # Einstiegspunkt des Backends
│  ├─ config/
│  │  ├─ db.js                   # PostgreSQL-Verbindung
│  │  ├─ redisClient.js          # Redis-Client
│  │  └─ paypalClient.js         # PayPal-Mock / Platzhalter
│  ├─ routes/
│  │  ├─ products.js             # Produkt-API
│  │  ├─ shipping.js             # Versandarten-API
│  │  ├─ cart.js                 # Warenkorb-API (Redis)
│  │  ├─ checkout.js             # Checkout-Logik
│  │  └─ orders.js               # Bestell-API
│  ├─ package.json
│  └─ package-lock.json
│
├─ frontend/
│  ├─ html/
│  │  ├─ index.html              # Startseite / Produktübersicht
│  │  ├─ checkout.html           # Checkout-Seite
│  │  └─ order-confirmation.html # Bestellbestätigung mit Karte
│  ├─ app.js                     # Produktlisting & Warenkorb-Logik
│  ├─ checkout.js                # Checkout-Flow im Frontend
│  ├─ checkout-session-cart.js   # Synchronisation Warenkorb (Frontend/Backend)
│  ├─ checkout-validation.js     # Formularvalidierungen
│  ├─ order-confirmation.js      # Darstellung der Bestelldaten & Karte
│  ├─ style.css                  # Zusätzliche Styles neben Bootstrap
│  └─ images/                    # Produktbilder / Assets
│
├─ db/
│  └─ init.sql                   # Datenbankschema und Grundstruktur
│
├─ db-schema.png                 # ER-Diagramm der PostgreSQL-Datenbank
└─ README.md
```

---

## Voraussetzungen & verwendete Technologien

### Grundvoraussetzungen

Für den vollständigen Betrieb werden benötigt:

- **Node.js** (empfohlen: aktuelle LTS‑Version)  
- **npm** (im Node‑Installer enthalten)  
- **PostgreSQL** inkl. **pgAdmin 4**  
- **Redis**  
- Unter Windows: **WSL** (z. B. Ubuntu) zur Installation von Redis  
- **Git** zum Klonen des Repositories  
- Optional: **Visual Studio Code** mit der *Live Server*‑Erweiterung

### Verwendete Technologien im Überblick

- **Frontend**
  - HTML5, CSS3, JavaScript (Vanilla)
  - **Bootstrap 5** (per CDN) für Layout, Grid, Formulare und Buttons
  - **Leaflet + OpenStreetMap** für die Kartenanzeige auf der Bestellbestätigungsseite

- **Backend**
  - **Node.js**
  - **Express** als Backend‑Framework zur Definition der REST‑Routen

- **Persistenz & Caching**
  - **PostgreSQL** als relationale, transaktionale Datenbank
  - **Redis** als In‑Memory‑Key‑Value‑Store für Warenkörbe

- **Kommunikation**
  - REST‑APIs (JSON) zwischen Frontend und Backend
  - Fetch‑API im Browser für HTTP‑Aufrufe

Diese Kombination erfüllt die Portfolio‑Vorgabe „mindestens ein Frontend‑Framework bzw. Template‑Engine (Bootstrap) und ein Backend‑Framework (Express) sowie eine Datenbankintegration“.

---

## PostgreSQL Setup

### 1. Datenbank anlegen

In psql oder im pgAdmin Query Tool:

```sql
CREATE DATABASE ishop;
```

### 2. Initialisierungsskript ausführen

1. In **pgAdmin 4** die Datenbank `ishop` auswählen  
2. Rechtsklick → **Query Tool**  
3. Datei `db/init.sql` öffnen  
4. Auf **Execute** (Blitzsymbol) klicken  

Das Skript legt alle benötigten Tabellen, Sequenzen, Primary Keys und Foreign Keys an.
Nach dem Ausführen sind die Tabellen strukturell korrekt, aber noch weitgehend leer.
Notwendige Stammdaten werden im Abschnitt [Pflicht-Stammdaten](#pflicht-stammdaten) beschrieben.

---

## Redis Setup

Unter Windows wird Redis typischerweise über WSL (Ubuntu) installiert.

In PowerShell (als Administrator):

```powershell
wsl --install -d Ubuntu
```

Nach dem Neustart:

```bash
sudo apt update
sudo apt install redis-server
redis-server
```

Redis lauscht standardmäßig auf Port `6379`.  
Das Backend verbindet sich über `REDIS_HOST` und `REDIS_PORT`, wie in der `.env` konfiguriert.

---

## Environment-Konfiguration

Im Ordner **`backend/`** muss eine Datei `.env` angelegt werden.  
Sie enthält die Verbindungsdaten für PostgreSQL, Redis und den PayPal‑Mock:

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

- `PGUSER` und `PGPASSWORD` müssen zu deiner PostgreSQL‑Installation passen  
- `PGDATABASE` muss auf die angelegte Datenbank (`ishop`) verweisen  

---

## Backend starten

Im Projektordner:

```bash
cd backend
npm install
node server.js
```

Wenn alles korrekt ist, erscheint in der Konsole z. B.:

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

Das Frontend ist als statische Webseite im Ordner `frontend/html/` aufgebaut, nutzt aber
JavaScript und REST‑Aufrufe für dynamische Inhalte.

### Variante A: VS Code Live Server

1. Ordner `frontend/html` in VS Code öffnen  
2. `index.html` öffnen  
3. Rechtsklick → **Open with Live Server**  
4. Der Browser öffnet die Shop‑Startseite (z. B. `http://127.0.0.1:5500/`)

### Variante B: Einfacher HTTP‑Server

Alternativ im Terminal:

```bash
cd frontend/html
npx http-server .
```

Dann im Browser die angegebene URL (z. B. `http://127.0.0.1:8080`) öffnen.

---

## Datenbankmodell

Die PostgreSQL‑Datenbank bildet das persistente Rückgrat von iShop.  
Das ER‑Diagramm (`db-schema.png`) zeigt alle Tabellen und Beziehungen.

![Datenbankschema](db-schema.png)

Wichtige Tabellen:

- `products`, `picturelinks` – Produkt- und Bilddaten  
- `customers`, `customeraddress` – Kunden und zugehörige Adressen  
- `orders`, `orderitems` – Bestellungen und einzelne Positionen  
- `payment_methods`, `shipping_methods`, `order_statuses` – Stammdaten für Zahlungen, Versand und Status

---

## Pflicht-Stammdaten

Nach dem Ausführen von `db/init.sql` sind die Tabellen angelegt, aber ohne inhaltliche Stammdaten.
Damit der Shop funktionsfähig ist, müssen mindestens folgende Datensätze eingefügt werden:

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

Der Warenkorb wird nicht in der relationalen Datenbank, sondern im **Redis‑Cache** gehalten.

**Key‑Pattern:**

```text
cart:{sessionId}
```

**Value‑Beispiel (JSON):**

```json
{
  "1": 2,
  "3": 1
}
```

- Schlüssel: Session‑ID des Nutzers  
- Wert: JSON‑Objekt (Produkt‑ID → Menge)  

Vorteile:

- sehr schnelle Zugriffe  
- keine unnötige Last auf der PostgreSQL‑Datenbank  
- Daten sind nur temporär (Session-basiert) und passen gut zu In‑Memory‑Speicher

---

## Software Design der Komponente

Die implementierte Komponente deckt im iShop‑Gesamtsystem den End‑to‑End‑Prozess  
**„Produktsuche → Warenkorb → Checkout → Bestellung → Bestellbestätigung“** ab.

### Verantwortungsbereich

- Produkte aus der Datenbank lesen und für das Frontend bereitstellen  
- Warenkörbe pro Session verwalten  
- Kundendaten und Adressen während des Checkouts erfassen und validieren  
- Bestellungen in PostgreSQL anlegen und mit Status, Positionen und Trackingnummer speichern  
- Bestelldaten inkl. Lieferadresse für die Bestätigungsseite bereitstellen

### Interne Schichten

Das Backend folgt einem einfachen, aber klar getrennten Schichtenmodell:

1. **HTTP‑/API‑Schicht (Express‑Routen)**  
   - Definiert Endpunkte unter `/api/products`, `/api/cart`, `/api/shipping`, `/api/checkout`, `/api/orders`  
   - Kümmert sich um Request‑Parsing und Response‑Format (JSON)

2. **Domänenlogik‑Schicht (Module pro Bereich)**  
   - Enthält Geschäftslogik für Produktabfragen, Warenkorb‑Updates, Checkout‑Validierung und Bestellanlage  
   - Führt Basisvalidierungen durch (Pflichtfelder, Wertebereiche etc.)

3. **Persistenzschicht (PostgreSQL & Redis)**  
   - `db.js` kapselt den Zugriff auf PostgreSQL  
   - `redisClient.js` verwaltet die Verbindung zu Redis  
   - Stellt Funktionen für CRUD‑Operationen auf Tabellen und Key‑Value‑Zugriffe bereit

### Typische Abläufe

**Beispiel: Produktübersicht**

1. Frontend lädt `index.html`  
2. `app.js` ruft `/api/products` auf  
3. Backend liest Produkte aus PostgreSQL  
4. Produkte werden im Frontend als Kartenliste angezeigt

**Beispiel: Checkout**

1. Nutzer befüllt Warenkorb (Frontend + Redis über `/api/cart`)  
2. Nutzer ruft `checkout.html` auf  
3. Frontend validiert Eingaben (`checkout-validation.js`)  
4. Frontend sendet Checkout‑Request an `/api/checkout`  
5. Backend legt einen Eintrag in `orders` und `orderitems` an  
6. Backend gibt eine Order‑ID zurück  
7. `order-confirmation.html` lädt Bestelldaten und zeigt sie inkl. Karte an

Dieses Design spiegelt den in der Vorlesung behandelten Schichten‑Ansatz wider und ist bewusst einfach gehalten,
um den Fokus auf Verständlichkeit und Architektur zu legen.

---

## Designentscheidungen

Die wichtigsten Designentscheidungen für diese Komponente sind:

- **Redis für Warenkorb**  
  Warenkorbdaten sind kurzlebig und nicht transaktional kritisch.  
  Redis erlaubt extrem schnelle Lese/Schreib‑Zugriffe und entlastet die relationale Datenbank.

- **PostgreSQL für Kernobjekte**  
  Bestellungen, Kunden und Produkte erfordern relationale Integrität, Joins und Transaktionen.  
  PostgreSQL bietet ACID‑Eigenschaften, SQL‑Unterstützung und ist in der Industrie weit verbreitet.

- **REST‑API als Kommunikationsstil**  
  REST mit JSON ist einfach zu implementieren, gut verständlich und reicht für CRUD‑basierte E‑Commerce‑Flows aus.  
  Event‑basierte Kommunikation (z. B. über Kafka) wäre für den Prototyp zu komplex.

- **Bootstrap 5 für das Frontend**  
  Bootstrap stellt Grid‑System, Formulare, Buttons und Responsive Design bereit.  
  Dadurch kann der Fokus auf Funktionalität und Architektur gelegt werden, ohne ein eigenes CSS‑Framework aufzubauen.

- **Vanilla JavaScript statt React/Vue**  
  Für den Prototyp ist ein Single‑Page‑Framework nicht zwingend erforderlich.  
  Die Logik bleibt überschaubar und die Integration mit schlichten REST‑Endpunkten ist direkt umsetzbar.

- **Single Backend‑Service statt Microservices**  
  Das ACD sieht mehrere Microservices vor.  
  Für den Prototyp wurde bewusst ein einzelner Service verwendet, um die Implementierung innerhalb des Prüfungszeitraums realisierbar zu halten, ohne die Architekturprinzipien zu verlieren.

---

## Integration in die Gesamtsoftware

Die hier beschriebene Komponente ist Teil des größeren iShop‑Systems, das im **Architecture Concept Document (ACD)** definiert ist.

### Rolle im Zielsystem (laut ACD)

Im Enterprise‑Zielbild des iShop wäre die Funktionalität dieser Komponente auf mehrere Services verteilt:

- **Product‑Service** – verwaltet Produkte und Katalogdaten  
- **Cart‑Service** – verwaltet Warenkörbe  
- **Order‑/Checkout‑Service** – verarbeitet Bestellungen und kommuniziert mit Payment‑Services  
- **Payment‑Service** – bindet externe Zahlungsanbieter an  
- **Recommendation‑Service** – liefert Produktvorschläge (optional)

Diese Services würden hinter einem **API‑Gateway** liegen und teilweise über einen **Event‑Bus** (z. B. Kafka) miteinander interagieren.

### Integration im Prototyp

Im Prototyp werden diese Rollen technisch in einem Backend zusammengefasst:

- Das Frontend spricht direkt mit dem Express‑Backend (kein Gateway)  
- Zahlungslogik wird über eine einfache Auswahl der Zahlungsart (+ PayPal‑Mock‑Konfiguration) simuliert  
- Es gibt keine echte Kommunikation mit externen Systemen, die Integration wird konzeptionell über Umgebungsvariablen und Mock‑Clients (z. B. `paypalClient.js`) vorbereitet

Damit zeigt der Prototyp, wie die Komponente in die Gesamtarchitektur eingebettet wäre, realisiert aber nur einen Ausschnitt der finalen Integrationslandschaft.

---

## Abweichungen vom ACD

Das ACD beschreibt eine **cloud‑native Microservice‑Architektur** mit:

- API‑Gateway als zentralem Einstiegspunkt  
- mehreren unabhängigen fachlichen Services (Product, Cart, Checkout/Order, Recommendation, etc.)  
- ereignisbasierter Kommunikation über einen **Event‑Bus** (z. B. Kafka)  
- **Kubernetes** als Orchestrierungsplattform  
- polyglotter Persistenz (PostgreSQL, MongoDB, Redis)  
- CI/CD‑Pipelines und automatisiertem Deployment

Der vorliegende Prototyp weicht davon bewusst in mehreren Punkten ab:

1. **Monolith statt Microservices**  
   Alle relevanten Funktionen (Produkte, Warenkorb, Checkout, Bestellungen) laufen in einem Express‑Backend.

2. **Kein API‑Gateway**  
   Das Frontend ruft die REST‑Endpunkte direkt auf.

3. **Kein Event‑Bus / Messaging**  
   Es werden keine Ereignisse über Kafka oder ähnliche Systeme verteilt.  
   Prozesse sind synchron per REST implementiert.

4. **Eine gemeinsame Datenbank statt strikt getrennter Datenhaltung pro Service**  
   Alle Entitäten liegen in einem gemeinsamen PostgreSQL‑Schema.

5. **Keine orchestrierte Cloud‑Infrastruktur**  
   Der Betrieb erfolgt lokal ohne Kubernetes‑Cluster, ohne Helm‑Charts und ohne automatisiertes Deployment.

6. **Eingeschränktes Monitoring und Logging**  
   Es gibt Konsolen‑Logs, aber keinen vollständigen Monitoring‑Stack wie im ACD beschrieben.

Diese Abweichungen sind **bewusst** gewählt, um innerhalb des Prüfungszeitraums einen lauffähigen,
verständlichen Prototyp zu liefern, der die wichtigsten Architekturprinzipien demonstriert, ohne die volle
Komplexität der Zielarchitektur umzusetzen.

---

## Future Work

Mögliche Erweiterungen und nächste Schritte:

- Einführung von **Benutzerkonten und Authentifizierung**  
- **Admin‑Oberfläche** für Produkt‑, Bestell‑ und Kundenverwaltung  
- Migration zu einem **SPA‑Frontend** (z. B. React) auf Basis der bestehenden REST‑Schnittstellen  
- Aufteilung des Backends in mehrere Microservices entsprechend dem ACD (Product, Cart, Order, Payment)  
- Einführung eines **API‑Gateways** und eines **Event‑Brokers** (z. B. Kafka)  
- Containerisierung (Docker) und Deployment in einem **Kubernetes‑Cluster**  
- Erweiterte Observability (z. B. Prometheus/Grafana, strukturierte Logs)  

Damit kann der hier implementierte Prototyp schrittweise in Richtung der im ACD
beschriebenen Zielarchitektur weiterentwickelt werden.
