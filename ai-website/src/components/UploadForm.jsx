import { useState } from "react";

function UploadForm({ onUpload }) {
    const [content, setContent] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) return alert("Login first!");

        const res = await fetch("http://localhost:5000/upload", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content }),
        });
        const data = await res.json();
        if (data.error) alert(data.error);
        else {
            alert(data.message);
            setContent("");
            if (onUpload) onUpload(); 
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                placeholder="Write something..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
            />
            <br />
            <button type="submit">Upload</button>
        </form>
    );
}

export default UploadForm;
