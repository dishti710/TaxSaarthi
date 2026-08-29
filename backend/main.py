"""
FastAPI app — the demo-safety-net API described in API_CONTRACT.md.

Also usable internally by the agents for report storage/PDF generation if
that ends up being simpler than duplicating logic in the agent processes —
team's call once building starts.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import tax

app = FastAPI(title="Tax Action Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(tax.router, prefix="/api/tax", tags=["tax"])


@app.get("/health")
async def health():
    return {"status": "ok"}
