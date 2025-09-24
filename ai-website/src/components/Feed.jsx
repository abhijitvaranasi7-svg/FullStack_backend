import React, { useEffect, useState } from "react";

function Recommendations() {
    const [suggestions, setSuggestions] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) return;

        fetch("http://localhost:5000/recommendations", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setSuggestions(data.suggestions || []))
            .catch((err) => console.error("Error fetching recommendations:", err));
    }, [token]);

    if (suggestions.length === 0) return null;

    return (
        <div style={{ marginTop: "20px" }}>
            <h3>AI Suggestions</h3>
            <ul>
                {suggestions.map((s, idx) => (
                    <li key={idx}>{s}</li>
                ))}
            </ul>
        </div>
    );
}

function Feed() {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const token = localStorage.getItem("token");

    const fetchPosts = async () => {
        try {
            const res = await fetch("http://localhost:5000/posts", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setPosts(data);
        } catch (err) {
            console.error("Error fetching posts:", err);
        }
    };

    useEffect(() => {
        if (token) fetchPosts();
    }, [token]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        try {
            const res = await fetch("http://localhost:5000/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newPost }),
            });
            const data = await res.json();
            if (data.message) {
                setNewPost("");
                fetchPosts(); // refresh feed
            }
        } catch (err) {
            console.error("Error uploading post:", err);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/search?q=${encodeURIComponent(searchQuery)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setSearchResults(data);
        } catch (err) {
            console.error("Error searching posts:", err);
        }
    };

    if (!token) return <p>Please log in to see the feed.</p>;

    return (
        <div>
            <h2>Feed</h2>

            <form onSubmit={handleUpload}>
                <input
                    type="text"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What's on your mind?"
                />
                <button type="submit">Post</button>
            </form>

            <form onSubmit={handleSearch} style={{ marginTop: "10px" }}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search posts..."
                />
                <button type="submit">Search</button>
            </form>

            {searchResults.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Search Results</h3>
                    {searchResults.map((post) => (
                        <div key={post.id} style={{ border: "1px solid #ccc", margin: "5px", padding: "5px" }}>
                            <p><strong>{post.username || "Unknown"}</strong>:</p>
                            <p>{post.content}</p>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ marginTop: "20px" }}>
                {posts.length === 0 ? (
                    <p>No posts yet.</p>
                ) : (
                    posts.map((post) => (
                        <div key={post.id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
                            <p><strong>{post.username || "Unknown"}</strong>:</p>
                            <p>{post.content}</p>
                        </div>
                    ))
                )}
            </div>

            <Recommendations />
        </div>
    );
}

export default Feed;
