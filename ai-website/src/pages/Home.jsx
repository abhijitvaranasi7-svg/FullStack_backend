import { useEffect, useState } from "react";

function Home() {
    const [message, setMessage] = useState("Loading...");

    useEffect(() => {
        fetch("http://localhost:5000/") // backend route
            .then((res) => res.text())
            .then((data) => setMessage(data))
            .catch((err) => setMessage("Error: " + err));
    }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Welcome to Home Page</h1>
            <p>Message from Backend:</p>
            <h2>{message}</h2>
        </div>
    );
}

export default Home;
