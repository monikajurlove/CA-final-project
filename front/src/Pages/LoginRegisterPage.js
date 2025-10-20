import {useRef, useState} from "react";
import {useNavigate} from "react-router-dom";

function LoginRegisterPage({setUser}) {

    const emailRef = useRef();
    const passwordOneRef = useRef();
    const passwordTwoRef = useRef();
    const emailLoginRef = useRef();
    const passwordLoginRef = useRef();

    const [regMessage, setRegMessage] = useState('');
    const [logMessage, setLogMessage] = useState('');

    const navigate = useNavigate();

    function onRegister() {
        const user = {
            email: (emailRef.current.value || "").toLowerCase().trim(),
            passwordOne: passwordOneRef.current.value || "",
            passwordTwo: passwordTwoRef.current.value || "",
        }

        const options= {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        }

        fetch("http://localhost:2500/register", options)
            .then(res => res.json())
            .then(data => {
                console.log(data)
                setRegMessage(data.message);
            })
    }

    function onLogin() {
        const user = {
            email: (emailLoginRef.current.value || "").toLowerCase().trim(),
            password: passwordLoginRef.current.value || ""
        }

        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        }

        fetch("http://localhost:2500/login", options)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.token && data.data) {
                    sessionStorage.setItem('token', data.token);
                    sessionStorage.setItem('user', JSON.stringify(data.data));
                    setUser && setUser(data.data);
                    navigate("/home");
                } else {
                    setLogMessage(data.message);
                }
            })
    }

    return (
        <div className="auth">
            <div className="auth-grid">
                <div className="auth-card">
                    <h3 className="auth-title">Login</h3>
                    <input className="auth-input" type="text" placeholder="Enter your email" ref={emailLoginRef}/>
                    <input className="auth-input" type="password" placeholder="Enter your password" ref={passwordLoginRef}/>
                    <button className="auth-btnPrimary" onClick={onLogin}>Login</button>
                    <p className="auth-msg">{logMessage}</p>
                </div>

                <div className="auth-card">
                    <h3 className="auth-title">Register</h3>
                    <input className="auth-input" type="text" placeholder="Enter your email" ref={emailRef}/>
                    <input className="auth-input" type="password" placeholder="Enter your password" ref={passwordOneRef}/>
                    <input className="auth-input" type="password" placeholder="Repeat password" ref={passwordTwoRef}/>
                    <button className="auth-btnSecondary" onClick={onRegister}>Register</button>
                    <p className="auth-msg">{regMessage}</p>
                </div>
            </div>
        </div>
    );

}

export default LoginRegisterPage;