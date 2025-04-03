const readline = require("readline-sync");
const axios = require("axios");
const { Translate } = require("@google-cloud/translate").v2;

require('dotenv').config();

// AI Introduction Function
async function Introduction() {
    return "I am an AI assistant designed to help with various tasks.";
}

async function Translation({sourceLang, targetLang, text}) {
    console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    // return "NONE"
    try {
        
        const translate = new Translate({
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
        });

        const [translation] = await translate.translate(text, targetLang);
        return `Translation: ${translation}`;
    } catch (error) {
        return "Facing issue while translating";
    }
}


// Fetch News Function
async function FetchNews({category}) {
    try {
        const apiKey = process.env.NEWSAPI_KEY;

        if (!apiKey) {
            throw new Error("Missing API Key. Set NEWSAPI_KEY in environment variables.");
        }

        if (!category) {
            throw new Error("News category is undefined. Please provide a valid category.");
        }

        const url = `https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${apiKey}&country=us`;

        const response = await axios.get(url);

        if (!response.data.articles || response.data.articles.length === 0) {
            return "No news articles found for this category.";
        }

        return response.data.articles.slice(0, 5)
            .map((article, index) => `${index + 1}. ${article.title} - ${article.source.name}`)
            .join("\n");


    } catch (error) {
        return "Facing Issue While getting news."
    }
}

// Export functions
module.exports = { Introduction, Translation, FetchNews};
