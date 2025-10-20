import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { socket } from "../socket";

function ProfilePage({setUser}) {
    const [loggedUser, setLoggedUser] = useState(null); //full profile obj
    const [msg, setMsg] = useState("");

    const [newUsername, setNewUsername] = useState("");
    const [currentPw, setCurrentPw] = useState("");
    const [newPw1, setNewPw1] = useState("");
    const [newPw2, setNewPw2] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem("token"); // check if user is logged in
        if (!token) {
            navigate("/", { replace: true }); //if not logged in this will navigate user to login page
            return;
        }

        socket.emit("join", token);   //join private room for poke
        refreshProfile();// fetch profile from BE

    }, [navigate]);

    // fetches the freshest profile from backend
    function refreshProfile() {
        const token = sessionStorage.getItem("token"); //get jwt token
        if (!token) return; //// if no token, do nothing (user is not logged in).

        fetch("http://localhost:2500/profilePage", {
            headers: { "Authorization": token }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setLoggedUser(data.data); // store full profile obj
                    setNewUsername(data.data.username); //fill username field
                } else {
                    setMsg(data.message || "Failed to load profile");
                }
            })
            .catch(() => setMsg("Network error"));
    }

    //when someone "pokes" the logged-in user, server emits 'poked'.
    useEffect(() => {
        function onPoked(pokeData) {
            //update loggedUser with new poke
            setLoggedUser(prev => {
                if (!prev) {
                    return prev; //if profile not loaded yet, change nothing
                }
                const updated = { ...prev }; //copy old bj
                updated.pokes = prev.pokes.concat({ //adding new pokes (concat add new elements to array and return full new obj)
                    userId: pokeData.fromUserId,
                    username: pokeData.fromUsername,
                    createdAt: pokeData.at
                });
                return updated;
            });
        }

        socket.on('poked', onPoked);
        return () => socket.off('poked', onPoked);
    }, []);

    // "poke back"
    function pokeBack(targetId) {
        setMsg("");
        const token = sessionStorage.getItem("token");
        if (!token) return setMsg("You must be logged in");

        // block double poke
        if (loggedUser.pokedIds.includes(String(targetId))) {
            return setMsg("You already poked this user");
        }

        fetch(`http://localhost:2500/users/${targetId}/poke`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": token },
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    //update pokedIds array
                    setLoggedUser(prev => {
                        if (!prev) {
                            return prev;
                        }
                        const updated = { ...prev };
                        updated.pokedIds = prev.pokedIds.concat(String(targetId));
                        return updated;
                    });
                    setMsg("Poke sent");
                } else {
                    setMsg(data.message || "Failed to poke back");
                }
            })
            .catch(() => setMsg("Network error"));
    }

    //username update
    function saveUsername() {
        setMsg("");
        const token = sessionStorage.getItem("token");
        if (!token) return setMsg("You must be logged in");

        const username = String(newUsername).trim();
        if (!username) return setMsg("Username is required");

        fetch("http://localhost:2500/profile/update-username", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({username})
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setLoggedUser(prev => prev ? { ...prev, username } : prev); //// update loggedUser, copy old object, replace username
                    setUser && setUser(prev => prev ? { ...prev, username } : prev);// if setUser exists, update user state (copy old object and replace username)

                    // update sessionStorage user (so toolbar shows new username after reload)
                    const ss = sessionStorage.getItem("user");
                    if (ss) {
                        try {
                            const obj = JSON.parse(ss); //parse stored user
                            obj.username = username; //change username
                            sessionStorage.setItem("user", JSON.stringify(obj)); //save updated
                        } catch {}
                    }
                    setMsg("Username updated");
                } else {
                    setMsg(data.message || "Failed to update username");
                }
            })
            .catch(() => setMsg("Network error"));
    }

    //password update
    function savePassword() {
        setMsg("");
        const token = sessionStorage.getItem("token");
        if (!token) return setMsg("You must be logged in");

        //send req to BE with current + new passwords
        fetch("http://localhost:2500/profile/update-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({
                currentPassword: currentPw,
                newPasswordOne: newPw1,
                newPasswordTwo: newPw2
            })
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setMsg("Password updated");
                    setCurrentPw("");
                    setNewPw1("");
                    setNewPw2("");
                } else {
                    setMsg(data.message || "Failed to update password");
                }
            })
            .catch(() => setMsg("Network error"));
    }

    if (!loggedUser) return <div className="mainContainer"><p>Loading…</p></div>; //while user is not received from BE, show loading

    return (
        <div className="prof">
            <div className="prof-section">
                <h2 className="prof-title">Profile information</h2>
                <p className="prof-line">Email: <strong>{loggedUser.email}</strong></p>
                <p className="prof-line">Username: <strong>{loggedUser.username}</strong></p>
            </div>

            <div className="prof-section">
                <h3 className="prof-subtitle">Change username</h3>
                <div className="prof-row">
                    <input
                        className="prof-input"
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="New username"
                    />
                    <button type="button" className="prof-btnPrimary" onClick={saveUsername}>Save</button>
                </div>
            </div>

            <div className="prof-section">
                <h3 className="prof-subtitle">Change password</h3>
                <div className="prof-grid">
                    <input className="prof-input" type="password" placeholder="Current password" value={currentPw} onChange={(e)=>setCurrentPw(e.target.value)}/>
                    <input className="prof-input" type="password" placeholder="New password" value={newPw1} onChange={(e)=>setNewPw1(e.target.value)}/>
                    <input className="prof-input" type="password" placeholder="Repeat new password" value={newPw2} onChange={(e)=>setNewPw2(e.target.value)}/>
                    <button type="button" className="prof-btnSecondary" onClick={savePassword}>Save password</button>
                </div>
            </div>

            <div className="prof-section">
                <h2 className="prof-title">Pokes</h2>
                {!loggedUser.pokes?.length && <p className="prof-line">No pokes yet</p>}

                {(loggedUser.pokes || []).slice().reverse().map((p, idx) => {
                    const alreadyPokedBack = (loggedUser.pokedIds || []).includes(String(p.userId));
                    return (
                        <div key={idx} className="prof-pokeRow">
                            <span className="prof-pokeText"><strong>{p.username}</strong> poked you</span>
                            <Link className="prof-link" to={`/users/${p.userId}`}>(open profile)</Link>
                            {alreadyPokedBack
                                ? <span className="prof-note">— You have poked {p.username} before</span>
                                : <button className="prof-btnPrimary" onClick={() => pokeBack(p.userId)}>Poke back</button>
                            }
                        </div>
                    );
                })}
            </div>

            {msg && <p className="prof-error">{msg}</p>}
        </div>
    );
}

export default ProfilePage;
