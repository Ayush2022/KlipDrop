const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { nanoid } = require("nanoid");

const Snippet = require("./models/Snippet");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(
"mongodb://ayush:clipdrop123@ac-hosq2l6-shard-00-00.q3m1xcu.mongodb.net:27017,ac-hosq2l6-shard-00-01.q3m1xcu.mongodb.net:27017,ac-hosq2l6-shard-00-02.q3m1xcu.mongodb.net:27017/clipboard?ssl=true&replicaSet=atlas-jokboo-shard-0&authSource=admin&retryWrites=true&w=majority"
)
.then(() => {
    console.log("MongoDB connected successfully");
    app.listen(5000, () => {
        console.log("Server running on port 5000");
    });
})
.catch(err => console.log("MongoDB connection error:", err));


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

    const snippet = await Snippet.findOne({ code: req.params.code });

    if (!snippet) {
        return res.status(404).json({ message: "Not found" });
    }

    res.json(snippet);

});