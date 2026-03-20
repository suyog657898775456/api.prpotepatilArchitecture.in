const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// 1. GET ALL - Updated to order by sequence
exports.getHighlights = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM highlights ORDER BY sequence_order ASC, event_date DESC",
    );
    const formatted = result.rows.map((row) => ({
      ...row,
      date: row.event_date.toISOString().split("T")[0],
      time: row.event_time.substring(0, 5),
      coverImage: row.cover_image_path
        ? `http://localhost:5000/${row.cover_image_path}`
        : null,
    }));
    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: Reorder function
exports.reorderHighlights = async (req, res) => {
  const { sequence } = req.body;
  try {
    for (let item of sequence) {
      await db.query(
        "UPDATE highlights SET sequence_order = $1 WHERE id = $2",
        [item.sequence_order, item.id],
      );
    }
    res.status(200).json({ message: "Order updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addHighlight = async (req, res) => {
  const { title, description, date, time, location, videos } = req.body;
  const coverImagePath = req.file ? req.file.path : null;
  const videoArray = typeof videos === "string" ? JSON.parse(videos) : videos;

  try {
    const query = `INSERT INTO highlights (title, description, event_date, event_time, location, cover_image_path, videos) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const result = await db.query(query, [
      title,
      description,
      date,
      time,
      location,
      coverImagePath,
      videoArray,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateHighlight = async (req, res) => {
  const { id } = req.params;
  const { title, description, date, time, location, videos } = req.body;
  const videoArray = typeof videos === "string" ? JSON.parse(videos) : videos;

  try {
    let query, params;
    if (req.file) {
      query = `UPDATE highlights SET title=$1, description=$2, event_date=$3, event_time=$4, location=$5, videos=$6, cover_image_path=$7, updated_at=NOW() WHERE id=$8`;
      params = [
        title,
        description,
        date,
        time,
        location,
        videoArray,
        req.file.path,
        id,
      ];
    } else {
      query = `UPDATE highlights SET title=$1, description=$2, event_date=$3, event_time=$4, location=$5, videos=$6, updated_at=NOW() WHERE id=$7`;
      params = [title, description, date, time, location, videoArray, id];
    }
    await db.query(query, params);
    res.status(200).json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteHighlight = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await db.query(
      "SELECT cover_image_path FROM highlights WHERE id=$1",
      [id],
    );
    if (data.rows[0]?.cover_image_path) {
      const fullPath = path.join(
        __dirname,
        "..",
        data.rows[0].cover_image_path,
      );
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    await db.query("DELETE FROM highlights WHERE id=$1", [id]);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
