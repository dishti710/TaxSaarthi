"""
Calculator Agent — pure computation, no NL parsing, no ASI:One-facing code.

Receives a TaxInput message, returns a TaxBreakdown message.

This agent should NOT be the one registered for ASI:One discovery — that's
the Coordinator Agent's job. This one just does math and talks to the
Coordinator over uAgent messaging.

Owner: backend dev (shares logic with backend/routers/tax.py via
agents/common/tax_rules.py — don't duplicate the math, import it).
"""

from uagents import Agent, Context

from agents.common.models import TaxInput, TaxBreakdown
from agents.common import tax_rules

calculator_agent = Agent(
    name="tax_calculator_agent",
    seed="CALCULATOR_AGENT_SEED",  # TODO: load from .env, must be unique & secret
    port=8002,
    endpoint=["http://127.0.0.1:8002/submit"],
)


@calculator_agent.on_message(model=TaxInput, replies=TaxBreakdown)
async def handle_tax_input(ctx: Context, sender: str, msg: TaxInput):
    ctx.logger.info(f"Received TaxInput from {sender}: {msg}")

    breakdown_dict = tax_rules.calculate_tax(
        annual_income=msg.annual_income,
        standard_deduction=msg.standard_deduction,
        employer_nps_contribution=msg.employer_nps_contribution,
    )
    await ctx.send(sender, TaxBreakdown(**breakdown_dict))


if __name__ == "__main__":
    calculator_agent.run()
