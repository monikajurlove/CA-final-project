import { Link, useNavigate } from "react-router-dom";

function Toolbar({ user, setUser}) {

    const navigate = useNavigate();

    function handleLogout() {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setUser(null);
        navigate("/");
    }

    return (
        <div className="tb">
            <div className="tb-bar">
                <div className="tb-navLeft">
                    <Link className="tb-link" to="/home">Main page</Link>
                    {user && (
                        <>
                            <Link className="tb-link" to="/createpost">Create post</Link>
                            <Link className="tb-link" to="/livechat">Live chat</Link>
                        </>
                    )}
                </div>

                <div className="tb-navRight">
                    {user ? (
                        <>
                            <p className="tb-status">Logged in as: {user.username}</p>
                            <Link className="tb-link" to="/profile">My profile</Link>
                            <svg onClick={handleLogout} className="logoutBtn" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M14 20H6C4.89543 20 4 19.1046 4 18L4 6C4 4.89543 4.89543 4 6 4H14M10 12H21M21 12L18 15M21 12L18 9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                        </>
                    ) : ""}
                </div>
            </div>
        </div>

    );
}

export default Toolbar;
