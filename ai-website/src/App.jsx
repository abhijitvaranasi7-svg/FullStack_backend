import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import Feed from "./components/Feed";
import TextSearch from "./components/TextSearch.jsx";
import AISuggestions from "./components/AISuggestions";



function App() {
    return (
        <Router>
            <nav>
                <Link to="/register">Register</Link> |{" "}
                <Link to="/login">Login</Link> |{" "}
                <Link to="/profile">Profile</Link>
                <Link to="/feed">Feed</Link>
                <Link to="/search">Search</Link>  
                <Link to="/suggestions">AI Suggestions</Link>


            </nav>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/search" element={<TextSearch />} />
                <Route path="/suggestions" element={<AISuggestions />} />

            </Routes>
        </Router>
    );
}

export default App;
