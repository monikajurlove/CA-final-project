import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function SingleUserPage({user}) {
    const { userId } = useParams();
    const [userData, setUserData] = useState(null); //selected user info
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(true);
    const [hasPoked, setHasPoked] = useState(false);

    // check logged user pokedIds to see if target user was poked
    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        fetch("http://localhost:2500/profilePage", {
            headers: { "Authorization": token }
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    const ids = data.data?.pokedIds || [];
                    setHasPoked(ids.includes(String(userId))); //mark as already poked
                }
            })
            .catch(() => {});
    }, [userId]);

    //fetch selected user data by id
    useEffect(() => {
        setLoading(true);
        setMsg("");

        fetch(`http://localhost:2500/users/${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUserData(data.data);//store user
                } else {
                    setMsg(data.message || "User not found");
                }
            })
            .catch(() => {
                setMsg("Network error");
            })
            .finally(() => setLoading(false));     //to stop loading
    }, [userId]);

    //if viewing own profile
    const isCurrentUser = user && String(user._id) === String(userId);

    function poke() {
        setMsg("");
        const token = sessionStorage.getItem("token");
        if (!token) return setMsg("You must be logged in to poke");

        fetch(`http://localhost:2500/users/${userId}/poke`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": token }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setMsg("Poke sent!");
                    setHasPoked(true); //lock poke btn
                } else {
                    setMsg(data.message || "Failed to poke");
                    if (data.message === "You already poked this user") {
                        setHasPoked(true); // lock poke btn if already poked before
                    }
                }
            })
            .catch(() => setMsg("Network error"));
    }

    //loading and errors
    if (loading) return <div className="mainContainer"><p>Loading…</p></div>;
    if (!userData) return <div className="mainContainer"><p>{msg || "User not found"}</p></div>;

    return (
        <div className="suser">
            <div className="suser-card">
                <div className="suser-hero">
                    <div className="suser-avatar">
                        <img
                            src="https://icons.veryicon.com/png/o/miscellaneous/two-color-icon-library/user-286.png"
                            alt=""
                        />
                    </div>

                    <h2 className="suser-name">{userData.username}</h2>

                    <div className="suser-actions">
                        {!isCurrentUser && (
                            hasPoked
                                ? <div className="suser-note">You already poked this user</div>
                                : <button className="suser-btn" onClick={poke}>Poke</button>
                        )}
                    </div>

                    <p className="suser-msg">{msg}</p>
                </div>
            </div>
        </div>
    );
}

export default SingleUserPage;
