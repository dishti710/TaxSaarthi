"""
Coordinator Agent — the ONLY agent registered for ASI:One discovery.

Implements the Agent Chat Protocol so ASI:One (and any other ASI:One-
compatible agent) can route natural-language requests here.

Responsibilities:
  1. Receive a ChatMessage from ASI:One.
  2. Use the ASI:One LLM (asi1-mini, via the OpenAI-compatible endpoint) to
     parse income details out of the free-text message into a TaxInput.
  3. Send TaxInput to the Calculator Agent, await TaxBreakdown.
  4. Send TaxBreakdown to the Action-Plan Agent, await ActionPlan.
  5. Format a human-readable reply and send it back via the Chat Protocol.

Owner: Member 3.

Setup checklist (do this before writing any parsing logic):
  1. pip install -r backend/requirements.txt  (uagents, uagents-core, openai)
  2. Get an ASI:One API key: https://asi1.ai/dashboard/api-keys -> put in .env as ASI_ONE_API_KEY
  3. Get an Agentverse mailbox working with a trivial "hello world" agent first —
     this is the part most likely to eat hours. Confirm mailbox=True + registration
     works before wiring the rest of this file.
  4. Start calculator_agent.py and actionplan_agent.py locally, copy their
     printed addresses into .env (or hardcode below for the demo).
"""

import os
import json
from datetime import datetime, timezone
from uuid import uuid4

from dotenv import load_dotenv
from openai import OpenAI
from uagents import Agent, Context, Protocol

from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    TextContent,
    chat_protocol_spec,
)

from agents.common.models import TaxInput, TaxBreakdown, ActionPlan

load_dotenv()

# ---------------------------------------------------------------------------
# Agent + ASI:One LLM client setup
# ---------------------------------------------------------------------------

coordinator_agent = Agent(
    name="tax_coordinator_agent",
    seed=os.getenv("COORDINATOR_AGENT_SEED", "change-me-to-a-random-string"),
    port=8001,
    mailbox=True,
)

asi_one_client = OpenAI(
    base_url="https://api.asi1.ai/v1",
    api_key=os.getenv("ASI_ONE_API_KEY"),
)

# Addresses printed on startup by calculator_agent.py / actionplan_agent.py —
# paste them here (or load from .env) once those agents are running.
CALCULATOR_AGENT_ADDRESS = os.getenv("CALCULATOR_AGENT_ADDRESS", "")
ACTIONPLAN_AGENT_ADDRESS = os.getenv("ACTIONPLAN_AGENT_ADDRESS", "")

PARSE_SYSTEM_PROMPT = """You extract Indian salary tax inputs from a user's message.

Return ONLY a JSON object, no prose, no markdown fences, matching exactly:
{"annual_income": <integer rupees or null>, "employer_nps_contribution": <integer rupees, default 0>}

Rules:
- Convert "lakh"/"lakhs"/"L" to *100000, "crore"/"cr" to *10000000.
  e.g. "14 lakh" -> 1400000, "1.2 crore" -> 12000000.
- If the message gives a monthly salary instead of annual, multiply by 12.
- If no income figure is present at all, set "annual_income" to null.
- employer_nps_contribution defaults to 0 if not mentioned.
- Output integers only, no currency symbols, no commas, no explanation text.
"""


# ---------------------------------------------------------------------------
# NL parsing via ASI:One
# ---------------------------------------------------------------------------

def parse_income_from_text(message: str) -> TaxInput | None:
    """
    Extract annual_income / employer_nps_contribution from free text like:
      "I earn 14 lakh a year, my employer puts 50000 into NPS for me"

    Uses the ASI:One LLM (asi1-mini) for extraction instead of regex, since
    it's already the LLM this project is built around and handles messy
    phrasing ("14L", "1.2 crore", "50k NPS") more robustly than keyword
    matching. Returns None if no income figure could be extracted.
    """
    response = asi_one_client.chat.completions.create(
        model="asi1-mini",
        messages=[
            {"role": "system", "content": PARSE_SYSTEM_PROMPT},
            {"role": "user", "content": message},
        ],
        temperature=0,
        max_tokens=200,
    )
    raw = response.choices[0].message.content.strip()

    # Defensive: strip markdown fences if the model adds them anyway.
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.startswith("json"):
            raw = raw[len("json"):].strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return None

    annual_income = parsed.get("annual_income")
    if not annual_income or annual_income <= 0:
        return None

    return TaxInput(
        annual_income=int(annual_income),
        employer_nps_contribution=int(parsed.get("employer_nps_contribution") or 0),
    )


# ---------------------------------------------------------------------------
# Chat protocol plumbing
# ---------------------------------------------------------------------------

chat_proto = Protocol(spec=chat_protocol_spec)


