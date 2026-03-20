const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// GET all events - Ordered by sequence
exports.getAllEvents = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM events ORDER BY sequence_order ASC, event_date ASC",
    );

    const formattedData = result.rows.map((row) => ({
      ...row,
      date: row.event_date ? row.event_date.toISOString().split("T")[0] : "",
      time: row.event_time ? row.event_time.substring(0, 5) : "",
      coverImage: row.cover_image_path
        ? `http://localhost:5000/${row.cover_image_path.replace(/\\/g, "/")}`
        : null,
    }));

    res.status(200).json(formattedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: Reorder function
exports.reorderEvents = async (req, res) => {
  const { sequence } = req.body;
  try {
    for (let item of sequence) {
      await db.query("UPDATE events SET sequence_order = $1 WHERE id = $2", [
        item.sequence_order,
        item.id,
      ]);
    }
    res.status(200).json({ message: "Order updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST add new event - This MUST be named addEvent
exports.addEvent = async (req, res) => {
  const { title, description, date, time, location } = req.body;
  const coverImagePath = req.file ? req.file.path : null;

  try {
    const query = `
      INSERT INTO events (title, description, event_date, event_time, location, cover_image_path) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`;

    const result = await db.query(query, [
      title,
      description,
      date,
      time,
      location,
      coverImagePath,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT update event
exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, date, time, location } = req.body;
  const newImagePath = req.file ? req.file.path : null;

  try {
    let query;
    let params;

    if (newImagePath) {
      query = `UPDATE events SET title=$1, description=$2, event_date=$3, event_time=$4, location=$5, cover_image_path=$6 WHERE id=$7 RETURNING *`;
      params = [title, description, date, time, location, newImagePath, id];
    } else {
      query = `UPDATE events SET title=$1, description=$2, event_date=$3, event_time=$4, location=$5 WHERE id=$6 RETURNING *`;
      params = [title, description, date, time, location, id];
    }

    const result = await db.query(query, params);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE event
exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const fileData = await db.query(
      "SELECT cover_image_path FROM events WHERE id = $1",
      [id],
    );
    if (fileData.rows[0]?.cover_image_path) {
      const fullPath = path.join(
        __dirname,
        "..",
        fileData.rows[0].cover_image_path,
      );
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    await db.query("DELETE FROM events WHERE id = $1", [id]);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
