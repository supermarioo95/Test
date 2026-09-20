# FantaCity

PWA (Progressive Web App) per gestire le iscrizioni a una lega di fantacalcio, installabile su iPhone dalla schermata Home.

## Funzionalità

- Aggiungere iscritti con nome squadra, responsabile, contatti, quota e data di iscrizione
- Segnare la quota come pagata/da pagare con un tocco
- Riepilogo: iscritti su posti totali, quota raccolta, quota da riscuotere
- Filtri: tutti, da pagare, pagati
- Impostazioni lega: nome, quota di iscrizione predefinita, posti totali
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
