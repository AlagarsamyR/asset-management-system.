const express = require('express');
const router = express.Router();
const { Sequelize } = require('sequelize');
const Asset = require('../models/Asset');
const { getTokenFromCookies } = require('../utils/authUtils');

// Route to display stock view
router.get('/', async (req, res) => {
    const token = getTokenFromCookies(req);

    if (!token) {
        return res.redirect('/login');
    }
    try {
        // Aggregate assets by branch
        const stock = await Asset.findAll({
            attributes: [
                'branch',
                [Sequelize.fn('SUM', Sequelize.col('quantity')), 'totalAssets'],
                [Sequelize.fn('SUM', Sequelize.literal('price * quantity')), 'totalValue']
            ],
            group: ['branch'],
            order: [['branch', 'ASC']]
        });

        // Calculate total assets and total value for all branches combined
        const totalAssetsAll = stock.reduce((acc, curr) => acc + parseInt(curr.getDataValue('totalAssets')), 0);
        const totalValueAll = stock.reduce((acc, curr) => acc + parseFloat(curr.getDataValue('totalValue')), 0);

        // Render the stock view template with stock data and totals
        res.render('stock/index', {
            stock,
            totalAssetsAll,
            totalValueAll
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Route to display stock details for a specific branch
router.get('/branch', async (req, res) => {
    const branch = req.query.branch;

    try {
        // Fetch assets for the specific branch
        const assets = await Asset.findAll({
            where: { branch }
        });

        // Calculate total value for the branch
        const totalValue = assets.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

        // Render the branch view template with assets and total value
        res.render('stock/branch', {
            branch,
            assets,
            totalValue
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
