const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// 1. GET ALL TOURS - Updated to order by sequence
exports.getTours = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM college_tours ORDER BY sequence_order ASC, tour_date DESC",
    );
    const formatted = result.rows.map((row) => ({
      id: row.id,
      title: row.tour_title,
      description: row.tour_description,
      location: row.tour_location,
      date: row.tour_date.toISOString().split("T")[0],
      images: row.tour_images.map(
        (img) => `http://localhost:5000/${img.replace(/\\/g, "/")}`,
      ),
      videos: row.tour_videos,
      coverImageIndex: row.cover_image_index,
    }));
    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: Reorder function
exports.reorderTours = async (req, res) => {
  const { sequence } = req.body;
  try {
    for (let item of sequence) {
      await db.query(
        "UPDATE college_tours SET sequence_order = $1 WHERE id = $2",
        [item.sequence_order, item.id],
      );
    }
    res.status(200).json({ message: "Order updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.saveTour = async (req, res) => {
  const { id, title, description, location, date, videos, existingImages } =
    req.body;
  const videoArray = videos ? JSON.parse(videos) : [];

  // Process new uploaded files
  const newImagePaths = req.files ? req.files.map((f) => f.path) : [];
  // If updating, we combine existing images with new ones
  const finalImages = existingImages
    ? [...JSON.parse(existingImages), ...newImagePaths]
    : newImagePaths;

  try {
    if (id && id !== "null") {
      await db.query(
        "UPDATE college_tours SET tour_title=$1, tour_description=$2, tour_location=$3, tour_date=$4, tour_images=$5, tour_videos=$6, updated_at=NOW() WHERE id=$7",
        [
          title,
          description,
          location,
          date,
          JSON.stringify(finalImages),
          JSON.stringify(videoArray),
          id,
        ],
      );
      res.status(200).json({ message: "Tour updated" });
    } else {
      await db.query(
        "INSERT INTO college_tours (tour_title, tour_description, tour_location, tour_date, tour_images, tour_videos) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          title,
          description,
          location,
          date,
          JSON.stringify(finalImages),
          JSON.stringify(videoArray),
        ],
      );
      res.status(201).json({ message: "Tour created" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const data = await db.query(
      "SELECT tour_images FROM college_tours WHERE id=$1",
      [req.params.id],
    );
    if (data.rows[0]?.tour_images) {
      data.rows[0].tour_images.forEach((img) => {
        if (fs.existsSync(img)) fs.unlinkSync(img);
      });
    }
    await db.query("DELETE FROM college_tours WHERE id=$1", [req.params.id]);
    res.status(200).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
