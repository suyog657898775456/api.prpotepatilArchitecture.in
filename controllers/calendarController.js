const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// Get all calendars - Updated to order by sequence
exports.getCalendars = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM academic_calendars ORDER BY sequence_order ASC, created_at DESC",
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

// Add this new function for Drag & Drop
exports.reorderCalendars = async (req, res) => {
  const { sequence } = req.body;
  try {
    for (let item of sequence) {
      await db.query("UPDATE academic_calendars SET sequence_order = $1 WHERE id = $2", [
        item.sequence_order,
        item.id,
      ]);
    }
    res.status(200).json({ message: "Order updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadCalendar = async (req, res) => {
  const { name } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No PDF file uploaded" });

  try {
    const fileSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    const query = `INSERT INTO academic_calendars (name, file_path, file_size) 
                   VALUES ($1, $2, $3) RETURNING *`;
    const result = await db.query(query, [
      name || file.originalname,
      file.path,
      fileSize,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCalendar = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const newFile = req.file;

  try {
    let query, params;
    if (newFile) {
      // Remove old file if a new one is uploaded
      const oldData = await db.query(
        "SELECT file_path FROM academic_calendars WHERE id=$1",
        [id],
      );
      if (oldData.rows[0]?.file_path) fs.unlinkSync(oldData.rows[0].file_path);

      const fileSize = (newFile.size / (1024 * 1024)).toFixed(2) + " MB";
      query = `UPDATE academic_calendars SET name=$1, file_path=$2, file_size=$3, upload_date=CURRENT_DATE WHERE id=$4 RETURNING *`;
      params = [name, newFile.path, fileSize, id];
    } else {
      query = `UPDATE academic_calendars SET name=$1 WHERE id=$2 RETURNING *`;
      params = [name, id];
    }
    const result = await db.query(query, params);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCalendar = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await db.query(
      "SELECT file_path FROM academic_calendars WHERE id=$1",
      [id],
    );
    if (data.rows[0]?.file_path) {
      if (fs.existsSync(data.rows[0].file_path))
        fs.unlinkSync(data.rows[0].file_path);
    }
    await db.query("DELETE FROM academic_calendars WHERE id=$1", [id]);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
