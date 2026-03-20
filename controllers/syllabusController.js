const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// Get all items - Sorted by sequence_order
exports.getSyllabus = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM syllabus ORDER BY sequence_order ASC, created_at DESC",
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

// New function to handle drag and drop reordering
exports.reorderSyllabus = async (req, res) => {
  const { sequence } = req.body;
  try {
    for (let item of sequence) {
      await db.query("UPDATE syllabus SET sequence_order = $1 WHERE id = $2", [
        item.sequence_order,
        item.id,
      ]);
    }
    res.status(200).json({ message: "Order updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadSyllabus = async (req, res) => {
  const { name } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No PDF file uploaded" });

  try {
    const fileSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    const query = `INSERT INTO syllabus (name, file_path, file_size) VALUES ($1, $2, $3) RETURNING *`;
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

exports.updateSyllabus = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const newFile = req.file;

  try {
    let query, params;
    if (newFile) {
      const oldData = await db.query(
        "SELECT file_path FROM syllabus WHERE id=$1",
        [id],
      );
      if (
        oldData.rows[0]?.file_path &&
        fs.existsSync(oldData.rows[0].file_path)
      ) {
        fs.unlinkSync(oldData.rows[0].file_path);
      }
      const fileSize = (newFile.size / (1024 * 1024)).toFixed(2) + " MB";
      query = `UPDATE syllabus SET name=$1, file_path=$2, file_size=$3, upload_date=CURRENT_DATE WHERE id=$4 RETURNING *`;
      params = [name, newFile.path, fileSize, id];
    } else {
      query = `UPDATE syllabus SET name=$1 WHERE id=$2 RETURNING *`;
      params = [name, id];
    }
    const result = await db.query(query, params);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSyllabus = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await db.query("SELECT file_path FROM syllabus WHERE id=$1", [
      id,
    ]);
    if (data.rows[0]?.file_path && fs.existsSync(data.rows[0].file_path)) {
      fs.unlinkSync(data.rows[0].file_path);
    }
    await db.query("DELETE FROM syllabus WHERE id=$1", [id]);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
