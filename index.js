
const express = require("express");
const { connectToMongoDB } = require("./connection")
const urlRoute = require("./routes/url");
const URL = require("./models/url")

const app = express();
const PORT =  8001;

connectToMongoDB("mongodb://127.0.0.1:27017/short-url")
.then(()=> console.log("MongoDb connected successfully"))

app.use(express.json());

app.use("/url", urlRoute);

app.get("/:shortId", async (req, res) => {
    try {
        const { shortId } = req.params;

        // Find and update the URL document
        const entry = await URL.findOneAndUpdate(
            { shortId },  // ✅ Ensure this matches your schema field name
            { 
                $push: { 
                    visitHistory: { timestamp: Date.now() } 
                } 
            },
            { new: true }  // ✅ Returns the updated document
        );

        // ✅ Check if entry is null before redirecting
        if (!entry) {
            return res.status(404).json({ error: "Short URL not found" });
        }

        res.redirect(entry.redirectURL);
    } catch (error) {
        console.error("Error in redirection:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.listen(PORT, () => console.log(`Server started at port ${PORT}`)); 
