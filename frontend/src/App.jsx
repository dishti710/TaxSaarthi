import { useState } from "react";
import { chatTax } from "./api";

// Starter scaffold — replace with real UI. Wired to /api/tax/chat as the
// quickest path to an end-to-end demo; swap to calculateTax() for a form-based
// flow if that ends up feeling more reliable for the live demo.

export default function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    try {
      const data = await chatTax(message);
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Tax Action Agent</h1>
      <form onSubmit={handleSubmit}>
        <input
          style={{ width: "100%", padding: 8 }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="I earn 14 lakh a year..."
        />
        <button type="submit" style={{ marginTop: 8 }}>Calculate</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <pre style={{ background: "#f5f5f5", padding: 16, marginTop: 16 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
