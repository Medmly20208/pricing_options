import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();

  return (
    <div className="sidebar">
      <h2 className="logo">OptionSim</h2>
      <Link
        to="/black-scholes"
        className={location.pathname === "/black-scholes" ? "active" : ""}
      >
        Black-Scholes
      </Link>
      <Link
        to="/monte-carlo"
        className={location.pathname === "/monte-carlo" ? "active" : ""}
      >
        Monte Carlo
      </Link>
      <Link
        to="/euler-maryauma"
        className={location.pathname === "/euler-maryauma" ? "active" : ""}
      >
        Euler Maryauma
      </Link>
    </div>
  );
}
