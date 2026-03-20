const db = require("../config/db");

// Fetch the single contact record
exports.getContact = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM contact_info LIMIT 1");
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update the contact record
exports.updateContact = async (req, res) => {
  const { address, phone, email, social } = req.body;
  try {
    const query = `
            UPDATE contact_info 
            SET address = $1, phone = $2, email = $3, social = $4, updated_at = NOW()
            WHERE id = (SELECT id FROM contact_info LIMIT 1)
            RETURNING *`;
    const values = [address, phone, email, JSON.stringify(social)];
    const result = await db.query(query, values);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
