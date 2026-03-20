const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// Get all results - Updated to order by sequence
exports.getAllResults = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM college_results ORDER BY sequence_order ASC, uploaded_at DESC",
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add this new function for Drag & Drop
exports.reorderResults = async (req, res) => {
  const { sequence } = req.body;
  try {
    for (let item of sequence) {
      await db.query(
        "UPDATE college_results SET sequence_order = $1 WHERE id = $2",
        [item.sequence_order, item.id],
      );
    }
    res.status(200).json({ message: "Order updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new result
exports.addResult = async (req, res) => {
  const { title } = req.body;
  const pdfPath = req.file ? `/uploads/fra/${req.file.filename}` : null; // Reusing fra folder or create /uploads/results
  const pdfName = req.file ? req.file.originalname : "document.pdf";
  const fileSize = req.file
    ? (req.file.size / (1024 * 1024)).toFixed(2) + " MB"
    : "0 MB";

  try {
    const result = await db.query(
      "INSERT INTO college_results (title, pdf_name, pdf_path, file_size) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, pdfName, pdfPath, fileSize],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update result (Title and/or PDF File)
exports.updateResult = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const newFile = req.file;

  try {
    if (newFile) {
      // Delete old file
      const oldData = await db.query(
        "SELECT pdf_path FROM college_results WHERE id=$1",
        [id],
      );
      if (oldData.rows[0]?.pdf_path) {
        const oldPath = path.join(__dirname, "..", oldData.rows[0].pdf_path);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const pdfPath = `/uploads/fra/${newFile.filename}`;
      const pdfName = newFile.originalname;
      const fileSize = (newFile.size / (1024 * 1024)).toFixed(2) + " MB";

      await db.query(
        "UPDATE college_results SET title=$1, pdf_name=$2, pdf_path=$3, file_size=$4 WHERE id=$5",
        [title, pdfName, pdfPath, fileSize, id],
      );
    } else {
      await db.query("UPDATE college_results SET title=$1 WHERE id=$2", [
        title,
        id,
      ]);
    }
    res.status(200).json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete result
exports.deleteResult = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await db.query(
      "SELECT pdf_path FROM college_results WHERE id=$1",
      [id],
    );
    if (data.rows[0]?.pdf_path) {
      const filePath = path.join(__dirname, "..", data.rows[0].pdf_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await db.query("DELETE FROM college_results WHERE id=$1", [id]);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
