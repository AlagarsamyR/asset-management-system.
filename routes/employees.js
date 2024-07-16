// routes/employeeRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const Employee = require('../models/Employee');
const { getTokenFromCookies } = require('../utils/authUtils');

// GET all employees with filter and search
router.get('/', async (req, res) => {

    const token = getTokenFromCookies(req);

    if (!token) {
        return res.redirect('/login');
    }
    try {
        let filter = {};
        if (req.query.isActive !== undefined && req.query.isActive !== '') {
            filter.isActive = req.query.isActive === 'true';
        }
        if (req.query.search) {
            filter[Op.or] = [
                { firstName: { [Op.iLike]: `%${req.query.search}%` } },
                { lastName: { [Op.iLike]: `%${req.query.search}%` } }
            ];
        }
        const employees = await Employee.findAll({ where: filter });
        res.render('employees/index', { employees });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET add employee form
router.get('/add', (req, res) => {
    res.render('employees/add');
});

// POST add new employee
router.post('/add', async (req, res) => {
    try {
        const { firstName, lastName, email, department, position, password, salary, branch, isAssetIssuer, dateJoined, dateTerminate, isActive } = req.body;
        
        const newEmployee = await Employee.create({
            firstName,
            lastName,
            email,
            department,
            position,
            password,
            salary,
            branch,
            isAssetIssuer: isAssetIssuer === 'true',
            dateJoined,
            dateTerminate,
            isActive: isActive === 'true'
        });
        
        res.redirect('/employees');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET edit employee form
router.get('/edit/:id', async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);
        res.render('employees/edit', { employee });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/edit/:id', async (req, res) => {
    try {
        const { firstName, lastName, email, department, position, salary, branch, isAssetIssuer, dateJoined, dateTerminate, isActive, newpassword } = req.body;

        // Find the employee by id
        let employee = await Employee.findByPk(req.params.id);

        // Update other fields
        employee.firstName = firstName;
        employee.lastName = lastName;
        employee.email = email;
        employee.department = department;
        employee.position = position;
        employee.salary = salary;
        employee.branch = branch;
        employee.isAssetIssuer = isAssetIssuer === 'true';
        employee.dateJoined = dateJoined;
        employee.dateTerminate = dateTerminate;
        employee.isActive = isActive === 'true';

        // Check if new password field is provided
        if (newpassword !== '') {
            employee.password = await bcrypt.hash(newpassword, 10); // Rehash the new password
        }

        // Save the updated employee
        await employee.save();

        res.redirect('/employees');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET delete employee by ID
router.get('/delete/:id', async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.redirect('/employees');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});



// POST delete asset
router.post('/delete/:id', async (req, res) => {
    try {
        await Employee.destroy({ where: { id: req.params.id } });
        res.redirect('/employees');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
module.exports = router;
