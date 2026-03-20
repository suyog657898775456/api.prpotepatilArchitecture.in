const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// Get all photos sorted by sequence
exports.getAllPhotos = async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM college_photos ORDER BY sequence_order ASC, event_date DESC");
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add new photo
exports.addPhoto = async (req, res) => {
    const { title, date } = req.body;
    const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : null;

    try {
        const result = await db.query(
            "INSERT INTO college_photos (title, event_date, image_url) VALUES ($1, $2, $3) RETURNING *",
            [title, date, imageUrl]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update photo
exports.updatePhoto = async (req, res) => {
    const { id } = req.params;
    const { title, date } = req.body;
    const newImageUrl = req.file ? `/uploads/images/${req.file.filename}` : null;

    try {
        if (newImageUrl) {
            // Delete old file if exists
            const oldData = await db.query("SELECT image_url FROM college_photos WHERE id=$1", [id]);
            if (oldData.rows[0]?.image_url) {
                const oldPath = path.join(__dirname, "..", oldData.rows[0].image_url);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            await db.query(
                "UPDATE college_photos SET title=$1, event_date=$2, image_url=$3 WHERE id=$4",
                [title, date, newImageUrl, id]
            );
        } else {
            await db.query(
                "UPDATE college_photos SET title=$1, event_date=$2 WHERE id=$3",
                [title, date, id]
            );
        }
        res.status(200).json({ message: "Photo updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete photo
exports.deletePhoto = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await db.query("SELECT image_url FROM college_photos WHERE id=$1", [id]);
        if (data.rows[0]?.image_url) {
            const filePath = path.join(__dirname, "..", data.rows[0].image_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        await db.query("DELETE FROM college_photos WHERE id=$1", [id]);
        res.status(200).json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Reorder photos
exports.reorderPhotos = async (req, res) => {
    const { sequence } = req.body;
    try {
        for (let item of sequence) {
            await db.query("UPDATE college_photos SET sequence_order = $1 WHERE id = $2", [item.sequence_order, item.id]);
        }
        res.status(200).json({ message: "Sequence updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};