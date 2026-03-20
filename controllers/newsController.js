const db = require("../config/db");
const fs = require("fs");
const path = require("path");

/**
 * Fetches all items ordered by their custom sequence first,
 * then by ID for consistent positioning.
 */
exports.getAllItems = async (req, res) => {
  try {
    // UPDATED: Order by sequence_order ASC so drag-and-drop
    // positions are respected on the frontend.
    const result = await db.query(
      "SELECT * FROM news_notices ORDER BY sequence_order ASC, id DESC",
    );

    const formatted = result.rows.map((row) => ({
      ...row,
      fileUrl:
        row.file_type === "link"
          ? row.link_url
          : `http://localhost:5000/${row.file_path}`,
      fileName: row.file_name,
      // Formatting date to YYYY-MM-DD for consistency
      uploadDate: row.upload_date
        ? row.upload_date.toISOString().split("T")[0]
        : null,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Adds a new item with default sequence logic.
 */
exports.addItem = async (req, res) => {
  const { title, type, fileType, linkUrl } = req.body;
  const file = req.file;

  let filePath = file ? file.path : null;
  let fileName = file
    ? file.originalname
    : fileType === "link"
      ? linkUrl
      : null;
  let fileSize = file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : "-";

  try {
    const query = `INSERT INTO news_notices (title, type, file_type, file_path, link_url, file_name, file_size) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const result = await db.query(query, [
      title,
      type,
      fileType,
      filePath,
      linkUrl,
      fileName,
      fileSize,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Deletes an item and removes its associated file from storage.
 */
exports.deleteItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await db.query(
      "SELECT file_path FROM news_notices WHERE id = $1",
      [id],
    );
    if (item.rows[0]?.file_path) {
      const fullPath = path.join(__dirname, "..", item.rows[0].file_path);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    await db.query("DELETE FROM news_notices WHERE id = $1", [id]);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Updates item metadata or replaces the uploaded file.
 */
exports.updateItem = async (req, res) => {
  const { id } = req.params;
  const { title, type, fileType, linkUrl } = req.body;
  const file = req.file;

  try {
    if (file) {
      // Handle file replacement: Optional - you might want to delete the old file here
      const filePath = file.path;
      const fileName = file.originalname;
      const fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      await db.query(
        `UPDATE news_notices SET title=$1, type=$2, file_type=$3, file_path=$4, file_name=$5, file_size=$6 WHERE id=$7`,
        [title, type, fileType, filePath, fileName, fileSize, id],
      );
    } else {
      await db.query(
        `UPDATE news_notices SET title=$1, type=$2, file_type=$3, link_url=$4 WHERE id=$5`,
        [title, type, fileType, linkUrl, id],
      );
    }
    res.status(200).json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Persists the new order of items after a drag-and-drop action.
 */
exports.reorderNews = async (req, res) => {
  const { sequence } = req.body; // Expects array: [{id: 1, sequence_order: 0}, ...]
  try {
    // Using a loop to update each item's order
    for (let item of sequence) {
      // FIXED: Changed table name from 'news' to 'news_notices' to match your schema
      await db.query(
        "UPDATE news_notices SET sequence_order = $1 WHERE id = $2",
        [item.sequence_order, item.id],
      );
    }
    res.status(200).json({ message: "Order updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
