// Thin fetch wrappers matching API_CONTRACT.md exactly.
// Swap the base URL via VITE_API_BASE_URL in .env — don't hardcode it elsewhere.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    // data.error = { code, message, field? } — see API_CONTRACT.md
    throw new Error(data?.error?.message || "Request failed");
  }
  return data;
}

export async function calculateTax({ annual_income, standard_deduction, employer_nps_contribution, regime }) {
  const res = await fetch(`${BASE_URL}/api/tax/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ annual_income, standard_deduction, employer_nps_contribution, regime }),
  });
  return handleResponse(res);
}

export async function chatTax(message) {
  const res = await fetch(`${BASE_URL}/api/tax/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return handleResponse(res);
}

export async function getReport(reportId) {
  const res = await fetch(`${BASE_URL}/api/tax/report/${reportId}`);
  return handleResponse(res);
}

export function reportDownloadUrl(reportId) {
  return `${BASE_URL}/api/tax/report/${reportId}/download`;
}
