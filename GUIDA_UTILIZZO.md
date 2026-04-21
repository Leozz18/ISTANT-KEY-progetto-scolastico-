# INSTANT KEY - Guida all'Utilizzo

## 🎯 Panoramica

INSTANT KEY è una piattaforma completa di marketplace gaming digitale con:
- **Frontend**: Sito web responsive con design moderno
- **Backend**: API REST completa con database SQLite
- **Autenticazione**: Sistema di login/registrazione sicuro
- **E-commerce**: Carrello, checkout, gestione ordini
- **Admin**: Pannello di amministrazione completo

## 🚀 Avvio Rapido

### 1. Avvia il Backend
```bash
# Doppio click su:
start-backend.bat
```
Questo avvierà il server API su `http://localhost:3001`

### 2. Avvia il Frontend (in un'altra finestra)
```bash
# Doppio click su:
start-frontend.bat
```
Questo avvierà il sito web su `http://localhost:8000`

### 3. Test del Sistema (opzionale)
```bash
# Per verificare che tutto funzioni:
test-system.bat
```

## 👤 Come Utilizzare il Sistema

### Registrazione e Login
1. Vai su `http://localhost:8000`
2. Clicca su "Login" o "Registrati"
3. Crea un account o accedi
4. (Opzionale) Configura 2FA per maggiore sicurezza

### Navigazione del Catalogo
1. Dalla home page, esplora i giochi in evidenza
2. Usa la ricerca per trovare giochi specifici
3. Applica filtri per piattaforma, genere, prezzo
4. Clicca su un gioco per vedere i dettagli

### Acquisto di un Gioco
1. Dalla pagina prodotto, clicca "Aggiungi al Carrello"
2. Vai al carrello per rivedere gli articoli
3. Procedi al checkout
4. Inserisci i dati di pagamento e spedizione
5. Completa l'ordine
6. Nella cronologia ordini, clicca "Rivela Chiave" per ottenere il codice di attivazione

### Gestione Account
- **Dashboard Utente**: Visualizza profilo, ordini, wishlist
- **Cronologia Ordini**: Traccia tutti i tuoi acquisti
- **Wishlist**: Salva giochi preferiti
- **Supporto**: Invia ticket per assistenza

## 🔧 Account Admin

### Accesso Admin
- Email: `admin@instantkey.com`
- Password: `admin123` (cambiata automaticamente al primo avvio)

### Funzionalità Admin
1. **Dashboard**: Statistiche vendite, ordini recenti, metriche
2. **Gestione Prodotti**: Aggiungi, modifica, elimina giochi
3. **Gestione Ordini**: Visualizza e aggiorna stati ordini
4. **Supporto**: Gestisci ticket clienti
5. **Analisi**: Rapporti ricavi e performance

## 📊 API Endpoints Principali

### Autenticazione
```
POST /api/auth/register  - Registrazione
POST /api/auth/login     - Login
```

### Prodotti
```
GET /api/products        - Lista prodotti
GET /api/products/:id    - Dettagli prodotto
GET /api/products/search - Ricerca
```

### Carrello e Ordini
```
GET /api/orders/cart     - Visualizza carrello
POST /api/orders/cart    - Aggiungi al carrello
POST /api/orders/checkout - Checkout
GET /api/orders/history  - Cronologia ordini
```

### Admin
```
GET /api/admin/dashboard/stats - Statistiche
GET /api/admin/products        - Gestione prodotti
GET /api/admin/orders          - Gestione ordini
```

## 🗄️ Database

Il sistema utilizza SQLite con tabelle per:
- **users**: Utenti registrati
- **products**: Catalogo giochi
- **orders**: Ordini effettuati
- **cart_items**: Carrello acquisti
- **support_tickets**: Sistema supporto

I dati vengono inizializzati automaticamente con giochi di esempio.

## 🔒 Sicurezza

- Password hashate con bcrypt
- Autenticazione JWT
- Rate limiting per prevenire abusi
- Validazione input lato server
- Headers di sicurezza

## 🐛 Risoluzione Problemi

### Backend non si avvia
- Verifica che Node.js sia installato: `node --version`
- Installa dipendenze: `cd backend && npm install`
- Controlla che la porta 3001 sia libera

### Frontend non carica
- Verifica che Python sia installato: `python --version`
- Controlla che la porta 8000 sia libera
- Assicurati che il backend sia attivo

### Database errori
- Elimina il file `backend/database/instant_key.db`
- Riavvia il backend per ricreare il database

### Login non funziona
- Verifica email e password
- Controlla che il backend sia attivo
- Prova con l'account admin: admin@instantkey.com / admin123

## 📞 Supporto

Per problemi tecnici:
1. Controlla i log del backend nella console
2. Usa lo strumento di test: `test-system.bat`
3. Consulta la documentazione in `backend/README.md`
4. Apri un ticket nel sistema di supporto in-app

## 🎮 Demo Data

Il sistema include dati di esempio:
- **Giochi**: 20+ titoli di giochi popolari
- **Utenti**: Account admin e alcuni utenti di test
- **Ordini**: Esempi di ordini completati
- **Recensioni**: Valutazioni e commenti di esempio

## 🚀 Funzionalità Avanzate

- **2FA**: Autenticazione a due fattori
- **Wishlist**: Liste desideri con notifiche
- **Recensioni**: Sistema di recensioni verificate
- **Supporto**: Ticket system completo
- **Analisi**: Dashboard admin con metriche
- **API**: Endpoint REST completi per integrazioni

---

**Divertiti con INSTANT KEY! 🎮**