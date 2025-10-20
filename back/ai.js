const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY; //from env file
const URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function runGemini(prompt) {
    try {
        const response = await axios.post(
            URL,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-goog-api-key": API_KEY,
                },
            }
        );
        return response.data
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
    }
}

module.exports = runGemini