import React, { useState } from "react";

function TextSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Error fetching search results:", err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input 
          type="text"
          placeholder="Search for text..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <button type="submit">Search</button>
      </form>

      <div>
        {results.length === 0 ? (
          <p>No results found.</p>
        ) : (
          results.map((post) => (
            <div key={post.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
              <p><strong>{post.username || "Unknown"}</strong>:</p>
              <p>{post.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TextSearch;
