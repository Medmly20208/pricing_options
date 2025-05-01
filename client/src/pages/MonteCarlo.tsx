import { useState, useEffect } from "react";
import axios from "axios";
import MonteCarloChart from "../components/MonteCarloChart";

type OptionType = "call" | "put";
type Ticker = "AAPL" | "AMZN" | "GOOGL" | "META" | "TSLA" | "NVDA";

interface MonteCarloFormData {
  ticker: Ticker;
  strike: number;
  r: number;
  sigma: number;
  T: number;
  type: OptionType;
  simulations: number;
}

interface MonteCarloResponse {
  ticker: string;
  spot_price: number;
  option_type: OptionType;
  simulations: number;
  simulation_matrix: number[][];
  option_price: number;
}

export default function MonteCarlo() {
  const [form, setForm] = useState<MonteCarloFormData>({
    ticker: "AAPL",
    strike: 100,
    r: 0.01,
    sigma: 0.2,
    T: 1,
    type: "call",
    simulations: 10,
  });

  const [result, setResult] = useState<
    MonteCarloResponse | { error: string } | null
  >(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["strike", "r", "sigma", "T", "simulations"].includes(name)
        ? parseFloat(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post<MonteCarloResponse>(
        "https://pricing-options.onrender.com/monte-carlo",
        form
      );
      setResult(res.data);
      console.log(res.data.simulation_matrix);
      window.scrollTo(0, document.body.scrollHeight);
    } catch {
      setResult({ error: "Error fetching option price" });
    }
  };

  useEffect(() => {
    if (result) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, [result]);

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>Monte Carlo Option Pricing</h2>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <div>
          <label htmlFor="ticker">Ticker:</label>
          <select name="ticker" value={form.ticker} onChange={handleChange}>
            {["AAPL", "AMZN", "GOOGL", "META", "TSLA", "NVDA"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="strike">Strike Price:</label>
          <input
            type="number"
            name="strike"
            value={form.strike}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="r">Rate (r):</label>
          <input
            type="number"
            step="0.01"
            name="r"
            value={form.r}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="sigma">Volatility (σ):</label>
          <input
            type="number"
            step="0.01"
            name="sigma"
            value={form.sigma}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="T">Time to Maturity (T):</label>
          <input
            type="number"
            step="0.01"
            name="T"
            value={form.T}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="simulations">Number of Simulations:</label>
          <input
            type="number"
            name="simulations"
            value={form.simulations}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="type">Option Type:</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="call">Call</option>
            <option value="put">Put</option>
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.5rem",
              backgroundColor: "#00bcd4",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "1rem",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Run Simulation
          </button>
        </div>
      </form>

      {result && (
        <>
          <div>
            {"error" in result ? (
              <p style={{ color: "red" }}>{result.error}</p>
            ) : (
              <>
                <div
                  style={{
                    marginTop: "2rem",
                    backgroundColor: "#f4f4f4",
                    padding: "1rem",
                    borderRadius: "6px",
                  }}
                >
                  <p>
                    <strong>Spot Price:</strong> {result.spot_price}
                  </p>
                  <p>
                    <strong>{form.type.toUpperCase()} Option Price:</strong>{" "}
                    {result.option_price}
                  </p>
                </div>

                <MonteCarloChart data={result?.simulation_matrix} />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
