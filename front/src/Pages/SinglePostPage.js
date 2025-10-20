import {useEffect, useRef, useState} from "react";
import {useParams} from "react-router-dom";

function SinglePostPage () {

    const [post, setPost] = useState(null); //post obj with comments
    const [message, setMessage] = useState(""); //error info messages

    const commentRef = useRef(); //comment input

    const { postId } = useParams();

    // fetch to get post by id
    useEffect(()=>{
        fetch(`http://localhost:2500/posts/${postId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPost(data.data); //store post in state
                } else {
                    setMessage(data.message);
                }
            })
            .catch(()=> setMessage("Network error, failed to load post"));
    }, [postId])

    //add comment function with fetch
    function onAddComment() {

        const token = sessionStorage.getItem("token");
        if (!token) {
            return setMessage("You must be logged in to comment");
        }

        const text = commentRef.current.value.trim();
        if (!text) {
            return alert("Comment is empty");
        }

        fetch(`http://localhost:2500/comment/${postId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
            },
            body: JSON.stringify({ content: text }),//send comment
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPost(data.data); //update post with new comment
                    commentRef.current.value = ""; //clear comment input value
                } else {
                    alert(data.message || "Failed to add comment");
                }
            })
            .catch(() => setMessage("Network error, failed to add comment"));
    }

    return (
        <div className="spost">
            <div className="spost-wrap">
                <div className="spost-hero">
                    <h2 className="spost-title">{post?.topic}</h2>
                    {post?.imageUrl && <img className="spost-img" src={post?.imageUrl} alt=""/>}
                    <p className="spost-text">{post?.content}</p>
                    <p className="spost-owner">By <strong>{post?.owner?.username}</strong></p>
                </div>

                <p className="spost-message">{message}</p>

                <div className="spost-comments">
                    <h3 className="spost-commentsTitle">Comments section</h3>

                    <div className="spost-list">
                        {post?.comments.map(comment =>
                            <div className="spost-comment" key={comment._id}>
                                <p className="spost-commentText"><strong>{comment.username}:</strong> {comment.content}</p>
                            </div>
                        )}
                    </div>

                    <div className="spost-addRow">
                        <input className="spost-input" type="text" placeholder="Leave a comment" ref={commentRef}/>
                        <button className="spost-btn" onClick={onAddComment}>Comment</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SinglePostPage;