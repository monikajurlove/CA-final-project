import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

function LiveChatPage({ user }) {
    const [messages, setMessages] = useState([]); //chat messages
    const [text, setText] = useState(""); //input text
    const endref = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem("token"); // per tab authentication
        if (!token) {
            navigate("/", { replace: true }); // if auth false, then navigate to login page (private, only logged user can view)
            return;
        }

        socket.emit("join", token); //identify this socket

        //when server confirms 'join', join global chat room
        const onjoined = () => {
            socket.emit("globalJoin");
        };
        const onmessage = (msg) => setMessages((prev) => [...prev, msg]); //add new messages to the state

        socket.on("joined", onjoined);
        socket.on("globalMessage", onmessage);

        return () => {
            socket.off("joined", onjoined);
            socket.off("globalMessage", onmessage);
        };
    }, [navigate]);

    //auto scroll to last message
    useEffect(() => {
        endref.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    function send() {
        const t = text.trim();
        if (!t) return;
        socket.emit("globalMessage", t);
        setText("");
    }

    return (
        <div className="chat">
            <h2 className="chat-title">Global live chat</h2>

            <div className="chat-board">
                {messages.map((m, id) => {
                    const mine = user && String(m.userId) === String(user._id);
                    return (
                        <div key={id} className={`chat-row ${mine ? "is-me" : ""}`}>
                            <div className="chat-bubble">
                                {!mine && <div className="chat-meta">{m.username}</div>}
                                <div className="chat-text">{m.text}</div>
                                <div className="chat-meta">{new Date(m.time).toLocaleTimeString()}</div>
                            </div>
                        </div>
                    );
                })}
                <div ref={endref} />
            </div>

            <div className="chat-compose">
                <input
                    className="chat-input"
                    type="text"
                    placeholder="Write a message…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button type="button" className="chat-send" onClick={send}>Send</button>
            </div>
        </div>
    );
}

export default LiveChatPage;
