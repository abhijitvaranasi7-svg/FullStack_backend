const fs = require("fs");
const path = require("path");
const natural = require("natural");

const DATA_LAKE_PATH = path.join(__dirname, "data_lake");
const META_PATH = path.join(DATA_LAKE_PATH, "metadata.json");

function getRecommendations(userId) {
    if (!fs.existsSync(META_PATH)) return [];

    const metadata = JSON.parse(fs.readFileSync(META_PATH));
    if (metadata.length === 0) return [];

    const userEntries = metadata.filter((entry) => entry.userId === userId);
    if (userEntries.length < 2) {
        return ["Write more posts to get recommendations!"];
    }

    const posts = userEntries.map((entry) => {
        const postPath = path.join(DATA_LAKE_PATH, entry.file);
        return JSON.parse(fs.readFileSync(postPath));
    });

    const tfidf = new natural.TfIdf();
    posts.forEach((p) => tfidf.addDocument(p.content));

    const latestIndex = posts.length - 1;
    const latestPost = posts[latestIndex];

    const terms = [];
    tfidf.listTerms(latestIndex).forEach((item, i) => {
        if (i < 5) terms.push(item.term);
    });

    if (terms.length === 0) {
        return ["No strong keywords found. Try writing longer posts!"];
    }

    return terms.map((t) => `Maybe expand more on "${t}" in your next post?`);
}

module.exports = { getRecommendations };
