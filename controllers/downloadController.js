const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// Get all items - Updated to order by sequence
exports.getDownloads = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM downloads ORDER BY sequence_order ASC, created_at DESC",
    );
    const formatted = result.rows.map((row) => ({
      ...row,
      uploadDate: new Date(row.upload_date).toLocaleDateString(),
    }));
    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// New function to handle drag and drop sequence updates
exports.reorderDownloads = async (req, res) => {
  const { sequence } = req.body; // Expects [{id: 1, sequence_order: 0}, ...]
  try {
    for (let item of sequence) {
      await db.query("UPDATE downloads SET sequence_order = $1 WHERE id = $2", [
        item.sequence_order,
        item.id,
      ]);
    }
    res.status(200).json({ message: "Order updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadDownload = async (req, res) => {
  const { name } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const fileSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    const query = `INSERT INTO downloads (name, file_path, file_size) VALUES ($1, $2, $3) RETURNING *`;
    const result = await db.query(query, [
      name || file.originalname.replace(/\.pdf$/i, ""),
      file.path,
      fileSize,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDownload = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const file = req.file;

  try {
    let query, params;
    if (file) {
      const old = await db.query(
        "SELECT file_path FROM downloads WHERE id=$1",
        [id],
      );
      if (old.rows[0]?.file_path && fs.existsSync(old.rows[0].file_path))
        fs.unlinkSync(old.rows[0].file_path);
      const fileSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";
      query = `UPDATE downloads SET name=$1, file_path=$2, file_size=$3, upload_date=CURRENT_DATE WHERE id=$4 RETURNING *`;
      params = [name, file.path, fileSize, id];
    } else {
      query = `UPDATE downloads SET name=$1 WHERE id=$2 RETURNING *`;
      params = [name, id];
    }
    const result = await db.query(query, params);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDownload = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await db.query("SELECT file_path FROM downloads WHERE id=$1", [
      id,
    ]);
    if (data.rows[0]?.file_path && fs.existsSync(data.rows[0].file_path))
      fs.unlinkSync(data.rows[0].file_path);
    await db.query("DELETE FROM downloads WHERE id=$1", [id]);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
