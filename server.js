const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const fraRoutes = require("./routes/fraRoutes");
const staffRoutes = require("./routes/staffRoutes");
const nonTeachingRoutes = require("./routes/nonTeachingRoutes");
const contactRoutes = require("./routes/contactRoutes");
const sliderRoutes = require("./routes/sliderRoutes");
const newsRoutes = require("./routes/newsRoutes");
const dashboardEventRoutes = require("./routes/eventRoutes");
const mainEventRoutes = require("./routes/MainEventRoutes");
const highlightRoutes = require("./routes/highlightRoutes");
const videoRoutes = require("./routes/videoRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const syllabusRoutes = require("./routes/syllabusRoutes");
const downloadRoutes = require("./routes/downloadRoutes");
const instituteRoutes = require("./routes/instituteRoutes");
const authorityRoutes = require("./routes/authorityRoutes");
const guestRoutes = require("./routes/guestRoutes");
const academicEventRoutes = require("./routes/academicEventRoutes");
const activityFlyerRoutes = require("./routes/activityFlyerRoutes");
const collegeTourRoutes = require("./routes/collegeTourRoutes");
const naacRoutes = require("./routes/naacRoutes");
const photoRoutes = require("./routes/photoRoutes");
const collegeNewsRoutes = require("./routes/collegeNewsRoutes");
const galleryRoutes = require("./routes/galleryRoutes");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Allow both Admin and Main Website
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  if (req.url.startsWith("/uploads")) {
    console.log(`📂 File Request: ${req.url}`);
  }
  next();
});

// ADDED: Root route to fix "Cannot GET /"
app.get("/", (req, res) => {
  res.send("PRPARC API is running...");
});

app.use("/api", authRoutes);
app.use("/api/fra", fraRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/non-teaching-staff", nonTeachingRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/slider", sliderRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/highlights", highlightRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/calendars", calendarRoutes);
app.use("/api/syllabus", syllabusRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/institutes", instituteRoutes);
app.use("/api/authorities", authorityRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/academic-events", academicEventRoutes);
app.use("/api/activity-flyers", activityFlyerRoutes);
app.use("/api/college-tours", collegeTourRoutes);
app.use("/api/naac", naacRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/college-news", collegeNewsRoutes);
app.use("/api/architectural-gallery", galleryRoutes);
app.use("/api/results", require("./routes/resultRoutes"));

// DASHBOARD ENDPOINT: This is /api/events
app.use("/api/events", dashboardEventRoutes);
app.use("/api/main-events", mainEventRoutes);

const verifyDB = async () => {
  try {
    const res = await db.query("SELECT NOW()");
    console.log("✨ Neon DB Connected Successfully!");
  } catch (err) {
    console.error("❌ Neon DB Connection Failed:", err.message);
  }
};

const PORT = process.env.PORT || 5000;

// MODIFIED: Ensure it works on both local and Vercel
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    verifyDB();
  });
}

// ADDED: Required for Vercel deployment
module.exports = app;