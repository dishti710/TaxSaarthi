"""
Throwaway test script — NOT part of the final submission.

Acts as a fake coordinator: sends a TaxInput straight to the Calculator
agent, waits for TaxBreakdown, forwards it to the Action-Plan agent, prints
the final ActionPlan. Confirms agent-to-agent messaging works before adding
ASI:One / mailbox / Chat Protocol into the mix.

Usage:
  1. Make sure calculator_agent.py and actionplan_agent.py are both running
     in separate terminals first.
  2. Paste their printed addresses into the two CONSTANTS below.
  3. Run: python test_agent_chain.py
  4. Watch this terminal AND the calculator/actionplan terminals for logs.
"""

from uagents import Agent, Context

from agents.common.models import TaxInput, TaxBreakdown, ActionPlan

# PASTE the addresses printed by your running agents here:
CALCULATOR_AGENT_ADDRESS = "agent1qw208p63h7yjhyju2sqwhtsnxygh4av46whphdxwyd5cp3936t6uz2ek0sr"
ACTIONPLAN_AGENT_ADDRESS = "agent1qt0v7k8h2a03vjegcq9rnw9wgad59k6rtwfqaw6cewp60jxe8mq9ch5tqz9"

test_agent = Agent(
    name="test_fake_coordinator",
    seed="test-fake-coordinator-seed",
    port=8099,
    endpoint=["http://127.0.0.1:8099/submit"],
)

@test_agent.on_event("startup")
async def send_test_input(ctx: Context):
    ctx.logger.info("Sending TaxInput to Calculator agent...")
    tax_input = TaxInput(annual_income=1_400_000, employer_nps_contribution=50_000)
    await ctx.send(CALCULATOR_AGENT_ADDRESS, tax_input)


@test_agent.on_message(model=TaxBreakdown)
async def handle_breakdown(ctx: Context, sender: str, msg: TaxBreakdown):
    ctx.logger.info(f"Got TaxBreakdown back: net_tax_payable={msg.net_tax_payable}")
    ctx.logger.info("Forwarding to Action-Plan agent...")
    await ctx.send(ACTIONPLAN_AGENT_ADDRESS, msg)


@test_agent.on_message(model=ActionPlan)
async def handle_action_plan(ctx: Context, sender: str, msg: ActionPlan):
    ctx.logger.info("=" * 60)
    ctx.logger.info("FULL CHAIN WORKED. Final ActionPlan:")
    ctx.logger.info(f"  filing_deadline: {msg.filing_deadline}")
    ctx.logger.info(f"  advance_tax_required: {msg.advance_tax_required}")
    for inst in msg.advance_tax_schedule:
        ctx.logger.info(f"    {inst.due_date}: Rs.{inst.amount} ({inst.percent_of_liability}%)")
    ctx.logger.info(f"  optimization_note: {msg.optimization_note}")
    ctx.logger.info("=" * 60)


if __name__ == "__main__":
    test_agent.run()