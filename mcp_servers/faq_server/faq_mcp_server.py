"""
VISTAMATIONS FAQ MCP Server

Real MCP (Model Context Protocol) server using the official Python SDK.
Runs over stdio transport, matching the "command"/"args" style entry
in settings.json (no --port needed).
"""

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("vistamations-faq")

KNOWLEDGE_BASE = {
    "business_hours": {
        "question": "What are your business hours?",
        "answer": "Our business hours are 9 AM to 5 PM, Monday through Friday, Australian Eastern Standard Time.",
    },
    "password_reset": {
        "question": "How do I reset my password?",
        "answer": "You can reset your password by clicking the 'Forgot Password' link on the login page of our portal.",
    },
    "return_policy": {
        "question": "What is your return policy?",
        "answer": "We offer a 30-day money-back guarantee on all VISTAMATIONS products and services.",
    },
    "customer_support": {
        "question": "Do you offer customer support?",
        "answer": "Yes, we offer 24/7 customer support via email, chat, and phone for all our paid clients.",
    },
}


def _make_topic_tool(slug: str, entry: dict):
    def _tool() -> str:
        return entry["answer"]

    _tool.__name__ = f"faq_{slug}"
    _tool.__doc__ = f"FAQ: {entry['question']}"
    return _tool


for slug, entry in KNOWLEDGE_BASE.items():
    mcp.tool(name=f"faq_{slug}")(_make_topic_tool(slug, entry))


@mcp.tool()
def search_faq_topics(query: str) -> list[dict]:
    """
    Search VISTAMATIONS FAQ topics by keyword. Returns matching topic
    slugs and their questions, without full answers. Use get_faq_answer
    with a returned slug to retrieve the full answer.
    """
    query_lower = query.lower()
    matches = [
        {"slug": slug, "question": e["question"]}
        for slug, e in KNOWLEDGE_BASE.items()
        if query_lower in e["question"].lower() or query_lower in slug
    ]
    return matches or [{"slug": None, "question": "No matching topics found."}]


@mcp.tool()
def get_faq_answer(slug: str) -> str:
    """
    Retrieve the full answer for a given FAQ topic slug
    (as returned by search_faq_topics).
    """
    entry = KNOWLEDGE_BASE.get(slug)
    if not entry:
        return f"No FAQ entry found for slug '{slug}'."
    return entry["answer"]


if __name__ == "__main__":
    mcp.run(transport="stdio")