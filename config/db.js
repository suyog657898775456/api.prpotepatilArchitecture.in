const { Pool } = require("pg");
require("dotenv").config();

// Use the connection string from your .env file
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon's secure connection
  },
});

// Test connection
pool.on("connect", () => {
  console.log("✅ Connected to Neon PostgreSQL");
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
