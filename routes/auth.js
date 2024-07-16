const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
require('dotenv').config();

// GET request to render login form
router.get('/', (req, res) => {
    res.render('login/login', { title: 'Login' });
});

router.post('/',
    // Validate input using express-validator
    body('email').isEmail(),
    body('password').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            let user;

            if (email === "admin@gmail.com" && password === "admin") {
                // Generate JWT token for admin
                const token = jwt.sign({ userId: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
                // Set token as cookie (example)
                res.cookie('token', token, { httpOnly: true });
                // Redirect to home page or any other route upon successful login
                return res.redirect('/');
            } else {
                // Check if user exists in database
                user = await Employee.findOne({ where: { email } });
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                // Validate password
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }
                // Generate JWT token for regular users
                const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                // Set token as cookie (example)
                res.cookie('token', token, { httpOnly: true });
                // Redirect to home page or any other route upon successful login
                return res.redirect('/');
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    });
router.get('/logout', (req, res) => {
    res.clearCookie('token');
        res.render('login/login'); // Render logout page if needed
    });
    
// POST request to handle user logout
router.post('/logout', (req, res) => {
    // Clear the token from cookie (if using cookies)
    res.clearCookie('token');
    // Redirect to login page or any other desired route
    res.redirect('/login'); // Adjust the route as per your application setup
});




module.exports = router;
