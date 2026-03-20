const db = require("../config/db");
const fs = require("fs");
const path = require("path");

exports.getInstitutes = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM institutes ORDER BY created_at DESC",
    );
    const formatted = result.rows.map((row) => ({
      ...row,
      image: `http://localhost:5000/${row.image_path}`,
    }));
    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addInstitute = async (req, res) => {
  const { title } = req.body;
  const imagePath = req.file ? req.file.path : null;
  try {
    const query =
      "INSERT INTO institutes (title, image_path) VALUES ($1, $2) RETURNING *";
    const result = await db.query(query, [title, imagePath]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateInstitute = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  try {
    let query, params;
    if (req.file) {
      const old = await db.query(
        "SELECT image_path FROM institutes WHERE id=$1",
        [id],
      );
      if (old.rows[0]?.image_path && fs.existsSync(old.rows[0].image_path))
        fs.unlinkSync(old.rows[0].image_path);
      query =
        "UPDATE institutes SET title=$1, image_path=$2, updated_at=NOW() WHERE id=$3";
      params = [title, req.file.path, id];
    } else {
      query = "UPDATE institutes SET title=$1, updated_at=NOW() WHERE id=$2";
      params = [title, id];
    }
    await db.query(query, params);
    res.status(200).json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteInstitute = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await db.query(
      "SELECT image_path FROM institutes WHERE id=$1",
      [id],
    );
    if (data.rows[0]?.image_path && fs.existsSync(data.rows[0].image_path))
      fs.unlinkSync(data.rows[0].image_path);
    await db.query("DELETE FROM institutes WHERE id=$1", [id]);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
