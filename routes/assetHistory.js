// routes/assetHistory.js

const express = require('express');
const router = express.Router();
const AssetEvent = require('../models/AssetEvent');
const Asset = require('../models/Asset');
const Employee = require('../models/Employee');
const {getTokenFromCookies}= require('../utils/authUtils');


// Route to display all asset events
router.get('/', async (req, res) => {
    const token = getTokenFromCookies(req);

    if (!token) {
        return res.redirect('/login');
    }
    try {
        const assetEvents = await AssetEvent.findAll({
            include: [
                { model: Asset, as: 'asset' },
                { model: Employee, as: 'employee' }
            ],
            order: [['eventDate', 'DESC']]
        });

        if (!assetEvents || assetEvents.length === 0) {
            return res.status(404).send('No asset events found');
        }

        res.render('assetHistory/index', { assetEvents });
    } catch (err) {
        console.error("Error fetching asset events:", err); // Log error
        res.status(500).send('Server Error');
    }
});

// Route to display asset events for a specific employee
router.get('/employee/:employeeId', async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.employeeId);
        if (!employee) {
            return res.status(404).send('Employee not found');
        }

        const assetEvents = await AssetEvent.findAll({
            where: { employeeId: req.params.employeeId },
            include: [
                { model: Asset, as: 'asset' },
                { model: Employee, as: 'employee' }
            ],
            order: [['eventDate', 'DESC']]
        });

        console.log("Fetched asset events for employee:", assetEvents); // Log fetched events

        if (!assetEvents || assetEvents.length === 0) {
            return res.status(404).send('No asset events found for this employee');
        }

        res.render('assetHistory/employeeHistory', { employee, assetEvents });
    } catch (err) {
        console.error("Error fetching asset events for employee:", err); // Log error
        res.status(500).send('Server Error');
    }
});

module.exports = router;
