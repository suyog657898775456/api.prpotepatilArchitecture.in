const db = require("../config/db");
const fs = require("fs");
const path = require("path");

exports.getAuthorities = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM authorities ORDER BY id ASC");
    const formatted = result.rows.map((row) => ({
      ...row,
      // FIX: Replace backslashes with forward slashes for the browser URL
      image: row.image_path
        ? `http://localhost:5000/${row.image_path.replace(/\\/g, "/")}`
        : null,
      desc: row.description,
    }));
    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.saveAuthority = async (req, res) => {
  const { id, category, name, role, desc } = req.body;
  const imagePath = req.file ? req.file.path : null;

  try {
    // Check for "null" or "undefined" strings often sent by FormData
    if (id && id !== "undefined" && id !== "null") {
      let query, params;
      if (imagePath) {
        const old = await db.query(
          "SELECT image_path FROM authorities WHERE id=$1",
          [id],
        );

        // FIX: Path resolution for file deletion
        if (old.rows[0]?.image_path) {
          const fullPath = path.resolve(old.rows[0].image_path);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }

        query =
          "UPDATE authorities SET name=$1, role=$2, description=$3, image_path=$4, updated_at=NOW() WHERE id=$5";
        params = [name, role, desc, imagePath, id];
      } else {
        query =
          "UPDATE authorities SET name=$1, role=$2, description=$3, updated_at=NOW() WHERE id=$4";
        params = [name, role, desc, id];
      }
      await db.query(query, params);
      res.status(200).json({ message: "Updated" });
    } else {
      const query =
        "INSERT INTO authorities (category, name, role, description, image_path) VALUES ($1, $2, $3, $4, $5)";
      await db.query(query, [category, name, role, desc, imagePath]);
      res.status(201).json({ message: "Created" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAuthority = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await db.query(
      "SELECT image_path FROM authorities WHERE id=$1",
      [id],
    );

    // FIX: Path resolution for Windows/Linux compatibility
    if (data.rows[0]?.image_path) {
      const fullPath = path.resolve(data.rows[0].image_path);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    await db.query("DELETE FROM authorities WHERE id=$1", [id]);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
