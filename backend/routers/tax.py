"""
REST endpoints matching API_CONTRACT.md exactly. Frontend builds against
this — do not change response shapes without updating API_CONTRACT.md and
telling Member 2.
"""

import os
import uuid
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from agents.common.models import TaxInput, ChatInput, TaxReport, ChatTaxReport
from agents.common import tax_rules
from agents.common.pdf_generator import generate_tax_report_pdf

router = APIRouter()

# NOTE: hardcoded to 2026 for the demo (FY2026-27 advance-tax cycle) —
# same assumption used in agents/tax_actionplan_agent.py.
FINANCIAL_YEAR_START = 2026

REPORTS_DIR = "reports"

# In-memory store for the hackathon — swap for SQLite if the demo needs
# reports to survive a server restart. Keyed by report_id.
_REPORTS: dict = {}


@router.post("/calculate", response_model=TaxReport)
async def calculate_tax(payload: TaxInput):
    if payload.annual_income <= 0:
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "INVALID_INPUT",
                               "message": "annual_income must be a positive integer",
                               "field": "annual_income"}},
        )

    from agents.common.models import TaxBreakdown, ActionPlan

    breakdown_dict = tax_rules.calculate_tax(
        annual_income=payload.annual_income,
        standard_deduction=payload.standard_deduction,
        employer_nps_contribution=payload.employer_nps_contribution,
    )
    breakdown = TaxBreakdown(**breakdown_dict)

    schedule = tax_rules.build_advance_tax_schedule(breakdown.net_tax_payable, financial_year_start=FINANCIAL_YEAR_START)
    note = tax_rules.build_optimization_note(breakdown.taxable_income, breakdown.net_tax_payable)

    report_id = str(uuid.uuid4())
    filing_deadline = f"{FINANCIAL_YEAR_START + 1}-{tax_rules.ITR_FILING_DEADLINE_MONTH_DAY}"

    generate_tax_report_pdf(
        report_id=report_id,
        breakdown=breakdown.dict(),
        action_plan={
            "filing_deadline": filing_deadline,
            "advance_tax_required": len(schedule) > 0,
            "advance_tax_schedule": schedule,
            "optimization_note": note,
        },
        reports_dir=REPORTS_DIR,
    )

    action_plan = ActionPlan(
        filing_deadline=filing_deadline,
        advance_tax_required=len(schedule) > 0,
        advance_tax_schedule=schedule,
        optimization_note=note,
        report_download_url=f"/api/tax/report/{report_id}/download",
    )

    report = TaxReport(report_id=report_id, input=payload, breakdown=breakdown, action_plan=action_plan)
    _REPORTS[report_id] = report
    return report


@router.get("/report/{report_id}", response_model=TaxReport)
async def get_report(report_id: str):
    report = _REPORTS.get(report_id)
    if not report:
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "NOT_FOUND", "message": "No report found for this id"}},
        )
    return report


@router.get("/report/{report_id}/download")
async def download_report(report_id: str):
    path = os.path.join(REPORTS_DIR, f"{report_id}.pdf")
    if not os.path.exists(path):
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "NOT_FOUND", "message": "No report found for this id"}},
        )
    return FileResponse(
        path,
        media_type="application/pdf",
        filename=f"tax-action-plan-{report_id}.pdf",
    )


@router.post("/chat", response_model=ChatTaxReport)
async def chat(payload: ChatInput):
    # TODO: reuse the same NL parsing as agents/coordinator_agent.py
    # (consider moving parse_income_from_text into agents/common so both
    # the agent and this endpoint call the same implementation)
    raise HTTPException(
        status_code=400,
        detail={"error": {"code": "INVALID_INPUT",
                           "message": "Couldn't find an income amount in your message. "
                                      "Try including a number, e.g. '14 lakh' or '1400000'.",
                           "field": "message"}},
    )