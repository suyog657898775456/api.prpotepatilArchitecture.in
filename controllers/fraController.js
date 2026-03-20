const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// --- 1. Get All FRA Data ---
exports.getAllFRA = async (req, res) => {
  try {
    // Inside exports.getFra:
    const result = await db.query(
      "SELECT * FROM fra_fees ORDER BY sequence_order ASC, id ASC",
    );

    // Map data to match your frontend object structure exactly
    const formattedData = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      pdfFile: row.pdf_path
        ? {
            id: row.id,
            name: row.pdf_name,
            uploadedDate: row.uploaded_date,
            // Frontend will use this to display/download the PDF
            url: `http://localhost:5000/${row.pdf_path}`,
          }
        : null,
    }));

    res.status(200).json(formattedData);
  } catch (err) {
    console.error("Error in getAllFRA:", err.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

// --- 2. Add New FRA Tab ---
exports.addFRA = async (req, res) => {
  const { title, pdfName } = req.body;
  const pdfPath = req.file ? req.file.path : null;

  try {
    const query = `
            INSERT INTO fra_fees (title, pdf_name, pdf_path) 
            VALUES ($1, $2, $3) RETURNING *`;
    const values = [title, pdfName, pdfPath];
    const result = await db.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error in addFRA:", err.message);
    res.status(500).json({ error: "Failed to add FRA tab" });
  }
};

// --- 3. Update Existing FRA Tab ---
exports.updateFRA = async (req, res) => {
  const { id } = req.params;
  const { title, pdfName } = req.body;
  const newPdfPath = req.file ? req.file.path : null;

  try {
    let query;
    let values;

    if (newPdfPath) {
      // If new file uploaded, update everything
      query = `UPDATE fra_fees SET title=$1, pdf_name=$2, pdf_path=$3 WHERE id=$4 RETURNING *`;
      values = [title, pdfName, newPdfPath, id];
    } else {
      // Update only text fields
      query = `UPDATE fra_fees SET title=$1, pdf_name=$2 WHERE id=$3 RETURNING *`;
      values = [title, pdfName, id];
    }

    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "FRA tab not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error in updateFRA:", err.message);
    res.status(500).json({ error: "Failed to update FRA tab" });
  }
};

// --- 4. Delete FRA Tab ---
exports.deleteFRA = async (req, res) => {
  const { id } = req.params;
  try {
    // Step A: Find the file path to delete local file
    const fileData = await db.query(
      "SELECT pdf_path FROM fra_fees WHERE id = $1",
      [id],
    );

    if (fileData.rows.length > 0 && fileData.rows[0].pdf_path) {
      const fullPath = path.join(__dirname, "..", fileData.rows[0].pdf_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath); // Delete from local uploads folder
      }
    }

    // Step B: Delete from Database
    const deleteResult = await db.query("DELETE FROM fra_fees WHERE id = $1", [
      id,
    ]);

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: "FRA tab not found" });
    }

    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Error in deleteFRA:", err.message);
    res.status(500).json({ error: "Failed to delete FRA tab" });
  }
};

exports.reorderFra = async (req, res) => {
  const { sequence } = req.body; // Expects array: [{id: 1, sequence_order: 0}, ...]
  try {
    for (let item of sequence) {
      await db.query("UPDATE fra_fees SET sequence_order = $1 WHERE id = $2", [
        item.sequence_order,
        item.id,
      ]);
    }
    res.status(200).json({ message: "Sequence updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
