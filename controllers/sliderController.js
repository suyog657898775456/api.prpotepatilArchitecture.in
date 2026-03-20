const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// Get images sorted by sequence
exports.getSliderImages = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM home_slider ORDER BY sequence_order ASC, id ASC",
    );
    const formatted = result.rows.map((row) => ({
      id: row.id,
      name: row.image_name,
      url: `http://localhost:5000/${row.image_path}`,
    }));
    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// New function to update order
exports.reorderImages = async (req, res) => {
  const { sequence } = req.body;
  try {
    for (let item of sequence) {
      await db.query(
        "UPDATE home_slider SET sequence_order = $1 WHERE id = $2",
        [item.sequence_order, item.id],
      );
    }
    res.status(200).json({ message: "Order updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addImage = async (req, res) => {
  const { name } = req.body;
  const imagePath = req.file ? req.file.path : null;
  try {
    const result = await db.query(
      "INSERT INTO home_slider (image_name, image_path) VALUES ($1, $2) RETURNING *",
      [name, imagePath],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteImage = async (req, res) => {
  const { id } = req.params;
  try {
    const fileData = await db.query(
      "SELECT image_path FROM home_slider WHERE id = $1",
      [id],
    );
    if (fileData.rows[0]?.image_path) {
      const fullPath = path.join(__dirname, "..", fileData.rows[0].image_path);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    await db.query("DELETE FROM home_slider WHERE id = $1", [id]);
    res.status(200).json({ message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
