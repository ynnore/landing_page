const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware pour permettre les requêtes CORS (accès depuis ton front-end)
app.use(cors());

// Simuler des données dynamiques pour les compteurs
let data = {
  visitors: 1000,
  transactions: 500,
  conversions: 250,
  cancellations: 150,
  revenue: 20000
};

// Route pour obtenir les données des KPIs
app.get('/api/kpis', (req, res) => {
  res.json(data);
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur API KPIs en cours d'exécution sur le port ${port}`);
});
