# Casa Facile

PWA (Progressive Web App) per organizzare bollette e spese domestiche, installabile su iPhone dalla schermata Home.

## Funzionalità

- Aggiungere bollette/spese con nome, importo, categoria e scadenza
- Bollette ricorrenti: una volta segnate come pagate, la scadenza avanza automaticamente al mese successivo
- Riepilogo: totale da pagare, numero di bollette scadute, totale pagato nel mese corrente
- Filtri: tutte, da pagare, scadute, pagate
- Dati salvati in locale sul dispositivo (localStorage), nessun account richiesto
- Installabile come app su iOS (Safari → Condividi → Aggiungi a Home)

## Sviluppo

```bash
npm install
npm run dev
```

## Build di produzione

```bash
npm run build
npm run preview
```

## Installazione su iPhone

1. Apri l'app pubblicata in Safari su iPhone
2. Tocca il pulsante "Condividi"
3. Seleziona "Aggiungi alla schermata Home"

L'app funzionerà come una app nativa, a schermo intero e con icona propria.
