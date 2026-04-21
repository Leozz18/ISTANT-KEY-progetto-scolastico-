# INSTANT KEY Marketplace Backend

Backend API per la piattaforma di gaming marketplace INSTANT KEY, costruito con Node.js, Express.js e SQLite.

## 🚀 Avvio Rapido

### Prerequisiti
- Node.js (versione 16 o superiore)
- npm o yarn

### Installazione
```bash
cd backend
npm install
```

### Avvio del Server
```bash
npm start
```

Il server sarà disponibile su `http://localhost:3001`

### Verifica Funzionamento
Visita `http://localhost:3001/api/health` per verificare che il server sia attivo.

## 📁 Struttura del Progetto

```
backend/
├── database/
│   └── init.js          # Inizializzazione database e schema
├── middleware/
│   └── auth.js          # Middleware autenticazione JWT
├── routes/
│   ├── auth.js          # Autenticazione (login, registrazione)
│   ├── users.js         # Gestione profilo utenti
│   ├── products.js      # Catalogo prodotti e ricerca
│   ├── orders.js        # Carrello, checkout, ordini
│   ├── admin.js         # Dashboard admin e gestione
│   └── support.js       # Sistema supporto clienti
├── server.js            # Server Express principale
└── package.json         # Dipendenze e configurazione
```

## 🔧 API Endpoints

### Autenticazione
- `POST /api/auth/register` - Registrazione utente
- `POST /api/auth/login` - Login utente
- `POST /api/auth/refresh` - Refresh token JWT

### Utenti
- `GET /api/users/profile` - Ottieni profilo utente
- `PUT /api/users/profile` - Aggiorna profilo utente
- `PUT /api/users/password` - Cambia password
- `POST /api/users/2fa/setup` - Configura 2FA
- `POST /api/users/2fa/verify` - Verifica 2FA

### Prodotti
- `GET /api/products` - Lista prodotti con filtri
- `GET /api/products/:id` - Dettagli prodotto
- `GET /api/products/search` - Ricerca prodotti
- `GET /api/products/categories` - Categorie disponibili

### Ordini
- `GET /api/orders/cart` - Visualizza carrello
- `POST /api/orders/cart` - Aggiungi al carrello
- `PUT /api/orders/cart/:itemId` - Aggiorna quantità carrello
- `DELETE /api/orders/cart/:itemId` - Rimuovi dal carrello
- `POST /api/orders/checkout` - Checkout ordine
- `GET /api/orders/history` - Cronologia ordini
- `GET /api/orders/:orderId` - Dettagli ordine
- `POST /api/orders/:orderId/items/:itemId/reveal` - Rivela chiave gioco

### Supporto
- `GET /api/support/tickets` - Lista ticket supporto
- `POST /api/support/tickets` - Crea nuovo ticket
- `GET /api/support/tickets/:id` - Dettagli ticket
- `POST /api/support/tickets/:id/messages` - Invia messaggio
- `PUT /api/support/tickets/:id/close` - Chiudi ticket
- `GET /api/support/faq` - FAQ
- `GET /api/support/faq/search` - Ricerca FAQ

### Admin (richiede ruolo admin)
- `GET /api/admin/dashboard/stats` - Statistiche dashboard
- `GET /api/admin/orders` - Gestione ordini
- `PUT /api/admin/orders/:id/status` - Aggiorna stato ordine
- `GET /api/admin/products` - Gestione prodotti
- `POST /api/admin/products` - Crea prodotto
- `PUT /api/admin/products/:id` - Aggiorna prodotto
- `DELETE /api/admin/products/:id` - Elimina prodotto
- `GET /api/admin/support/tickets` - Ticket supporto
- `GET /api/admin/analytics/revenue` - Analisi ricavi

## 🗄️ Database Schema

Il database SQLite include le seguenti tabelle principali:

- `users` - Utenti registrati
- `products` - Catalogo giochi
- `orders` - Ordini effettuati
- `order_items` - Elementi degli ordini
- `cart_items` - Carrello utenti
- `support_tickets` - Ticket supporto
- `ticket_messages` - Messaggi ticket
- `faq` - Domande frequenti
- `user_wishlists` - Liste desideri
- `product_reviews` - Recensioni prodotti

## 🔐 Sicurezza

- Autenticazione JWT con refresh tokens
- Password hashate con bcrypt
- Rate limiting per prevenire abusi
- Helmet per sicurezza HTTP headers
- Validazione input con express-validator
- CORS configurato per domini specifici

## 🧪 Testing

Per testare l'API puoi utilizzare:
- Postman o Insomnia per richieste HTTP
- Il frontend collegato per test end-to-end
- Script di test personalizzati

## 📝 Note di Sviluppo

- Il database viene inizializzato automaticamente con dati di esempio
- Le chiavi di gioco vengono generate casualmente al checkout
- Il sistema supporta pagamenti multipli (carta, PayPal, crypto)
- Include sistema di supporto clienti completo
- Dashboard admin per gestione completa

## 🚀 Deployment

Per il deployment in produzione:
1. Configurare variabili d'ambiente per database e segreti
2. Utilizzare un reverse proxy (nginx)
3. Configurare HTTPS
4. Monitorare logs e performance