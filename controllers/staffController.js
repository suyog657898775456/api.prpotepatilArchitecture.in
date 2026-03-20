const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// Get all staff - Updated to order by sequence
exports.getAllStaff = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM staff ORDER BY sequence_order ASC, id DESC",
    );
    const formattedData = result.rows.map((row) => ({
      ...row,
      // Prefix with your full URL if path exists, otherwise return local assets path
      image: row.image_path
        ? `http://localhost:5000/${row.image_path}`
        : "/assets/placeholder-user.jpg",
    }));
    res.status(200).json(formattedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reorder logic for Drag & Drop
exports.reorderStaff = async (req, res) => {
  const { sequence } = req.body;
  try {
    for (let item of sequence) {
      await db.query("UPDATE staff SET sequence_order = $1 WHERE id = $2", [
        item.sequence_order,
        item.id,
      ]);
    }
    res.status(200).json({ message: "Order updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ... keep addItem, updateItem, toggleFeatured, deleteStaff exactly as they were ...
// Add staff
exports.addStaff = async (req, res) => {
  const { name, designation, education, experience, isFeatured } = req.body;
  const imagePath = req.file ? req.file.path : null;

  try {
    const query = `
            INSERT INTO staff (name, designation, education, experience, image_path, is_featured) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const result = await db.query(query, [
      name,
      designation,
      education,
      experience,
      imagePath,
      isFeatured === "true",
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update staff
exports.updateStaff = async (req, res) => {
  const { id } = req.params;
  const { name, designation, education, experience, isFeatured } = req.body;
  const newImagePath = req.file ? req.file.path : null;

  try {
    if (newImagePath) {
      const query = `UPDATE staff SET name=$1, designation=$2, education=$3, experience=$4, image_path=$5, is_featured=$6 WHERE id=$7 RETURNING *`;
      const result = await db.query(query, [
        name,
        designation,
        education,
        experience,
        newImagePath,
        isFeatured === "true",
        id,
      ]);
      res.json(result.rows[0]);
    } else {
      const query = `UPDATE staff SET name=$1, designation=$2, education=$3, experience=$4, is_featured=$5 WHERE id=$6 RETURNING *`;
      const result = await db.query(query, [
        name,
        designation,
        education,
        experience,
        isFeatured === "true",
        id,
      ]);
      res.json(result.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle Featured
exports.toggleFeatured = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "UPDATE staff SET is_featured = NOT is_featured WHERE id = $1 RETURNING *",
      [id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete staff
exports.deleteStaff = async (req, res) => {
  const { id } = req.params;
  try {
    const fileData = await db.query(
      "SELECT image_path FROM staff WHERE id = $1",
      [id],
    );
    if (fileData.rows[0]?.image_path) {
      const fullPath = path.join(__dirname, "..", fileData.rows[0].image_path);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    await db.query("DELETE FROM staff WHERE id = $1", [id]);
    res.status(200).json({ message: "Staff deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
