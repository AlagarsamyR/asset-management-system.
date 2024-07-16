const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Asset = require('../models/Asset');
const Employee = require('../models/Employee');
const IssuedAsset = require('../models/IssuedAsset');
const AssetEvent = require('../models/AssetEvent');
const { getTokenFromCookies } = require('../utils/authUtils');

// Get all issued assets
router.get('/', async (req, res) => {
    const token = getTokenFromCookies(req);

    if (!token) {
        return res.redirect('/login');
    }
    try {
        const issuedAssets = await IssuedAsset.findAll({
            include: [
                { model: Asset },
                { model: Employee }
            ]
        });
        res.render('issuedAssets/index', { issuedAssets });
      
    
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


router.get('/issue', async (req, res) => {
    try {
        // Find all assets with remaining quantity
        const assets = await Asset.findAll({
            where: {
                quantity: {
                    [Op.gt]: 0
                }
            }
        });

        // Calculate remaining quantity for each asset
        for (let asset of assets) {
            // Calculate remaining quantity as available quantity - assigned quantity
            asset.remainingQuantity = asset.quantity - asset.assignedquantity;
        }

        // Filter out assets with remaining quantity > 0
        const assetsWithRemaining = assets.filter(asset => asset.remainingQuantity > 0);

        // Fetch all employees for the issuance form
        const employees = await Employee.findAll();

        // Render the issue form with assets and employees data
        res.render('issuedAssets/issue', {
            assets: assetsWithRemaining,
            employees: employees
        });
        // console.log(assetsWithRemaining);
        // console.log(employees);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});




// Issue an asset
router.post('/issue', async (req, res) => {
    try {
        const { assetId, employeeId, quantity, branch, notes } = req.body;
      

        // Find the asset by ID
        const asset = await Asset.findByPk(assetId);
        if (!asset) {
            throw new Error('Asset not found');
        }

        // Check if there are enough units available to issue
        if (quantity > asset.quantity - asset.assignedquantity) {
            throw new Error('Not enough units available to issue');
        }

        // Create a new IssuedAsset record
        const newIssuedAsset = await IssuedAsset.create({
            assetId,
            employeeId,
            quantity,
            branch,
            notes
        });

        // Update assignedquantity in Asset model
        asset.assignedquantity += parseInt(quantity);
        await asset.save();

        // Create AssetEvent for the issuance
        await AssetEvent.create({
            assetId,
            eventType: 'issued',
            eventDate: new Date(),
            employeeId,
            quantity,
            location: branch,
            notes
        });

        res.redirect('/asset-issuance');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// Show form to return an asset
router.get('/return/:id', async (req, res) => {
    try {
        const issuedAsset = await IssuedAsset.findByPk(req.params.id, {
            include: [
                { model: Asset },
                { model: Employee }
            ]
        });
        res.render('issuedAssets/return', { issuedAsset });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Return an asset
router.post('/return/:id', async (req, res) => {
    try {
        const { returnedDate, reasonForReturn, notes } = req.body;
        const issuedAssetId = req.params.id;

        // Find the issued asset to return
        const issuedAsset = await IssuedAsset.findByPk(issuedAssetId);
        if (!issuedAsset) {
            return res.status(404).send('Issued Asset not found');
        }

        // Update the IssuedAsset document to mark it as returned
        issuedAsset.returnedDate = returnedDate;
        issuedAsset.reasonForReturn = reasonForReturn;
        issuedAsset.notes = notes;
        issuedAsset.status = 'returned';
        await issuedAsset.save();

        // Find the corresponding asset and decrease its assigned quantity
        const asset = await Asset.findByPk(issuedAsset.assetId);
        if (!asset) {
            return res.status(404).send('Asset not found');
        }

        asset.assignedquantity -= issuedAsset.quantity;
        await asset.save();

        // Create an asset event for return
        await AssetEvent.create({
            assetId: issuedAsset.assetId,
            eventType: 'returned',
            eventDate: new Date(),
            employeeId: issuedAsset.employeeId,
            quantity: issuedAsset.quantity,
            branch: issuedAsset.branch,
            notes,
            reasonForReturn
        });

        res.redirect('/asset-issuance');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Show form to scrap an asset
router.get('/scrap/:id', async (req, res) => {
    try {
        const issuedAsset = await IssuedAsset.findByPk(req.params.id, {
            include: [
                { model: Asset },
                { model: Employee }
            ]
        });
        res.render('issuedAssets/scrap', { issuedAsset });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Scrap an asset
router.post('/scrap/:id', async (req, res) => {
    try {
        const { returnedDate, reasonForReturn, notes } = req.body;

        // Find the issued asset and update status
        const issuedAsset = await IssuedAsset.findByPk(req.params.id);
        if (!issuedAsset) {
            return res.status(404).send('Issued Asset not found');
        }

        await IssuedAsset.update({
            returnedDate,
            reasonForReturn,
            notes,
            status: 'scrapped'
        }, {
            where: { id: req.params.id }
        });

        // Update the quantity and assignedquantity in Asset model
        const asset = await Asset.findByPk(issuedAsset.assetId);
        if (!asset) {
            return res.status(404).send('Asset not found');
        }

        asset.quantity -= issuedAsset.quantity; // Reduce total quantity
        asset.assignedquantity -= issuedAsset.quantity; // Reduce assigned quantity
        await asset.save();

        // Create an asset event for scrap
        await AssetEvent.create({
            assetId: issuedAsset.assetId,
            eventType: 'scrapped',
            eventDate: new Date(),
            employeeId: issuedAsset.employeeId,
            quantity: issuedAsset.quantity,
            notes,
            reasonForReturn
        });

        res.redirect('/asset-issuance');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get asset history
router.get('/history/:id', async (req, res) => {
    try {
        const assetEvents = await AssetEvent.findAll({
            where: { assetId: req.params.id },
            include: [Asset, Employee]
        });

        const asset = await Asset.findByPk(req.params.id);

        res.render('issuedAssets/history', { asset, assetEvents });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
