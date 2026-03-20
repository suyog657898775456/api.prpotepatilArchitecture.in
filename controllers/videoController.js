const db = require("../config/db");

// 1. GET ALL VIDEOS - Updated to order by sequence
exports.getAllVideos = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM videos ORDER BY sequence_order ASC, created_at DESC",
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: Reorder logic for Videos
exports.reorderVideos = async (req, res) => {
  const { sequence } = req.body;
  try {
    for (let item of sequence) {
      await db.query("UPDATE videos SET sequence_order = $1 WHERE id = $2", [
        item.sequence_order,
        item.id,
      ]);
    }
    res.status(200).json({ message: "Sequence updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.addVideo = async (req, res) => {
  const { title, url, description } = req.body;
  try {
    const query =
      "INSERT INTO videos (title, url, description) VALUES ($1, $2, $3) RETURNING *";
    const result = await db.query(query, [title, url, description]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateVideo = async (req, res) => {
  const { id } = req.params;
  const { title, url, description, featured } = req.body;
  try {
    const query =
      "UPDATE videos SET title=$1, url=$2, description=$3, featured=$4, updated_at=NOW() WHERE id=$5 RETURNING *";
    const result = await db.query(query, [
      title,
      url,
      description,
      featured,
      id,
    ]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleFeatured = async (req, res) => {
  const { id } = req.params;
  try {
    const query =
      "UPDATE videos SET featured = NOT featured WHERE id = $1 RETURNING *";
    const result = await db.query(query, [id]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteVideo = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM videos WHERE id = $1", [id]);
    res.status(200).json({ message: "Video deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
