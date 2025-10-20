const runGemini = require('../ai');
const postDb = require('../models/postSchema');
const userDb = require('../models/userSchema');

const moodPrompts = {
    wholesome: `
        Tone: warm, kind, supportive.
        Style: gentle encouragement; gratitude allowed.
        Cadence: soft; avoid pressure and hype.
        Emojis: up to 2 warm ones (optional).
        Hashtags: up to 1 at the very end (optional).`,

    poetic: `
        Tone: lyrical and imagistic.
        Style: original metaphor only (no clichés).
        Cadence: gentle; avoid exclamation marks.
        Emojis: up to 1 subtle (optional).
        Hashtags: none.`,

    witty: `
        Tone: dry, clever, a touch of irony.
        Style: setup → punchline (one line break allowed). Then add some thoughts about the topic to create a proper post.
        Cadence: tight; no rambling; max one "!".
        Emojis: up to 1 for timing (optional).
        Hashtags: none.`,

    mysterious: `
        Tone: eerie, suggestive, never explicit.
        Style: hint at something; may end with a single ellipsis.
        Cadence: slow burn; no spoilers.
        Emojis: up to 1 (subtle, optional).
        Hashtags: up to 1 at the very end (optional).`
};

module.exports = {
    createPost: async (req, res) => {
        const { imageUrl, prompt, mood } = req.body; //from FE

        //make sure all info for post is filled
        if (!imageUrl || !prompt || !mood) {
            return res.send({ success: false, message: "imageUrl, prompt and mood are required" });
        }

        //make sure the right mood is selected
        if (!moodPrompts[mood]) {
            return res.send({ success: false, message: "Invalid mood" });
        }

        //default prompt
        const defaultPrompt = `
            You are a social media copywriter. Write a post for the selected style.
            
            Return ONLY valid JSON (no markdown), exactly:
            {"title":"...","content":"..."}
            
            Global rules:
            - "title": ≤7 words, Title Case, no emojis, no hashtags, no trailing punctuation.
            - "content": 4–15 sentences, from 300 up to 500 characters total (spaces & emojis count).
            - Follow the style card strictly (emoji limits, hashtag policy).
            - If a hashtag is allowed, put it at the VERY END of content.
            - Do not invent facts about the image; do not mention the URL.
            - Escape any internal double quotes with \\".
            - Output JSON only.
            
            Style card:
            ${moodPrompts[mood]}
            
            User topic: ${prompt}
            Image (context only; do not mention or describe): ${imageUrl}
            
            Return ONLY the JSON now.
            `.trim();

        // call AI with prompt
        const aiResponse = await runGemini(defaultPrompt);
        const getText = aiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || ""; //get text
        if (!getText) {
            return res.send({ success: false, message: "AI failed to generate content" });
        }
        console.log(getText);

        // removing unwanted code parts to get a clean answer to FE
        let parsed;
        {
            let txt = String(getText).trim()
                .replace(/^```(?:json)?\s*/i, '')
                .replace(/\s*```$/i, '')
                .trim();

            try {
                parsed = JSON.parse(txt);
            } catch {
                const first = txt.indexOf('{');
                const last  = txt.lastIndexOf('}');
                if (first !== -1 && last !== -1) {
                    try {
                        parsed = JSON.parse(txt.slice(first, last + 1));
                    } catch {
                        const titleMatch = txt.match(/"title"\s*:\s*"([^"]+)"/);
                        const contentMatch = txt.match(/"content"\s*:\s*"([^"]+)"/);
                        parsed = {
                            title: titleMatch ? titleMatch[1] : "New post", //default would be "new post" if title is missing
                            content: contentMatch ? contentMatch[1] : txt, //
                        };
                    }
                } else {
                    const titleMatch = txt.match(/"title"\s*:\s*"([^"]+)"/);
                    const contentMatch = txt.match(/"content"\s*:\s*"([^"]+)"/);
                    parsed = {
                        title: titleMatch ? titleMatch[1] : "New post",
                        content: contentMatch ? contentMatch[1] : txt,
                    };
                }
            }
        }

        //normalize content and title
        const title = String(parsed?.title || "Untitled post").trim();
        let content = String(parsed?.content || "").trim();

        if (!content) {
            return res.send({ success: false, message: "AI returned empty content" });
        }

        const user = await userDb.findById(req.user._id);
        const post = new postDb({
            //user info comes from jwtDecode
            owner: {
                _id: req.user._id,
                username: user.username //to have correct username if user changes it
            },
            imageUrl,
            mood,
            topic: title,
            content
        });

        await post.save();

        res.send({
            success: true,
            message: "Post created successfully",
            data: { _id: post._id }
        });
    },
    getAllPosts: async (req, res) => {
        const posts = await postDb.find();
        if (!posts || posts.length === 0) {
            return res.send({ success: false, message: "No posts found" });
        }
        res.send({ success: true, data: posts }); //used for homepage
    },
    getSinglePost: async (req, res) => {
        const { postId } = req.params; //from URL
        const foundPost = await postDb.findOne({ _id: postId });
        if (!foundPost) {
            return res.send({ success: false, message: 'Post not found' });
        }
        res.send({ success: true, data: foundPost });
    },
    leaveComment: async (req, res) => {
        const { postId } = req.params;
        const { content } = req.body; //comment text sent by logged user

        if (!content) {
            return res.send({success: false, message: "Comment is empty"});
        }

        const updatedPost = await postDb.findOneAndUpdate(
            { _id: postId },
            { $push: { //pushing new obj into comments array
                comments: {
                    username: req.user.username, //from jwtDecode
                    time: new Date(),
                    content: content.trim()
                }
            }},
            { new: true } //returns updated document with new comments
        );

        if (!updatedPost) {
            return res.send({ success: false, message: "Post not found" });
        }

        res.send({ success: true, message: 'Comment added', data: updatedPost });
    },
};
