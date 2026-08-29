"""
Pure tax-calculation logic for India's New Tax Regime, FY 2025-26 (AY 2026-27).

No I/O, no agent/network code here — this module should be importable and
unit-testable on its own. Owner: backend dev.

Reference numbers (verified as of Budget 2025/2026, subject to double-check
closer to the deadline if tax rules change again):
  - Slabs: 0-4L 0%, 4-8L 5%, 8-12L 10%, 12-16L 15%, 16-20L 20%, 20-24L 25%, 24L+ 30%
  - Standard deduction (salaried): Rs. 75,000
  - Section 87A rebate: up to Rs. 60,000, wipes out tax if taxable income <= Rs. 12,00,000
  - Marginal relief applies just above the Rs. 12,00,000 threshold
  - Health & education cess: 4% on tax after rebate
  - Surcharge (income > Rs. 50L): OUT OF SCOPE for this MVP — do not implement
"""

from typing import List, Tuple

# (lower_bound, upper_bound_exclusive_or_None, rate_percent)
SLABS: List[Tuple[int, int, int]] = [
    (0, 400_000, 0),
    (400_000, 800_000, 5),
    (800_000, 1_200_000, 10),
    (1_200_000, 1_600_000, 15),
    (1_600_000, 2_000_000, 20),
    (2_000_000, 2_400_000, 25),
    (2_400_000, None, 30),
]

STANDARD_DEDUCTION_DEFAULT = 75_000
REBATE_87A_INCOME_THRESHOLD = 1_200_000
REBATE_87A_MAX = 60_000
CESS_PERCENT = 4

ADVANCE_TAX_SCHEDULE_TEMPLATE = [
    # (due_date_month_day, cumulative_percent_of_liability)
    ("06-15", 15),
    ("09-15", 45),
    ("12-15", 75),
    ("03-15", 100),
]

ITR_FILING_DEADLINE_MONTH_DAY = "07-31"


def calculate_slab_tax(taxable_income: int) -> dict:
    """
    Compute slab-wise tax on `taxable_income`.

    Returns a dict matching the `SlabTax` schema in models.py:
        {"slabs_applied": [...], "total_before_rebate": int}

    Only include slabs actually reached by this income (don't emit slabs with
    zero income in them once income is fully below a slab's lower bound).

    TODO(backend owner): implement.
    """
    raise NotImplementedError("TODO: implement calculate_slab_tax")


def apply_rebate_and_marginal_relief(taxable_income: int, tax_before_rebate: int) -> dict:
    """
    Apply Section 87A rebate and marginal relief.

    Returns:
        {"rebate_87a": int, "marginal_relief": int, "tax_after_rebate": int}

    Rules:
      - If taxable_income <= REBATE_87A_INCOME_THRESHOLD: rebate_87a = min(tax_before_rebate, REBATE_87A_MAX),
        tax_after_rebate = tax_before_rebate - rebate_87a (should land at 0 for typical cases).
      - Marginal relief: for taxable_income just above the threshold, tax payable should not
        exceed (taxable_income - REBATE_87A_INCOME_THRESHOLD) — i.e. you never take home less
        post-tax than someone right at the threshold. Only relevant in a narrow band above 12L.

    TODO(backend owner): implement.
    """
    raise NotImplementedError("TODO: implement apply_rebate_and_marginal_relief")


def calculate_tax(annual_income: int, standard_deduction: int = STANDARD_DEDUCTION_DEFAULT,
                   employer_nps_contribution: int = 0) -> dict:
    """
    Full pipeline: gross income -> TaxBreakdown dict (matches models.TaxBreakdown).

    Steps:
      1. total_deductions = standard_deduction + employer_nps_contribution
      2. taxable_income = annual_income - total_deductions
      3. slab_tax = calculate_slab_tax(taxable_income)
      4. rebate/marginal relief = apply_rebate_and_marginal_relief(...)
      5. cess_amount = round(tax_after_rebate * CESS_PERCENT / 100)
      6. net_tax_payable = tax_after_rebate + cess_amount

    TODO(backend owner): implement, using the two helpers above.
    """
    raise NotImplementedError("TODO: implement calculate_tax")


def build_advance_tax_schedule(net_tax_payable: int, financial_year_start: int) -> List[dict]:
    """
    Build the four advance-tax installments for the given liability.

    `financial_year_start` = the year the FY starts (e.g. 2026 for FY2026-27's
    payment cycle following a FY2025-26 income calculation at filing time —
    double check which cycle applies before wiring this into the agent).

    Returns a list of dicts matching AdvanceTaxInstallment:
        [{"due_date": "YYYY-MM-DD", "percent_of_liability": int, "amount": int}, ...]

    TODO(backend owner): implement using ADVANCE_TAX_SCHEDULE_TEMPLATE.
    """
    raise NotImplementedError("TODO: implement build_advance_tax_schedule")


def build_optimization_note(taxable_income: int, net_tax_payable: int) -> str:
    """
    Plain-language nudge, e.g. "You're Rs. X above the zero-tax threshold —
    additional employer NPS contribution of Rs. X would bring your net tax to 0."

    Keep it a single sentence. Only mention the NPS lever (it's the only
    deduction lever available in the new regime for this MVP).

    TODO(backend owner / whoever builds the Action-Plan agent): implement.
    """
    raise NotImplementedError("TODO: implement build_optimization_note")
