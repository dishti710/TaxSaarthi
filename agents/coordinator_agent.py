"""
Coordinator Agent — the ONLY agent registered for ASI:One discovery.

Implements the Chat Protocol so ASI:One can route natural-language requests
here. Responsibilities:
  1. Receive a ChatMessage from ASI:One.
  2. Parse income details out of the free-text message into a TaxInput.
  3. Send TaxInput to the Calculator Agent, await TaxBreakdown.
  4. Send TaxBreakdown to the Action-Plan Agent, await ActionPlan.
  5. Format a human-readable reply and send it back via the Chat Protocol.

Owner: Member 3.

See: https://uagents.fetch.ai/docs/examples/asi-1 for the Chat Protocol /
mailbox setup pattern before filling this in — the exact chat-protocol
message types (ChatMessage, ChatAcknowledgement, chat_protocol_spec) come
from uagents_core.contrib.protocols.chat, check current docs for the exact
import path/version.
"""

from uagents import Agent, Context

from agents.common.models import TaxInput, TaxBreakdown, ActionPlan

# TODO: import the Chat Protocol pieces once confirmed against current docs, e.g.
# from uagents_core.contrib.protocols.chat import (
#     ChatMessage, ChatAcknowledgement, chat_protocol_spec, TextContent,
# )

coordinator_agent = Agent(
    name="tax_coordinator_agent",
    seed="COORDINATOR_AGENT_SEED",  # TODO: load from .env, must be unique & secret
    port=8001,
    endpoint=["http://127.0.0.1:8001/submit"],
    mailbox=True,  # TODO: confirm mailbox config needed for Agentverse/ASI:One registration
)

# TODO: replace with real addresses once calculator/actionplan agents are running
# (either hardcode from their printed startup address, or load from .env)
CALCULATOR_AGENT_ADDRESS = ""
ACTIONPLAN_AGENT_ADDRESS = ""


def parse_income_from_text(message: str) -> TaxInput:
    """
    Extract annual_income / employer_nps_contribution from free text like:
      "I earn 14 lakh a year, my employer puts 50000 into NPS for me"

    Keep this simple for the MVP — regex/keyword matching on numbers plus
    "lakh"/"lakhs"/"crore" and "nps" is enough; this does not need to be a
    full NLU pipeline in 10 hours.

    TODO(Member 3): implement.
    """
    raise NotImplementedError("TODO: implement parse_income_from_text")


# TODO: register the Chat Protocol handler here, e.g.
#
# chat_proto = Protocol(spec=chat_protocol_spec)
#
# @chat_proto.on_message(model=ChatMessage)
# async def handle_chat_message(ctx: Context, sender: str, msg: ChatMessage):
#     text = extract_text(msg)  # pull the text content out of msg
#     tax_input = parse_income_from_text(text)
#     ctx.storage.set(str(ctx.session), sender)  # remember who to reply to, if needed
#     await ctx.send(CALCULATOR_AGENT_ADDRESS, tax_input)
#
# @coordinator_agent.on_message(model=TaxBreakdown)
# async def handle_breakdown(ctx: Context, sender: str, msg: TaxBreakdown):
#     await ctx.send(ACTIONPLAN_AGENT_ADDRESS, msg)
#
# @coordinator_agent.on_message(model=ActionPlan)
# async def handle_action_plan(ctx: Context, sender: str, msg: ActionPlan):
#     # format msg into a chat reply and send back via chat_proto
#     ...
#
# coordinator_agent.include(chat_proto, publish_manifest=True)

if __name__ == "__main__":
    coordinator_agent.run()
