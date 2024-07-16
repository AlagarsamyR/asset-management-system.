const express = require('express');
const bcrypt = require('bcryptjs');
const {getTokenFromCookies} = require('../utils/authUtils');

const router = express.Router();

router.get('/', (req, res) => {
  const token = getTokenFromCookies(req);

    if (!token) {
        return res.redirect('/login');
    }
  res.render('index');
});

module.exports = router;
