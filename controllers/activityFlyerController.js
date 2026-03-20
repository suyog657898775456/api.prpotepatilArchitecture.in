const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// Get all flyers - Updated to order by sequence
exports.getFlyers = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM activity_flyers ORDER BY sequence_order ASC, flyer_date DESC",
    );
    const formatted = result.rows.map((row) => ({
      id: row.id,
      title: row.flyer_title,
      date: row.flyer_date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      rawDate: row.flyer_date.toISOString().split("T")[0],
      year: new Date(row.flyer_date).getFullYear().toString(),
      imageUrl: `http://localhost:5000/${row.flyer_image_path.replace(/\\/g, "/")}`,
    }));
    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: Reorder logic
exports.reorderFlyers = async (req, res) => {
  const { sequence } = req.body;
  try {
    for (let item of sequence) {
      await db.query(
        "UPDATE activity_flyers SET sequence_order = $1 WHERE id = $2",
        [item.sequence_order, item.id],
      );
    }
    res.status(200).json({ message: "Order updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.saveFlyer = async (req, res) => {
  const { id, title, date } = req.body;
  const imagePath = req.file ? req.file.path : null;

  try {
    if (id && id !== "null" && id !== "undefined") {
      // Update Logic
      let query =
        "UPDATE activity_flyers SET flyer_title=$1, flyer_date=$2, updated_at=NOW()";
      let params = [title, date];
      if (imagePath) {
        query += ", flyer_image_path=$3 WHERE id=$4";
        params.push(imagePath, id);
      } else {
        query += " WHERE id=$3";
        params.push(id);
      }
      await db.query(query, params);
      res.status(200).json({ message: "Updated" });
    } else {
      // Insert Logic
      await db.query(
        "INSERT INTO activity_flyers (flyer_title, flyer_date, flyer_image_path) VALUES ($1, $2, $3)",
        [title, date, imagePath],
      );
      res.status(201).json({ message: "Created" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFlyer = async (req, res) => {
  try {
    const data = await db.query(
      "SELECT flyer_image_path FROM activity_flyers WHERE id=$1",
      [req.params.id],
    );
    if (data.rows[0]?.flyer_image_path) {
      const fullPath = path.resolve(data.rows[0].flyer_image_path);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    await db.query("DELETE FROM activity_flyers WHERE id=$1", [req.params.id]);
    res.status(200).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
