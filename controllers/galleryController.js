const db = require("../config/db");
const fs = require("fs");
const path = require("path");

exports.getAllProjects = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM architectural_gallery ORDER BY sequence_order ASC, project_date DESC",
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.saveProject = async (req, res) => {
  const { id, title, project_date } = req.body;

  // Logic to separate Main Image from Additional Images
  let mainImageUrl = req.body.main_image; // Default to existing if no new file
  let additionalImages = JSON.parse(req.body.existing_additional || "[]");

  if (req.files) {
    req.files.forEach((file) => {
      if (file.fieldname === "mainImage") {
        mainImageUrl = `/uploads/images/${file.filename}`;
      } else if (file.fieldname === "additionalImages") {
        additionalImages.push(`/uploads/images/${file.filename}`);
      }
    });
  }

  try {
    if (id && id !== "null") {
      await db.query(
        "UPDATE architectural_gallery SET title=$1, project_date=$2, main_image=$3, additional_images=$4 WHERE id=$5",
        [
          title,
          project_date,
          mainImageUrl,
          JSON.stringify(additionalImages),
          id,
        ],
      );
      res.status(200).json({ message: "Project updated" });
    } else {
      await db.query(
        "INSERT INTO architectural_gallery (title, project_date, main_image, additional_images) VALUES ($1, $2, $3, $4)",
        [title, project_date, mainImageUrl, JSON.stringify(additionalImages)],
      );
      res.status(201).json({ message: "Project created" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await db.query(
      "SELECT main_image, additional_images FROM architectural_gallery WHERE id=$1",
      [id],
    );
    if (data.rows.length > 0) {
      const files = [
        data.rows[0].main_image,
        ...data.rows[0].additional_images,
      ];
      files.forEach((file) => {
        if (file) {
          const fullPath = path.join(__dirname, "..", file);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
      });
    }
    await db.query("DELETE FROM architectural_gallery WHERE id=$1", [id]);
    res.status(200).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reorderProjects = async (req, res) => {
  const { sequence } = req.body;
  try {
    for (let item of sequence) {
      await db.query(
        "UPDATE architectural_gallery SET sequence_order = $1 WHERE id = $2",
        [item.sequence_order, item.id],
      );
    }
    res.status(200).json({ message: "Order updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
