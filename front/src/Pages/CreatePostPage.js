import { useRef, useState, useEffect } from "react";
import {useNavigate} from "react-router-dom";

function CreatePostPage() {

    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem("token"); //check if has token
        if (!token) navigate("/"); //if not, redirect to login page
    }, [navigate]); //only when navigate changes

    const [mood, setMood] = useState(null); //selected mood state
    const [msg, setMsg] = useState(""); //error state
    const [loading, setLoading] = useState(false);

    const imageUrlRef = useRef(); //user img ref
    const promptRef = useRef();//user message ref

    //set user chosen mood
    function select(m) {
        setMood(m);
        setMsg("");
    }

    function createPost() {
        setMsg("");
        if (!mood) return setMsg("Please choose a mood first");
        if (!imageUrlRef.current.value.trim()) return setMsg("Please provide image URL");
        if (!promptRef.current.value.trim()) return setMsg("Please tell AI what to create");

        const token = sessionStorage.getItem("token");
        if (!token) return setMsg("You must be logged in");

        setLoading(true);

        fetch("http://localhost:2500/posts/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({
                imageUrl: imageUrlRef.current.value.trim(),
                prompt: promptRef.current.value.trim(),
                mood
            })
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setMsg("Post created successfully.");
                    //if success clear inputs
                    imageUrlRef.current.value = "";
                    promptRef.current.value = "";
                } else {
                    setMsg(data.message || "Failed to create post");
                }
            })
            .catch(() => setMsg("Network error"))
            .finally(() => setLoading(false)); //stop loading
    }

    return (
        <div className="cpost">
            <h2 className="cpost-title">Create post</h2>

            <div className="cpost-card">
                <p className="cpost-sub">Select mood for the post</p>

                <div className="cpost-moods">
                    <button className={`cpost-moodBtn ${mood==="wholesome"?"is-active":""}`} onClick={()=>select("wholesome")}>Wholesome</button>
                    <button className={`cpost-moodBtn ${mood==="poetic"?"is-active":""}`} onClick={()=>select("poetic")}>Poetic</button>
                    <button className={`cpost-moodBtn ${mood==="witty"?"is-active":""}`} onClick={()=>select("witty")}>Witty</button>
                    <button className={`cpost-moodBtn ${mood==="mysterious"?"is-active":""}`} onClick={()=>select("mysterious")}>Mysterious</button>
                </div>

                <input className="cpost-input" type="text" placeholder="Photo URL" ref={imageUrlRef} />

                <div className="cpost-row">
                    <input className="cpost-input" type="text" placeholder="Tell AI what to create" ref={promptRef}/>
                    <button className="cpost-submit" onClick={createPost} disabled={loading}>
                        {loading ? "Creating..." : "Create post"}
                    </button>
                </div>

                <p className="cpost-msg">{msg}</p>
            </div>
        </div>
    );
}

export default CreatePostPage;
