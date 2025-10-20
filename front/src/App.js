import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Toolbar from './Components/Toolbar';
import LoginRegisterPage from './Pages/LoginRegisterPage';
import HomePage from './Pages/HomePage';
import CreatePostPage from './Pages/CreatePostPage';
import SinglePostPage from './Pages/SinglePostPage';
import ProfilePage from './Pages/ProfilePage';
import SingleUserPage from './Pages/SingleUserPage';
import LiveChatPage from './Pages/LiveChatPage';

function App() {
    const [user, setUser] = useState(null);

    //setting user from session storage, so that every tab would have different users and it would set the same user on all tabs
    useEffect(() => {
        const saved = sessionStorage.getItem('user');
        if (saved) setUser(JSON.parse(saved));
    }, []);

    return (
        <BrowserRouter>
            <Toolbar user={user} setUser={setUser} />
            <Routes>
                <Route path="/" element={<LoginRegisterPage setUser={setUser} />} />
                <Route path="/home" element={<HomePage user={user} />} />
                <Route path="/createpost" element={ user ? <CreatePostPage/> : <Navigate to="/" replace /> } />
                <Route path="/posts/:postId" element={<SinglePostPage />} />
                <Route path="/profile" element={ user ? <ProfilePage setUser={setUser}/> : <Navigate to="/" replace /> } />
                <Route path="/users/:userId" element={<SingleUserPage user={user} />} />
                <Route path="/livechat" element={ user ? <LiveChatPage user={user} /> : <Navigate to="/" replace /> } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
