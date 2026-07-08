# 1. Core Business Vision: VISTAMATIONS

**The primary goal of this project is to build, prototype, and eventually commercialize and sell agent teams under the VISTAMATIONS brand.** This vision is the guiding principle for all development efforts. The structured folder system is designed to support this evolution from initial prototype to a production-ready product.

---

# 2. Current Strategic Objective

**Our current focus is to build a functional prototype of a customer service agent team.** This involves developing and integrating multiple agents with distinct "skills" that can collaborate to handle a customer interaction. This prototype will serve as the foundation for future, more complex agent systems.

---

# 3. Active Projects & Prototypes

This section tracks the status of our concrete development efforts.

### A. `core_engine` (TypeScript Library)
-   **Purpose:** A robust, reusable library for orchestrating agent teams. It provides the foundational classes for agents, state, and tasks.
-   **Location:** `C:\gemini-working\VISTAMATIONS\core_engine`
-   **Status:** Core classes for state, tasks, and agents are defined, and a run loop (in `src/runner.ts`) now dequeues and executes tasks. The `npm run start` command executes `dist/runner.js` (the application entry point), while `index.ts` remains the library's export surface. Verified working with greeter -> summarizer handoff.

### B. `customer_service_bot` (Prototype)
-   **Purpose:** Our first prototype for the customer service agent team. It demonstrates basic agent collaboration.
-   **Location:** `C:\gemini-working\VISTAMATIONS\prototypes\customer_service_bot`
-   **Status:** Functional and verified.
-   **Components:**
    -   `GreetingAgent`: Welcomes users.
    -   `FAQAgent`: Answers questions from a knowledge base.

---

# 4. Technical Architecture & Decisions

This section contains implementation details, setup notes, and technical decisions.

### A. Custom Tools (MCP Servers)
-   **Purpose:** To extend the Gemini CLI with new "skills" that can be used by agents or the user.
-   **Active Tool: `faq_server`**
    -   **Technology:** MCP Python SDK (FastMCP) with stdio transport.
    -   **Location:** `C:\gemini-working\VISTAMATIONS\mcp_servers\faq_server`
    -   **Function:** Exposes FAQ logic as 6 custom tools to the Gemini CLI.
    -   **Status:** **Confirmed connected.** Registered 6 tools, verified via `/mcp list`.
-   **Active Tool: `graphics_server`**
    -   **Technology:** MCP Python SDK (FastMCP) with stdio transport.
    -   **Location:** `C:\gemini-working\VISTAMATIONS\mcp_servers\graphics_server`
    -   **Function:** Exposes 4 tools for graphics processing: `list_assets`, `get_video_info`, `get_image_info`, and `extract_frames`.
    -   **Status:** **Fully verified working.** All four tools have been confirmed functional through direct calls and `/mcp list`. Previous hanging issues were resolved. The root cause was `extract_frames` spawning a separate `ffmpeg` process for each frame. This was fixed by refactoring to a single `ffmpeg` call using the `fps` filter and increasing the timeout to 60000ms.

---

# 5. Next Strategic Objective: Advanced Agent Team

Our focus now shifts to building a more advanced agent team within the `vista-oma-nextjs-starter` application, following the VISTAMATIONS vision.

*   **Architectural Pattern:** We will follow the "external tool server" (MCP) model, where agents in the Next.js app call separate, single-purpose server processes for their tools. The `petehops89-jpg/vista-awesome-mcp-servers` repository will serve as the structural blueprint for our collection of tool servers.
*   **New Agent Team:** We will build a team composed of the following agents:
    -   **Manager Agent (Coordinator):** To orchestrate tasks.
    -   **Coder Agent:** Proficient in Node, Python, Next.js, and React.
    -   **Cloud Agent:** Specialist in GCP (IAM, ADC) and Cloudflare.
    -   **Designer Agent:** To script vector animations (long-term goal).
*   **Immediate Next Step:** Begin development of the first custom tool server for the new team: a **`file_system_server`** to empower the `coder` agent with the ability to read and write files.
