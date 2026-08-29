# API_CONTRACT.md — Tax Action Agent (India, New Regime, FY 2025-26)

Status: DRAFT — pending review (Phase 5). Do not change without team sign-off.

## Base URL

```
http://localhost:8000
```
(Update here once deployed / tunneled — e.g. ngrok URL used for the Agentverse mailbox demo.)

## CORS

All origins allowed for hackathon purposes:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Content-Type
```

## Conventions

- **Content type**: `application/json` for all requests/responses except the PDF download endpoint.
- **IDs**: UUID v4 strings, e.g. `"3fa85f64-5717-4562-b3fc-2c963f66afa6"`.
- **Dates/times**: ISO 8601, UTC, e.g. `"2026-08-29T10:15:00Z"`. Due dates are calendar dates only: `"2026-09-15"`.
- **Currency**: All monetary values are **integers, in whole Indian Rupees (INR)**, no decimals, no currency symbols in the JSON (e.g. `1400000` not `"₹14,00,000"`). Format for display on the frontend.
- **Regime enum**: `"new"` is the only supported value in this MVP. Any other value is rejected (see errors below).

## Common error format

All errors return this shape, with an appropriate HTTP status code:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "annual_income must be a positive integer",
    "field": "annual_income"
  }
}
```

`field` is omitted when the error isn't tied to one field.

Error codes used in this contract: `INVALID_INPUT`, `NOT_FOUND`, `INTERNAL_ERROR`.

## Pagination

Not needed for this MVP — no list endpoints.

---

## Endpoints

### 1. `GET /health`

**Purpose:** Health check.

**Auth:** None.

**Request:** No params, no body.

**Response `200 OK`:**
```json
{ "status": "ok" }
```

No error responses.

---

### 2. `POST /api/tax/calculate`

**Purpose:** Compute tax liability + action plan from structured income input. This is the core endpoint — the frontend can build its entire UI against this single call.

**Auth:** None.

**Request body:**
```json
{
  "annual_income": 1400000,
  "standard_deduction": 75000,
  "employer_nps_contribution": 50000,
  "regime": "new"
}
```

**Fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `annual_income` | integer | **required** | Gross annual salary income, in INR. Must be > 0. |
| `standard_deduction` | integer | optional | Defaults to `75000` (FY2025-26 salaried standard deduction). Frontend should pre-fill this default and let the user override only if they know it differs. |
| `employer_nps_contribution` | integer | optional | Defaults to `0`. The one deduction still allowed under the new regime (Sec 80CCD(2)). |
| `regime` | string enum | optional | Defaults to `"new"`. Only `"new"` is accepted in this MVP — see errors below. |

**Example request:**
```bash
curl -X POST http://localhost:8000/api/tax/calculate \
  -H "Content-Type: application/json" \
  -d '{"annual_income": 1400000, "employer_nps_contribution": 50000}'
```

**Response `200 OK`:**
```json
{
  "report_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "input": {
    "annual_income": 1400000,
    "standard_deduction": 75000,
    "employer_nps_contribution": 50000,
    "regime": "new"
  },
  "breakdown": {
    "gross_income": 1400000,
    "total_deductions": 125000,
    "taxable_income": 1275000,
    "slab_tax": {
      "slabs_applied": [
        { "range": "0-400000", "rate_percent": 0, "tax": 0 },
        { "range": "400000-800000", "rate_percent": 5, "tax": 20000 },
        { "range": "800000-1200000", "rate_percent": 10, "tax": 40000 },
        { "range": "1200000-1275000", "rate_percent": 15, "tax": 11250 }
      ],
      "total_before_rebate": 71250
    },
    "rebate_87a": 0,
    "marginal_relief": 0,
    "tax_after_rebate": 71250,
    "cess_percent": 4,
    "cess_amount": 2850,
    "net_tax_payable": 74100
  },
  "action_plan": {
    "filing_deadline": "2027-07-31",
    "advance_tax_required": true,
    "advance_tax_schedule": [
      { "due_date": "2026-06-15", "percent_of_liability": 15, "amount": 11115 },
      { "due_date": "2026-09-15", "percent_of_liability": 45, "amount": 33345 },
      { "due_date": "2026-12-15", "percent_of_liability": 75, "amount": 55575 },
      { "due_date": "2027-03-15", "percent_of_liability": 100, "amount": 74100 }
    ],
    "optimization_note": "Your taxable income is ₹27,000 above the ₹12,00,000 zero-tax threshold. Increasing employer NPS contribution by ₹27,000/year would bring your net tax to ₹0.",
    "report_download_url": "/api/tax/report/3fa85f64-5717-4562-b3fc-2c963f66afa6/download"
  }
}
```

