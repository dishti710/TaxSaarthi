"""
Runs the coordinator, calculator, and action-plan agents together in a
single process via uagents.Bureau — so the whole pipeline deploys as ONE
Render background worker instead of three separate services.

Each agent file (coordinator_agent.py, calculator_agent.py,
tax_actionplan_agent.py) still defines its own Agent(...) as before.
This file just imports those Agent objects and hands them to a Bureau
instead of calling agent.run() on each one individually.

Usage locally:   python run_agents.py
Usage on Render: set the start command to `python run_agents.py`
"""

import os
from uagents import Bureau

from agents.coordinator_agent import coordinator_agent
from agents.calculator_agent import calculator_agent
from agents.tax_actionplan_agent import actionplan_agent

bureau = Bureau(port=int(os.getenv("PORT", 8000)), endpoint=None)

bureau.add(coordinator_agent)
bureau.add(calculator_agent)
bureau.add(actionplan_agent)

if __name__ == "__main__":
    bureau.run()