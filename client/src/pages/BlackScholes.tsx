import { useState, useEffect } from "react";
import axios from "axios";

type OptionType = "call" | "put";
type Ticker = "AAPL" | "AMZN" | "GOOGL" | "META" | "TSLA" | "NVDA";

interface FormData {
  ticker: Ticker;
  strike: number;
  r: number;
  sigma: number;
  T: number;
  type: OptionType;
}

interface ResponseData {
  ticker: string;
  spot_price: number;
  option_type: OptionType;
  option_price: number;
}

export default function BlackScholes() {
  const [form, setForm] = useState<FormData>({
    ticker: "AAPL",
    strike: 100,
    r: 0.01,
    sigma: 0.2,
    T: 1,
    type: "call",
  });

  const [result, setResult] = useState<ResponseData | { error: string } | null>(
    null
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["strike", "r", "sigma", "T"].includes(name)
        ? parseFloat(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post<ResponseData>(
        "http://localhost:8000/black-scholes",
        form
      );
      setResult(res.data);
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
      <h2>Black-Scholes Option Calculator</h2>
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
            placeholder="Strike Price"
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
            placeholder="Rate (r)"
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
            placeholder="Volatility (σ)"
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
            placeholder="Time to Maturity (T)"
            value={form.T}
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
              width: "100%", // full width
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
            Calculate
          </button>
        </div>
      </form>

      {result && (
        <div
          style={{
            marginTop: "2rem",
            backgroundColor: "#f4f4f4",
            padding: "1rem",
            borderRadius: "6px",
          }}
        >
          {"error" in result ? (
            <p style={{ color: "red" }}>{result.error}</p>
          ) : (
            <>
              <p>
                <strong>Spot Price:</strong> {result.spot_price}
              </p>
              <p>
                <strong>{form.type.toUpperCase()} Option Price:</strong>{" "}
                {result.option_price}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
