const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { nanoid } = require("nanoid");

const multer = require("multer");
const path = require("path");

const Snippet = require("./models/Snippet");

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log("MongoDB connected successfully");
})
.catch(err => {
  console.log("MongoDB connection error:", err);
});

app.post("/paste", async (req, res) => {

    const code = nanoid(6);

    const snippet = new Snippet({
        code: code,
        text: req.body.text
    });

    await snippet.save();

    res.json({ code });

});

app.get("/get/:code", async (req, res) => {

    try {

        const snippet = await Snippet.findOne({ code: req.params.code });

        // ❌ Not found
        if (!snippet) {
            return res.status(404).json({ message: "Not found" });
        }

        // 🔐 Password check (ONLY if password exists → means file)
        if (snippet.password && snippet.password !== req.query.password) {
            return res.status(403).json({ message: "Wrong password" });
        }

        // ✅ Send data
        res.json(snippet);

    } catch (err) {

        console.error(err);
        res.status(500).json({ message: "Server error" });

    }

});

app.post("/upload", upload.single("file"), async (req, res) => {

    const code = nanoid(6);

    const fileUrl = "/uploads/" + req.file.filename;

    const snippet = new Snippet({
        code: code,
        text: fileUrl,
        password: req.body.password || null // 🔐 only for files
    });

    await snippet.save();

    res.json({ code });

});


app.put("/update/:code", async (req, res) => {

    const snippet = await Snippet.findOneAndUpdate(
        { code: req.params.code },
        { text: req.body.text },
        { new: true }
    );

    if (!snippet) {
        return res.status(404).json({ message: "Snippet not found" });
    }

    res.json({ message: "Snippet updated successfully" });

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});