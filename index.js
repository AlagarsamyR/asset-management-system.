// index.js

const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');

const app = express();
const cookieParser = require('cookie-parser');


// Middleware setup
app.use(express.json()); // Example middleware for JSON parsing
app.use(cookieParser());
const asyncDB = require('./async-db.js'); 

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files (CSS, images, etc.)
app.use(methodOverride('_method'));
app.use(bodyParser.json());

// View Engine (Pug)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// Routes
const indexRouter = require('./routes/index');
const employeeRoutes = require('./routes/employees');
const assetsRouter = require('./routes/assets');
const stockRouter = require('./routes/stock');
const assetIssuanceRouter = require('./routes/assetIssuance');
const assetHistoryRouter = require('./routes/assetHistory');
const authRouter = require('./routes/auth'); // New route for authentication

app.use('/', indexRouter);
app.use('/employees', employeeRoutes);
app.use('/assets', assetsRouter);
app.use('/stock', stockRouter);
app.use('/asset-issuance', assetIssuanceRouter);
app.use('/asset-history', assetHistoryRouter);
app.use('/login', authRouter); // Mount authentication route




// Server Port

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
