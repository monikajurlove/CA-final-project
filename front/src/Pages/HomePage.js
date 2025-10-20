import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function HomePage({ user }) {
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [errPosts, setErrPosts] = useState("");
    const [loadingPosts, setLoadingPosts] = useState(true);

    // get all users
    useEffect(() => {
        fetch("http://localhost:2500/allUsers")
            .then(res => res.json())
            .then(data => {
                if (!data.success) return;
                const list = data.data || [];
                const filtered = user?._id ? list.filter(u => String(u._id) !== String(user._id)) : list; //if user logged in, shows list without him, if not - full list
                setUsers(filtered);
            })
            .catch(() => {});
    }, [user?._id]);

    // get all posts
    useEffect(() => {
        setLoadingPosts(true);
        setErrPosts("");

        fetch("http://localhost:2500/posts")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPosts(data.data || []);
                }
                else setErrPosts(data.message || "Failed to load posts");
                setLoadingPosts(false);
            })
            .catch(() => {
                setErrPosts("Network error");
                setLoadingPosts(false);
            });
    }, []);

    return (
        <div className="home">
            <div className="home-grid">
                <aside className="home-sidebar">
                    <h3 className="home-sideTitle">User list</h3>
                    <div className="home-userList">
                        {users?.map(u => (
                            <Link to={`/users/${u._id}`} key={u._id} className="home-userCard">
                                <img className="home-userAvatar"
                                     src="https://icons.veryicon.com/png/o/miscellaneous/two-color-icon-library/user-286.png" alt="" />
                                <p className="home-userName">{u?.username}</p>
                            </Link>
                        ))}
                    </div>
                </aside>

                <main className="home-main">
                    <h3 className="home-feedTitle">Feed</h3>
                    {loadingPosts && <p className="home-info">Loading posts…</p>}
                    {errPosts && <p className="home-error">{errPosts}</p>}

                    <div className="home-posts">
                        {posts.map(p => (
                            <div className="home-post" key={p._id}>
                                <Link className="home-postLink" to={`/posts/${p._id}`}>
                                    {p.imageUrl && <img src={p.imageUrl} alt="" className="home-postImg" />}
                                    <h4 className="home-postTitle">{p.topic}</h4>
                                    <p className="home-postText">{p.content}</p>
                                    <div className="home-postOwner">by {p.owner?.username}</div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>

    );
}

export default HomePage;
