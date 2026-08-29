# TaxSaarthi Frontend

A Vite + React scaffold around the TaxSaarthi landing page, with the
"Calculate your tax action plan" section wired to the real backend
(`POST /api/tax/calculate` per `API_CONTRACT.md`).

## What changed from the original files

The original `UploadSection` component (PDF drag-and-drop) was a fully
simulated demo — fake progress bars, no real request. It's been replaced
with a real form (annual income + employer NPS contribution) that calls
your backend and renders the actual response: taxable income, net tax
payable, filing deadline, advance-tax schedule, optimization note, and a
working "Download PDF report" button.

PDF upload / document parsing was intentionally left out — not built yet,
per plan.

## Setup

```bash
npm install
```

## Configure the backend URL

Edit `.env`:

```
VITE_API_BASE_URL=http://localhost:8000
```

Change this if your FastAPI backend runs on a different host/port, or once
you deploy it somewhere.

## Run

You need **both** servers running at the same time, in two terminals:

**Terminal 1 — backend** (from your backend repo):
```bash
uvicorn main:app --reload --port 8000
```
(Use whatever command you normally use to start the FastAPI app — this is
just the typical one. Confirm it's serving at the URL in `.env`.)

**Terminal 2 — frontend** (this folder):
```bash
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Test it end-to-end

1. Open the site, scroll to (or click "Try TaxSaarthi" to jump to) the
   **"Calculate your tax action plan"** section.
2. Enter an annual income, e.g. `1400000`, and an employer NPS
   contribution, e.g. `50000`.
3. Click **Calculate my tax**.
4. You should see: taxable income, net tax payable, the ITR filing
   deadline, the advance-tax schedule table, and the optimization note.
5. Click **Download PDF report** — it should open/download a real PDF in
   a new tab.
6. Click **Calculate another** to reset and try different numbers.

## If something goes wrong

- **"Couldn't reach the backend..."** — the backend isn't running, or
  isn't on the port in `.env`. Confirm `curl http://localhost:8000/health`
  returns `{"status": "ok"}` first.
- **A red error message with a specific field name** — that's the
  backend's validation error (e.g. bad income value) being shown as-is;
  this is expected behavior, not a bug.
- **CORS error in the browser console** — confirm the backend has CORS
  enabled for all origins, per `API_CONTRACT.md`.
- **Download button does nothing / 404s** — confirm `pdf_generator.py`
  is in place on the backend and `reportlab` is installed there.

## Project structure

```
src/
  main.jsx                        # Vite entry point
  TaxSaarthiLanding_updated.jsx   # Main app (landing page + connected calculator)
  Logo.jsx                        # Wordmark component (unchanged)
  ProductHeroVisual.jsx           # Product page hero visual (unchanged)
  assets/taxsaarthi-logo.png      # Logo asset (unchanged, not currently imported)
```