def create_text_chat(text: str, end_session: bool = False) -> ChatMessage:
    content = [TextContent(type="text", text=text)]
    if end_session:
        content.append(EndSessionContent(type="end-session"))
    return ChatMessage(timestamp=datetime.now(timezone.utc), msg_id=uuid4(), content=content)


def extract_text(msg: ChatMessage) -> str:
    return " ".join(item.text for item in msg.content if isinstance(item, TextContent))


def format_reply(tax_input: TaxInput, breakdown: TaxBreakdown, action_plan: ActionPlan) -> str:
    lines = [
        f"Here's your tax breakdown (New Regime, FY2025-26):",
        f"- Gross income: Rs. {tax_input.annual_income:,}",
        f"- Total deductions: Rs. {breakdown.total_deductions:,}",
        f"- Taxable income: Rs. {breakdown.taxable_income:,}",
        f"- Net tax payable: Rs. {breakdown.net_tax_payable:,} (incl. 4% cess)",
        "",
        "Action plan:",
        f"- ITR filing deadline: {action_plan.filing_deadline}",
    ]
    if action_plan.advance_tax_required:
        lines.append("- Advance tax installments:")
        for inst in action_plan.advance_tax_schedule:
            lines.append(f"    {inst.due_date}: Rs. {inst.amount:,} ({inst.percent_of_liability}% cumulative)")
    else:
        lines.append("- No advance tax required (liability under Rs. 10,000).")
    lines.append(f"- {action_plan.optimization_note}")
    lines.append(f"- Full report: {action_plan.report_download_url}")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Handlers
# ---------------------------------------------------------------------------

@chat_proto.on_message(ChatMessage)
async def handle_chat_message(ctx: Context, sender: str, msg: ChatMessage):
    # Always acknowledge receipt first, per Chat Protocol convention.
    await ctx.send(sender, ChatAcknowledgement(timestamp=datetime.now(timezone.utc), acknowledged_msg_id=msg.msg_id))

    text = extract_text(msg)
    ctx.logger.info(f"Received chat message from {sender}: {text!r}")

    tax_input = parse_income_from_text(text)
    if tax_input is None:
        await ctx.send(sender, create_text_chat(
            "I couldn't find an income amount in that message. "
            "Try something like: 'I earn 14 lakh a year, my employer puts 50000 into NPS.'"
        ))
        return

    if not CALCULATOR_AGENT_ADDRESS:
        await ctx.send(sender, create_text_chat(
            "Calculator agent address isn't configured yet — set CALCULATOR_AGENT_ADDRESS in .env."
        ))
        return

    # Remember who to reply to once the Calculator/Action-Plan agents respond.
    # NOTE: single-slot storage — fine for a hackathon demo with one active
    # conversation at a time. A production version would key this by a
    # request/session id threaded through TaxInput -> TaxBreakdown -> ActionPlan.
    ctx.storage.set("pending_sender", sender)
    ctx.storage.set("pending_tax_input", tax_input.model_dump_json())

    await ctx.send(CALCULATOR_AGENT_ADDRESS, tax_input)


@chat_proto.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"Received ack from {sender} for {msg.acknowledged_msg_id}")


@coordinator_agent.on_message(model=TaxBreakdown)
async def handle_breakdown(ctx: Context, sender: str, msg: TaxBreakdown):
    ctx.logger.info(f"Received TaxBreakdown from {sender}")
    if not ACTIONPLAN_AGENT_ADDRESS:
        pending_sender = ctx.storage.get("pending_sender")
        if pending_sender:
            await ctx.send(pending_sender, create_text_chat(
                "Action-plan agent address isn't configured yet — set ACTIONPLAN_AGENT_ADDRESS in .env."
            ))
        return
    ctx.storage.set("pending_breakdown", msg.model_dump_json())
    await ctx.send(ACTIONPLAN_AGENT_ADDRESS, msg)


@coordinator_agent.on_message(model=ActionPlan)
async def handle_action_plan(ctx: Context, sender: str, msg: ActionPlan):
    ctx.logger.info(f"Received ActionPlan from {sender}")

    pending_sender = ctx.storage.get("pending_sender")
    pending_tax_input = ctx.storage.get("pending_tax_input")
    pending_breakdown = ctx.storage.get("pending_breakdown")

    if not pending_sender:
        ctx.logger.warning("No pending sender found — dropping ActionPlan reply.")
        return

    tax_input = TaxInput.model_validate_json(pending_tax_input)
    breakdown = TaxBreakdown.model_validate_json(pending_breakdown)

    reply_text = format_reply(tax_input, breakdown, msg)
    await ctx.send(pending_sender, create_text_chat(reply_text, end_session=True))


coordinator_agent.include(chat_proto, publish_manifest=True)


if __name__ == "__main__":
    coordinator_agent.run()