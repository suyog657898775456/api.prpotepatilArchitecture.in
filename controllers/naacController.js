const db = require("../config/db");
const fs = require("fs");
const path = require("path");

exports.getNaacTabs = async (req, res) => {
  try {
    // UPDATED: Now sorts by sequence_order first
    const result = await db.query("SELECT * FROM naac_tabs ORDER BY sequence_order ASC, id ASC");
    const formatted = result.rows.map((row) => ({
      id: row.id,
      title: row.tab_title,
      sections: row.sections,
    }));
    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADDED: Reorder logic for NAAC Tabs
exports.reorderNaac = async (req, res) => {
  const { sequence } = req.body; 
  try {
    for (let item of sequence) {
      await db.query("UPDATE naac_tabs SET sequence_order = $1 WHERE id = $2", [
        item.sequence_order,
        item.id,
      ]);
    }
    res.status(200).json({ message: "NAAC sequence updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.saveNaacTab = async (req, res) => {
  const { id, title, sections } = req.body;
  let parsedSections = JSON.parse(sections);

  if (req.files && req.files.length > 0) {
    req.files.forEach((file) => {
      const [_, sId, fId] = file.fieldname.split("_");
      parsedSections = parsedSections.map((sec) => {
        if (sec.id == sId) {
          sec.files = sec.files.map((f) => {
            if (f.id == fId) {
              return {
                ...f,
                fileName: file.filename,
                url: `/uploads/naac/${file.filename}`,
              };
            }
            return f;
          });
        }
        return sec;
      });
    });
  }

  try {
    if (id && id !== "null") {
      await db.query(
        "UPDATE naac_tabs SET tab_title=$1, sections=$2, updated_at=NOW() WHERE id=$3",
        [title, JSON.stringify(parsedSections), id],
      );
      res.status(200).json({ message: "Tab updated" });
    } else {
      // Logic for new tabs: sets sequence_order to 0 by default (SQL handles this)
      await db.query(
        "INSERT INTO naac_tabs (tab_title, sections) VALUES ($1, $2)",
        [title, JSON.stringify(parsedSections)],
      );
      res.status(201).json({ message: "Tab created" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNaacTab = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM naac_tabs WHERE id=$1", [id]);
    res.status(200).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};