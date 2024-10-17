const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const counters = document.querySelectorAll('.count');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour gérer les données du formulaire
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/skinLensDB', { useNewUrlParser: true, useUnifiedTopology: true });
// Compteur
counters.forEach(counter => {
    counter.innerText = '0';
    const updateCounter = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;

        // Calculer la vitesse de comptage
        const increment = target / 100; // Change le diviseur pour ajuster la vitesse

        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(updateCounter, 20); // Change la durée pour ajuster la rapidité
        } else {
            counter.innerText = target;
        }
    };

    updateCounter();
});
// Modèle de données pour les utilisateurs
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    registrationDate: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Modèle de données pour les produits (gestion des stocks)
const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    stockQuantity: Number
});

const Product = mongoose.model('Product', productSchema);

// Modèle de données pour les transactions
const transactionSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    transactionDate: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Route pour inscrire un nouvel utilisateur
app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(200).send('Utilisateur enregistré avec succès');
    } catch (error) {
        res.status(500).send('Erreur lors de l\'inscription');
    }
});

// Route pour ajouter un produit (gestion des stocks)
app.post('/product', async (req, res) => {
    const newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        stockQuantity: req.body.stockQuantity
    });

    try {
        await newProduct.save();
        res.status(200).send('Produit ajouté avec succès');
    } catch (error) {
        res.status(500).send('Erreur lors de l\'ajout du produit');
    }
});

// Route pour effectuer une transaction (encaissement)
app.post('/transaction', async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        if (!user) {
            return res.status(404).send('Utilisateur non trouvé');
        }

        const newTransaction = new Transaction({
            userId: user._id,
            amount: req.body.amount
        });

        await newTransaction.save();
        res.status(200).send('Transaction enregistrée avec succès');
    } catch (error) {
        res.status(500).send('Erreur lors de la transaction');
    }
});

// Route pour obtenir les transactions d'un utilisateur
app.get('/transactions/:userId', async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.params.userId });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).send('Erreur lors de la récupération des transactions');
    }
});

// Route pour récupérer les informations des stocks (produits)
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).send('Erreur lors de la récupération des produits');
    }
});

// Route pour suivre les KPIs
app.get('/kpis', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const transactionCount = await Transaction.countDocuments();
        const totalRevenue = await Transaction.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);

        res.status(200).json({
            userCount: userCount,
            transactionCount: transactionCount,
            totalRevenue: totalRevenue[0].total
        });
    } catch (error) {
        res.status(500).send('Erreur lors de la récupération des KPIs');
    }
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
