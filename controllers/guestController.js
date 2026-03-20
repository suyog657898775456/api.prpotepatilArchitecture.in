const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// Get all guests - Sorted by sequence_order
exports.getGuests = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM eminent_guests ORDER BY sequence_order ASC, created_at DESC",
    );
    const formatted = result.rows.map((row) => ({
      ...row,
      image: row.image_path
        ? `http://localhost:5000/${row.image_path.replace(/\\/g, "/")}`
        : null,
    }));
    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reorder guests logic
exports.reorderGuests = async (req, res) => {
  const { sequence } = req.body;
  try {
    for (let item of sequence) {
      await db.query(
        "UPDATE eminent_guests SET sequence_order = $1 WHERE id = $2",
        [item.sequence_order, item.id],
      );
    }
    res.status(200).json({ message: "Order updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addGuest = async (req, res) => {
  const { name, designation } = req.body;
  const image_path = req.file ? req.file.path : null;
  try {
    const result = await db.query(
      "INSERT INTO eminent_guests (name, designation, image_path) VALUES ($1, $2, $3) RETURNING *",
      [name, designation, image_path],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateGuest = async (req, res) => {
  const { id } = req.params;
  const { name, designation, featured } = req.body;
  const image_path = req.file ? req.file.path : null;

  try {
    if (image_path) {
      const old = await db.query(
        "SELECT image_path FROM eminent_guests WHERE id=$1",
        [id],
      );
      if (old.rows[0]?.image_path && fs.existsSync(old.rows[0].image_path))
        fs.unlinkSync(old.rows[0].image_path);
      await db.query(
        "UPDATE eminent_guests SET name=$1, designation=$2, image_path=$3, featured=$4 WHERE id=$5",
        [name, designation, image_path, featured, id],
      );
    } else {
      await db.query(
        "UPDATE eminent_guests SET name=$1, designation=$2, featured=$3 WHERE id=$4",
        [name, designation, featured, id],
      );
    }
    res.status(200).json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteGuest = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await db.query(
      "SELECT image_path FROM eminent_guests WHERE id=$1",
      [id],
    );
    if (data.rows[0]?.image_path && fs.existsSync(data.rows[0].image_path))
      fs.unlinkSync(data.rows[0].image_path);
    await db.query("DELETE FROM eminent_guests WHERE id=$1", [id]);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
