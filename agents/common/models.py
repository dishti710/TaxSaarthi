"""
Shared message/data schemas used across all three agents AND the FastAPI backend.

These mirror the JSON shapes defined in API_CONTRACT.md exactly — if you change
a field here, update API_CONTRACT.md in the same commit and tell the team.
"""

from typing import List, Literal, Optional
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Input
# ---------------------------------------------------------------------------

class TaxInput(BaseModel):
    annual_income: int
    standard_deduction: int = 75_000
    employer_nps_contribution: int = 0
    regime: Literal["new"] = "new"


class ChatInput(BaseModel):
    """Raw natural-language input, before parsing into TaxInput."""
    message: str


# ---------------------------------------------------------------------------
# Calculator Agent output
# ---------------------------------------------------------------------------

class SlabApplied(BaseModel):
    range: str            # e.g. "400000-800000"
    rate_percent: int
    tax: int


class SlabTax(BaseModel):
    slabs_applied: List[SlabApplied]
    total_before_rebate: int


class TaxBreakdown(BaseModel):
    gross_income: int
    total_deductions: int
    taxable_income: int
    slab_tax: SlabTax
    rebate_87a: int
    marginal_relief: int
    tax_after_rebate: int
    cess_percent: int = 4
    cess_amount: int
    net_tax_payable: int


# ---------------------------------------------------------------------------
# Action-Plan Agent output
# ---------------------------------------------------------------------------

class AdvanceTaxInstallment(BaseModel):
    due_date: str          # ISO date, "YYYY-MM-DD"
    percent_of_liability: int
    amount: int


class ActionPlan(BaseModel):
    filing_deadline: str   # ISO date
    advance_tax_required: bool
    advance_tax_schedule: List[AdvanceTaxInstallment]
    optimization_note: str
    report_download_url: str


# ---------------------------------------------------------------------------
# Full report (what the Coordinator Agent / FastAPI return to the caller)
# ---------------------------------------------------------------------------

class TaxReport(BaseModel):
    report_id: str
    input: TaxInput
    breakdown: TaxBreakdown
    action_plan: ActionPlan


class ChatTaxReport(TaxReport):
    """Same as TaxReport, plus what was parsed out of the NL message."""
    parsed_input: TaxInput
