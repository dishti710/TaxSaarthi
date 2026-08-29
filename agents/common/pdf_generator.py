"""
PDF generation for the tax action-plan report.

Takes the same data the action-plan agent already computes (TaxBreakdown +
ActionPlan) and renders it into a PDF saved under reports/<report_id>.pdf.

Owner: Member 4. No agent/network code here — pure rendering, so it's
importable and testable on its own, same philosophy as tax_rules.py.
"""

import os
from typing import Any, Dict

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

REPORTS_DIR_DEFAULT = "reports"


def _inr(amount: int) -> str:
    """Format an integer rupee amount with Indian-style comma grouping."""
    s = str(int(amount))
    if len(s) <= 3:
        return f"Rs. {s}"
    last3 = s[-3:]
    rest = s[:-3]
    groups = []
    while len(rest) > 2:
        groups.insert(0, rest[-2:])
        rest = rest[:-2]
    if rest:
        groups.insert(0, rest)
    return f"Rs. {','.join(groups + [last3])}"


def generate_tax_report_pdf(
    report_id: str,
    breakdown: Dict[str, Any],
    action_plan: Dict[str, Any],
    reports_dir: str = REPORTS_DIR_DEFAULT,
) -> str:
    """
    Render breakdown + action_plan into a PDF.

    breakdown: dict matching the /api/tax/calculate "breakdown" shape
               (gross_income, total_deductions, taxable_income, slab_tax,
               rebate_87a, marginal_relief, tax_after_rebate, cess_percent,
               cess_amount, net_tax_payable).
    action_plan: dict matching the "action_plan" shape (filing_deadline,
               advance_tax_required, advance_tax_schedule, optimization_note).

    Returns the absolute path to the generated PDF.
    """
    os.makedirs(reports_dir, exist_ok=True)
    filepath = os.path.join(reports_dir, f"{report_id}.pdf")

    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        title="Tax Action Plan",
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReportTitle", parent=styles["Title"], fontSize=18, spaceAfter=4
    )
    section_style = ParagraphStyle(
        "Section", parent=styles["Heading2"], spaceBefore=16, spaceAfter=8
    )
    meta_style = ParagraphStyle(
        "Meta", parent=styles["Normal"], textColor=colors.grey, spaceAfter=12
    )
    body_style = styles["Normal"]

    story = []

    # --- Header -----------------------------------------------------
    story.append(Paragraph("Tax Action Plan", title_style))
    story.append(Paragraph("New Tax Regime &middot; FY 2026-27", meta_style))
    story.append(Paragraph(f"Report ID: {report_id}", meta_style))
    story.append(Spacer(1, 8))

    # --- Income & deductions summary --------------------------------
    story.append(Paragraph("Income Summary", section_style))
    summary_rows = [
        ["Gross annual income", _inr(breakdown["gross_income"])],
        ["Total deductions", _inr(breakdown["total_deductions"])],
        ["Taxable income", _inr(breakdown["taxable_income"])],
    ]
    story.append(_make_table(summary_rows, col_widths=[9 * cm, 5 * cm]))

    # --- Slab-wise tax -----------------------------------------------
    story.append(Paragraph("Tax Slab Breakdown", section_style))
    slab_header = ["Income range (Rs.)", "Rate", "Tax"]
    slab_rows = [slab_header] + [
        [s["range"], f"{s['rate_percent']}%", _inr(s["tax"])]
        for s in breakdown["slab_tax"]["slabs_applied"]
    ]
    story.append(_make_table(slab_rows, col_widths=[7 * cm, 3 * cm, 4 * cm], header=True))

    # --- Rebate / cess / net tax --------------------------------------
    story.append(Spacer(1, 8))
    final_rows = [
        ["Tax before rebate", _inr(breakdown["slab_tax"]["total_before_rebate"])],
        ["Section 87A rebate", _inr(breakdown["rebate_87a"])],
        ["Marginal relief", _inr(breakdown["marginal_relief"])],
        ["Tax after rebate", _inr(breakdown["tax_after_rebate"])],
        [f"Health & education cess ({breakdown['cess_percent']}%)", _inr(breakdown["cess_amount"])],
        ["Net tax payable", _inr(breakdown["net_tax_payable"])],
    ]
    story.append(_make_table(final_rows, col_widths=[9 * cm, 5 * cm], bold_last_row=True))

    # --- Advance tax schedule ------------------------------------------
    story.append(Paragraph("Advance Tax Schedule", section_style))
    if action_plan.get("advance_tax_required") and action_plan.get("advance_tax_schedule"):
        schedule_header = ["Due date", "Cumulative %", "Amount due (cumulative)"]
        schedule_rows = [schedule_header] + [
            [row["due_date"], f"{row['percent_of_liability']}%", _inr(row["amount"])]
            for row in action_plan["advance_tax_schedule"]
        ]
        story.append(_make_table(schedule_rows, col_widths=[5 * cm, 4 * cm, 5 * cm], header=True))
    else:
        story.append(Paragraph("No advance tax is required for this liability.", body_style))

    # --- Filing deadline + optimization note ----------------------------
    story.append(Paragraph("Key Dates & Recommendation", section_style))
    story.append(Paragraph(f"<b>ITR filing deadline:</b> {action_plan['filing_deadline']}", body_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph(action_plan["optimization_note"], body_style))

    # --- Footer --------------------------------------------------------
    story.append(Spacer(1, 24))
    story.append(Paragraph(
        "This report is generated for informational purposes only and does not "
        "constitute professional tax advice.",
        meta_style,
    ))

    doc.build(story)
    return os.path.abspath(filepath)


def _make_table(rows, col_widths, header: bool = False, bold_last_row: bool = False) -> Table:
    table = Table(rows, colWidths=col_widths)
    style = [
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.HexColor("#dddddd")),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
    ]
    if header:
        style += [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f0f0f0")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ]
    if bold_last_row:
        style += [("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold")]
    table.setStyle(TableStyle(style))
    return table


if __name__ == "__main__":
    # Quick manual smoke test with the same numbers from the API contract example.
    sample_breakdown = {
        "gross_income": 1400000,
        "total_deductions": 125000,
        "taxable_income": 1275000,
        "slab_tax": {
            "slabs_applied": [
                {"range": "0-400000", "rate_percent": 0, "tax": 0},
                {"range": "400000-800000", "rate_percent": 5, "tax": 20000},
                {"range": "800000-1200000", "rate_percent": 10, "tax": 40000},
                {"range": "1200000-1275000", "rate_percent": 15, "tax": 11250},
            ],
            "total_before_rebate": 71250,
        },
        "rebate_87a": 0,
        "marginal_relief": 0,
        "tax_after_rebate": 71250,
        "cess_percent": 4,
        "cess_amount": 2850,
        "net_tax_payable": 74100,
    }
    sample_action_plan = {
        "filing_deadline": "2027-07-31",
        "advance_tax_required": True,
        "advance_tax_schedule": [
            {"due_date": "2026-06-15", "percent_of_liability": 15, "amount": 11115},
            {"due_date": "2026-09-15", "percent_of_liability": 45, "amount": 33345},
            {"due_date": "2026-12-15", "percent_of_liability": 75, "amount": 55575},
            {"due_date": "2027-03-15", "percent_of_liability": 100, "amount": 74100},
        ],
        "optimization_note": (
            "An additional employer NPS contribution (Section 80CCD(2)) of roughly "
            "Rs. 75,000 would bring your taxable income down to the Rs. 12,00,000 "
            "zero-tax threshold under the new regime."
        ),
    }
    path = generate_tax_report_pdf("test-report-id", sample_breakdown, sample_action_plan)
    print(f"Sample PDF written to: {path}")