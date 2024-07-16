// routes/assets.js
const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const {getTokenFromCookies} = require('../utils/authUtils');

// GET all assets
router.get('/', async (req, res) => {
    const token = getTokenFromCookies(req);

    if (!token) {
        return res.redirect('/login');
    }
    try {
        // Fetch all assets initially
        const assets = await Asset.findAll();

        // Render index view with fetched assets and pagination data
        res.render('assets/index', {
            assets,
            alert: req.query.alert // Pass alert message from query parameter
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET add new asset form
router.get('/add', (req, res) => {
    res.render('assets/add', { alert: req.query.alert || null });
});

// POST add new asset
router.post('/add', async (req, res) => {
    try {
        const { serialNumber, assetId, type, make, model, quantity, price, branch, description } = req.body;

        // Check if asset with the same serialNumber and assetId already exists
        const existingAsset = await Asset.findOne({ where: { serialNumber, assetId } });
        if (existingAsset) {
            return res.redirect('/assets/add?alert=Asset%20already%20exists'); // Redirect with alert
        }

        const newAsset = await Asset.create({ serialNumber, assetId, type, make, model, quantity, price, branch, description });
        res.redirect('/assets');
    } catch (err) {
        console.error(err);
        res.status(400).send('Invalid data or duplicate asset');
    }
});

router.get('/edit/:id', async (req, res) => {
    try {
        const assetId = req.params.id;
        console.log('Asset ID:', assetId); // Check if assetId is defined and correct
        const asset = await Asset.findByPk(assetId);
        if (!asset) {
            return res.status(404).send('Asset not found');
        }
        res.render('assets/edit', { asset, alert: req.query.alert });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// POST edit asset
router.post('/edit/:id', async (req, res) => {
    try {
        const { serialNumber, assetId, type, make, model, quantity, price, branch, description } = req.body;

        // Check if an asset with the same assetId already exists, excluding the current asset being edited
        const existingAsset = await Asset.findOne({ where: { assetId, id: { [Op.ne]: req.params.id } } });
        if (existingAsset) {
            return res.redirect(`/assets/edit/${req.params.id}?alert=Asset%20ID%20already%20exists`); // Redirect with alert
        }

        // Update the asset
        const updatedAsset = await Asset.update({ serialNumber, assetId, type, make, model, quantity, price, branch, description }, { where: { id: req.params.id }, returning: true, plain: true });
        if (!updatedAsset[1]) {
            return res.status(404).send('Asset not found'); // Handle case where asset to edit is not found
        }

        res.redirect('/assets');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// POST delete asset
router.post('/delete/:id', async (req, res) => {
    try {
        await Asset.destroy({ where: { id: req.params.id } });
        res.redirect('/assets');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
