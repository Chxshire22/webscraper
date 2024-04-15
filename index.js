const express = require("express");
const scrapeCarousell  = require("./webscraper.js");

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
	res.send("Server running");
});

app.get("/scrape", async (req, res) => {
	const search = req.query.search;
	const searchResults = await scrapeCarousell(search);
	res.json(searchResults);
});

app.listen(PORT, () => {
	console.log(`App running on port ${PORT}`);
});