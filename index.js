const express = require("express");
const scrape  = require("./webscraper.js");
const cors = require("cors");

const app = express();
const PORT = 3000;
app.use(cors());

app.get("/", (req, res) => {
	res.send("Server running");
});

app.get("/scrape", async (req, res) => {
	const search = req.query.search;
	const searchResults = await scrape(search);
	res.json(searchResults);
});

app.listen(PORT, () => {
	console.log(`App running on port ${PORT}`);
});

// var corsOptions = {
//   origin: "http://example.com",
//   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };