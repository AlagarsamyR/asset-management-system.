const { Sequelize } = require('sequelize');
const { Pool } = require('pg');
require('dotenv').config();

const db=require('./models/db');

// Initialize Sequelize
const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: 'postgres',
  logging: false // Disable logging
});

// Initialize PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.connect((err) => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected to PostgreSQL database');
    syncDatabase();
  }
});

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connection to PostgreSQL database has been established successfully.');
    
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
}

module.exports = sequelize;
