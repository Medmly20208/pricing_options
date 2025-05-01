import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import BlackScholes from "./pages/BlackScholes";
import MonteCarlo from "./pages/MonteCarlo";
import EulerMaryouma from "./pages/EulerMaryauma";

function App() {
  return (
    <Router>
      <div style={{ display: "flex" }}>
        <Navbar />
        <div style={{ marginLeft: "200px", width: "100%" }}>
          <Routes>
            <Route path="/" element={<Navigate to="/black-scholes" />} />
            <Route path="/black-scholes" element={<BlackScholes />} />
            <Route path="/monte-carlo" element={<MonteCarlo />} />
            <Route path="/euler-maruyama" element={<EulerMaryouma />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
