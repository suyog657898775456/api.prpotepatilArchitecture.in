const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// Get all college news
exports.getAllCollegeNews = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM college_news ORDER BY sequence_order ASC, event_date DESC",
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new news item
exports.addCollegeNews = async (req, res) => {
  const { title, description, full_content, event_date, category, link } =
    req.body;
  const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : null;

  try {
    const result = await db.query(
      `INSERT INTO college_news (title, description, full_content, event_date, category, link, image_url) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, full_content, event_date, category, link, imageUrl],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update news item
exports.updateCollegeNews = async (req, res) => {
  const { id } = req.params;
  const { title, description, full_content, event_date, category, link } =
    req.body;
  const newImageUrl = req.file ? `/uploads/images/${req.file.filename}` : null;

  try {
    if (newImageUrl) {
      // Delete old image
      const oldData = await db.query(
        "SELECT image_url FROM college_news WHERE id=$1",
        [id],
      );
      if (oldData.rows[0]?.image_url) {
        const oldPath = path.join(__dirname, "..", oldData.rows[0].image_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      await db.query(
        `UPDATE college_news SET title=$1, description=$2, full_content=$3, event_date=$4, 
                 category=$5, link=$6, image_url=$7 WHERE id=$8`,
        [
          title,
          description,
          full_content,
          event_date,
          category,
          link,
          newImageUrl,
          id,
        ],
      );
    } else {
      await db.query(
        `UPDATE college_news SET title=$1, description=$2, full_content=$3, event_date=$4, 
                 category=$5, link=$6 WHERE id=$7`,
        [title, description, full_content, event_date, category, link, id],
      );
    }
    res.status(200).json({ message: "News updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete news item
exports.deleteCollegeNews = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await db.query(
      "SELECT image_url FROM college_news WHERE id=$1",
      [id],
    );
    if (data.rows[0]?.image_url) {
      const filePath = path.join(__dirname, "..", data.rows[0].image_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await db.query("DELETE FROM college_news WHERE id=$1", [id]);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Persist the new order after a drag-and-drop action
exports.reorderCollegeNews = async (req, res) => {
  const { sequence } = req.body; // Expects array: [{id: 1, sequence_order: 0}, ...]
  try {
    for (let item of sequence) {
      await db.query(
        "UPDATE college_news SET sequence_order = $1 WHERE id = $2",
        [item.sequence_order, item.id]
      );
    }
    res.status(200).json({ message: "Sequence updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};