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
    if taxable_income < 0:
        taxable_income = 0

    slabs_applied = []
    total_before_rebate = 0

    for lower, upper, rate in SLABS:
        if taxable_income <= lower:
            break

        slab_top = upper if upper is not None else taxable_income
        amount_in_slab = min(taxable_income, slab_top) - lower
        if amount_in_slab <= 0:
            continue

        tax_in_slab = round(amount_in_slab * rate / 100)
        slabs_applied.append({
            "range": f"{lower}-{upper if upper is not None else 'above'}",
            "rate_percent": rate,
            "tax": tax_in_slab,
        })
        total_before_rebate += tax_in_slab

    return {"slabs_applied": slabs_applied, "total_before_rebate": total_before_rebate}


def apply_rebate_and_marginal_relief(taxable_income: int, tax_before_rebate: int) -> dict:
    if taxable_income <= REBATE_87A_INCOME_THRESHOLD:
        rebate = min(tax_before_rebate, REBATE_87A_MAX)
        return {
            "rebate_87a": rebate,
            "marginal_relief": 0,
            "tax_after_rebate": tax_before_rebate - rebate,
        }

    excess_over_threshold = taxable_income - REBATE_87A_INCOME_THRESHOLD
    if tax_before_rebate > excess_over_threshold:
        relief = tax_before_rebate - excess_over_threshold
        tax_after_rebate = excess_over_threshold
    else:
        relief = 0
        tax_after_rebate = tax_before_rebate

    return {"rebate_87a": 0, "marginal_relief": relief, "tax_after_rebate": tax_after_rebate}


def calculate_tax(annual_income: int, standard_deduction: int = STANDARD_DEDUCTION_DEFAULT,
                   employer_nps_contribution: int = 0) -> dict:
    total_deductions = standard_deduction + employer_nps_contribution
    taxable_income = max(0, annual_income - total_deductions)

    slab_tax = calculate_slab_tax(taxable_income)
    rebate_result = apply_rebate_and_marginal_relief(taxable_income, slab_tax["total_before_rebate"])

    tax_after_rebate = rebate_result["tax_after_rebate"]
    cess_amount = round(tax_after_rebate * CESS_PERCENT / 100)
    net_tax_payable = tax_after_rebate + cess_amount

    return {
        "gross_income": annual_income,
        "total_deductions": total_deductions,
        "taxable_income": taxable_income,
        "slab_tax": slab_tax,
        "rebate_87a": rebate_result["rebate_87a"],
        "marginal_relief": rebate_result["marginal_relief"],
        "tax_after_rebate": tax_after_rebate,
        "cess_percent": CESS_PERCENT,
        "cess_amount": cess_amount,
        "net_tax_payable": net_tax_payable,
    }


def build_advance_tax_schedule(net_tax_payable: int, financial_year_start: int) -> List[dict]:
    if net_tax_payable <= 10_000:
        return []

    schedule = []
    cumulative_paid = 0

    for month_day, cumulative_percent in ADVANCE_TAX_SCHEDULE_TEMPLATE:
        month = month_day.split("-")[0]
        year = financial_year_start + 1 if month == "03" else financial_year_start
        cumulative_amount = round(net_tax_payable * cumulative_percent / 100)
        installment_amount = cumulative_amount - cumulative_paid

        schedule.append({
            "due_date": f"{year}-{month_day}",
            "percent_of_liability": cumulative_percent,
            "amount": cumulative_amount,
        })
        cumulative_paid = cumulative_amount

    return schedule


def build_optimization_note(taxable_income: int, net_tax_payable: int) -> str:
    if net_tax_payable == 0:
        return "Your net tax payable is already zero under the new regime — no further action needed."

    if taxable_income > REBATE_87A_INCOME_THRESHOLD:
        gap = taxable_income - REBATE_87A_INCOME_THRESHOLD
        if gap <= 500_000:
            return (
                f"An additional employer NPS contribution (Section 80CCD(2)) of roughly "
                f"Rs. {gap:,} would bring your taxable income down to the Rs. 12,00,000 "
                f"zero-tax threshold under the new regime."
            )
        return (
            "Your taxable income is well above the zero-tax threshold, so reaching "
            "zero tax via employer NPS alone isn't realistic — maximizing your "
            "Section 80CCD(2) employer NPS contribution is still the main lever "
            "available in the new regime to reduce taxable income."
        )

    return "You're within the zero-tax threshold already; no further deduction is needed."