import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav style={{ padding: "10px", background: "#eee" }}>
            <Link to="/" style={{ margin: "10px" }}>Home</Link>
            <Link to="/login" style={{ margin: "10px" }}>Login</Link>
            <Link to="/register" style={{ margin: "10px" }}>Register</Link>
        </nav>
    );
}

export default Navbar;
