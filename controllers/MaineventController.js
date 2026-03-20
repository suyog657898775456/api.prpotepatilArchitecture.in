const db = require("../config/db");

// Fetch events specifically for public display (e.g., only upcoming ones)
exports.getPublicEvents = async (req, res) => {
  try {
    // Example: Only fetch events that haven't happened yet
    const query = "SELECT * FROM events WHERE date >= CURRENT_DATE ORDER BY date ASC";
    const result = await db.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch a specific event by ID for a "Details" page
exports.getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM events WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};