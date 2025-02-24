
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { connectToMongoDB } = require("./connection")
const {restrictToLoginUserOnly,checkAuth} = require("./middleware/auth")

const URL = require("./models/url")


const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const userRoute = require("./routes/user");


const app = express();
const PORT =  8001;

connectToMongoDB("mongodb://127.0.0.1:27017/short-url")
.then(()=> console.log("MongoDb connected successfully"))


app.set("view engine", "ejs");
app.set("views",path.resolve("./views"));


app.use(express.json());
app.use(express.urlencoded({extended: true }));
app.use(cookieParser());  




app.use("/url", restrictToLoginUserOnly,urlRoute);
app.use("/user", userRoute);
app.use("/", checkAuth,staticRoute);




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