**Notes on fields:**
- `slabs_applied` only lists slabs actually reached by this income (not all 7 slabs every time).
- `rebate_87a` and `marginal_relief` will be non-zero only when `taxable_income` is at or near the ₹12L threshold — most incomes above ~₹13L will show both as `0`.
- `advance_tax_schedule` amounts are **cumulative** percentages of the full-year liability due by each date, per Indian advance-tax rules — not four equal installments.
- `optimization_note` is a plain-language string generated by the Action-Plan agent; frontend just renders it as-is, no parsing needed.

**Error responses:**

`400 Bad Request` — invalid input:
```json
{ "error": { "code": "INVALID_INPUT", "message": "annual_income must be a positive integer", "field": "annual_income" } }
```

`400 Bad Request` — unsupported regime:
```json
{ "error": { "code": "INVALID_INPUT", "message": "Only the New Regime is supported in this version. Old regime comparison is not implemented.", "field": "regime" } }
```

`500 Internal Server Error`:
```json
{ "error": { "code": "INTERNAL_ERROR", "message": "Something went wrong while calculating tax. Please try again." } }
```

---

### 3. `GET /api/tax/report/{report_id}`

**Purpose:** Re-fetch a previously computed report (e.g. if the user navigates back).

**Auth:** None.

**Path param:** `report_id` (UUID string).

**Example request:**
```bash
curl http://localhost:8000/api/tax/report/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

**Response `200 OK`:** Same shape as the `POST /api/tax/calculate` response body.

**Error responses:**

`404 Not Found`:
```json
{ "error": { "code": "NOT_FOUND", "message": "No report found for this id" } }
```

---

### 4. `GET /api/tax/report/{report_id}/download`

**Purpose:** Download the generated tax action plan as a PDF.

**Auth:** None.

**Path param:** `report_id` (UUID string).

**Response `200 OK`:** Binary PDF stream.
Headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="tax-action-plan-<report_id>.pdf"
```

**Error responses:**

`404 Not Found`:
```json
{ "error": { "code": "NOT_FOUND", "message": "No report found for this id" } }
```

---

### 5. `POST /api/tax/chat` (demo fallback — mirrors the ASI:One NL flow)

**Purpose:** Lets the frontend demo the same natural-language experience as ASI:One, without going through Agentverse — useful as a live-demo backup if the ASI:One connection is unreliable on demo day.

**Auth:** None.

**Request body:**
```json
{ "message": "I earn 14 lakh a year, my employer puts 50000 into NPS for me" }
```

**Fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `message` | string | **required** | Free-text English description of income. |

**Example request:**
```bash
curl -X POST http://localhost:8000/api/tax/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I earn 14 lakh a year, my employer puts 50000 into NPS for me"}'
```

**Response `200 OK`:** Same shape as `POST /api/tax/calculate`, plus one extra field:
```json
{
  "parsed_input": {
    "annual_income": 1400000,
    "employer_nps_contribution": 50000,
    "standard_deduction": 75000,
    "regime": "new"
  },
  "report_id": "...",
  "input": { "...": "..." },
  "breakdown": { "...": "..." },
  "action_plan": { "...": "..." }
}
```

**Error responses:**

`400 Bad Request` — couldn't parse income from the message:
```json
{ "error": { "code": "INVALID_INPUT", "message": "Couldn't find an income amount in your message. Try including a number, e.g. '14 lakh' or '1400000'.", "field": "message" } }
```

---

## Explicit scope note for the frontend dev

Only `"new"` regime, only salaried single-employer income, no auth, no user accounts, no old-regime comparison, no capital gains. If the backend ever returns fields not in this contract, ignore them rather than erroring — but flag it in the team channel, since it means the contract changed.
