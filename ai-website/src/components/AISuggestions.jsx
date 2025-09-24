import React, { useEffect, useState } from "react";

function AISuggestions() {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("http://localhost:5000/recommendations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error("Error fetching AI suggestions:", err);
      }
    };

    fetchSuggestions();
  }, []);

  return (
    <div>
      <h2>AI Suggestions</h2>
      {suggestions.length === 0 ? (
        <p>No suggestions yet.</p>
      ) : (
        <ul>
          {suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AISuggestions;
