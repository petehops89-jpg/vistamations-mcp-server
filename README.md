# VISTAMATIONS

**Venture Mission:** To design, develop, and deploy commercial-grade agent teams for a variety of businesses.

VISTAMATIONS is built on a standard of persistent, robust infrastructure — current, high-end architecture paired with efficient workflows. Our teams operate with discipline and procedural rigor, holding every practice to strict compliance and quality standards. The result: clients receive the best of what we build, positioned ahead of the market, with lower operational costs, higher productivity, and fewer system flaws to manage.

In a world increasingly shaped by technical and agentic systems, strong architectural planning is the foundation everything else is built on. VISTAMATIONS exists to lay that foundation — and to give it room to grow.

This repository contains the prototypes, use cases, and core engineering for the VISTAMATIONS commercial agent venture.

## Project Structure

- `/core_engine`: The working agent orchestration system ("Bell"). A Manager Agent decomposes goals into sub-tasks, a Runner dispatches them, and specialized agents execute them. Currently live: **FAQAgent** (answers questions via a connected MCP server) and **CoderAgent** (generates code proposals via DeepSeek, scratchpad-only — nothing is applied automatically).
- `/prototypes`: Houses individual prototype projects for different agent teams.
- `/use_cases`: Contains documentation for specific business use cases and how our agent teams solve them.
- `/clients`: For organizing client-specific implementations and configurations.
- `/fern`: Documentation site configuration.
- `/assets`: Branding, logos, and other static assets.

## Status

As of the current build, `core_engine` runs end to end: a natural-language goal goes in, the Manager plans it, the Runner executes it against real agents and tools, and results come back. Additional agent types (search, cloud, graphics) and a generic MCP client layer are in active development.
