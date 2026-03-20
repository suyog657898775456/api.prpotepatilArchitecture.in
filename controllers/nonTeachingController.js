const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// Get all staff - Updated to order by sequence
exports.getAllStaff = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM non_teaching_staff ORDER BY sequence_order ASC, id DESC",
    );
    const formattedData = result.rows.map((row) => ({
      ...row,
      image: row.image_path
        ? `http://localhost:5000/${row.image_path}`
        : "/assets/user.jpg",
    }));
    res.status(200).json(formattedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add this new function for Drag & Drop
exports.reorderStaff = async (req, res) => {
  const { sequence } = req.body;
  try {
    for (let item of sequence) {
      await db.query(
        "UPDATE non_teaching_staff SET sequence_order = $1 WHERE id = $2",
        [item.sequence_order, item.id],
      );
    }
    res.status(200).json({ message: "Order updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addStaff = async (req, res) => {
  const { name, designation, education, experience, isFeatured } = req.body;
  const imagePath = req.file ? req.file.path : null;
  try {
    const query = `INSERT INTO non_teaching_staff (name, designation, education, experience, image_path, is_featured) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
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

exports.updateStaff = async (req, res) => {
  const { id } = req.params;
  const { name, designation, education, experience, isFeatured } = req.body;
  const newImagePath = req.file ? req.file.path : null;
  try {
    let query, values;
    if (newImagePath) {
      query = `UPDATE non_teaching_staff SET name=$1, designation=$2, education=$3, experience=$4, image_path=$5, is_featured=$6 WHERE id=$7 RETURNING *`;
      values = [
        name,
        designation,
        education,
        experience,
        newImagePath,
        isFeatured === "true",
        id,
      ];
    } else {
      query = `UPDATE non_teaching_staff SET name=$1, designation=$2, education=$3, experience=$4, is_featured=$5 WHERE id=$6 RETURNING *`;
      values = [
        name,
        designation,
        education,
        experience,
        isFeatured === "true",
        id,
      ];
    }
    const result = await db.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleFeatured = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "UPDATE non_teaching_staff SET is_featured = NOT is_featured WHERE id = $1 RETURNING *",
      [id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteStaff = async (req, res) => {
  const { id } = req.params;
  try {
    const fileData = await db.query(
      "SELECT image_path FROM non_teaching_staff WHERE id = $1",
      [id],
    );
    if (fileData.rows[0]?.image_path) {
      const fullPath = path.join(__dirname, "..", fileData.rows[0].image_path);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    await db.query("DELETE FROM non_teaching_staff WHERE id = $1", [id]);
    res.status(200).json({ message: "Staff deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
