const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// 1. GET ALL EVENTS
// 1. GET ALL EVENTS - Updated to order by sequence
exports.getAcademicEvents = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM academic_events ORDER BY sequence_order ASC, event_date DESC",
    );
    // ... existing formatting logic ...
    const formatted = result.rows.map((row) => ({
      id: row.id,
      title: row.academic_title,
      description: row.academic_desc,
      date: row.event_date
        ? new Date(row.event_date).toISOString().split("T")[0]
        : "",
      time: row.event_time ? row.event_time.substring(0, 5) : "00:00",
      location: row.venue,
      coverImage: row.cover_image_path
        ? `http://localhost:5000/${row.cover_image_path.replace(/\\/g, "/")}`
        : null,
      additionalImages: Array.isArray(row.gallery_images)
        ? row.gallery_images.map(
            (img) => `http://localhost:5000/${img.replace(/\\/g, "/")}`,
          )
        : [],
      videos: row.video_links || [],
      isHighlighted: row.is_highlighted || false,
    }));
    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: Reorder function
exports.reorderAcademicEvents = async (req, res) => {
  const { sequence } = req.body;
  try {
    for (let item of sequence) {
      await db.query(
        "UPDATE academic_events SET sequence_order = $1 WHERE id = $2",
        [item.sequence_order, item.id],
      );
    }
    res.status(200).json({ message: "Order updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. SAVE (CREATE OR UPDATE) EVENT
exports.saveAcademicEvent = async (req, res) => {
  const { id, title, description, date, time, location, videos } = req.body;

  let videoArray = [];
  try {
    videoArray = videos ? JSON.parse(videos) : [];
  } catch (e) {
    videoArray = [];
  }

  const coverPath =
    req.files && req.files["coverImage"]
      ? req.files["coverImage"][0].path
      : null;
  const galleryPaths =
    req.files && req.files["additionalImages"]
      ? req.files["additionalImages"].map((f) => f.path)
      : [];

  try {
    if (id && id !== "undefined" && id !== "null") {
      // Update Logic
      let query = `UPDATE academic_events SET academic_title=$1, academic_desc=$2, event_date=$3, event_time=$4, venue=$5, video_links=$6, updated_at=NOW()`;
      let params = [
        title,
        description,
        date,
        time,
        location,
        JSON.stringify(videoArray),
      ];

      if (coverPath) {
        query += `, cover_image_path=$${params.length + 1}`;
        params.push(coverPath);
      }
      if (galleryPaths.length > 0) {
        query += `, gallery_images=$${params.length + 1}`;
        params.push(JSON.stringify(galleryPaths));
      }

      query += ` WHERE id=$${params.length + 1}`;
      params.push(id);
      await db.query(query, params);
      res.status(200).json({ message: "Updated" });
    } else {
      // Insert Logic
      const query = `INSERT INTO academic_events (academic_title, academic_desc, event_date, event_time, venue, cover_image_path, gallery_images, video_links) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
      await db.query(query, [
        title,
        description,
        date,
        time,
        location,
        coverPath,
        JSON.stringify(galleryPaths),
        JSON.stringify(videoArray),
      ]);
      res.status(201).json({ message: "Created" });
    }
  } catch (err) {
    console.error("SAVE Academic Event Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// 3. TOGGLE HIGHLIGHT (The missing function that caused the crash)
exports.toggleAcademicHighlight = async (req, res) => {
  try {
    await db.query(
      "UPDATE academic_events SET is_highlighted = NOT is_highlighted WHERE id=$1",
      [req.params.id],
    );
    res.status(200).json({ message: "Highlight toggled successfully" });
  } catch (err) {
    console.error("Toggle Highlight Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// 4. DELETE EVENT (The other missing function)
exports.deleteAcademicEvent = async (req, res) => {
  try {
    // First, get file paths to delete files from local storage
    const data = await db.query(
      "SELECT cover_image_path, gallery_images FROM academic_events WHERE id=$1",
      [req.params.id],
    );

    if (data.rows[0]) {
      const row = data.rows[0];
      const filesToDelete = [];
      if (row.cover_image_path) filesToDelete.push(row.cover_image_path);
      if (Array.isArray(row.gallery_images))
        filesToDelete.push(...row.gallery_images);

      filesToDelete.forEach((filePath) => {
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await db.query("DELETE FROM academic_events WHERE id=$1", [req.params.id]);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Delete Event Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
