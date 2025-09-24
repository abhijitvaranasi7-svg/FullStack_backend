import React, { useEffect, useState } from "react";
import Feed from "../components/Feed";

function Profile() {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("You must log in first!");
            window.location.href = "/login";
            return;
        }

        fetch("http://localhost:5000/profile", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (res.status === 401 || res.status === 403) {
                    throw new Error("Unauthorized");
                }
                return res.json();
            })
            .then((data) => setProfile(data))
            .catch(() => {
                alert("Session expired. Please log in again.");
                localStorage.removeItem("token");
                window.location.href = "/login";
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        alert("Logged out");
        window.location.href = "/login";
    };

    if (!profile) return <p>Loading profile...</p>;

    return (
        <div>
            <h2>Profile</h2>
            <p>{profile.message}</p>
            <p>Welcome, {profile.user.username}</p>
            <button onClick={handleLogout}>Logout</button>

            <hr />

            <Feed />
        </div>
    );
}

export default Profile;
