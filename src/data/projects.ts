export interface ProjectLinks {
  live?: string
  github?: string
}

export interface Project {
  title: string
  slug: string
  description: string
  tags: string[]
  status: string
  image: string | null

  overview?: string
  problem?: string
  features?: string[]
  how_it_works?: string[]
  architecture?: string
  core_workflow?: string
  areas?: string[]
  stack?: string[]
  highlights?: string[]
  links?: ProjectLinks
  my_role?: string
  privacy?: string
  security?: string[]
  credit?: string
  folder?: string
}

const projectData: Project[] = [
  {
    title: 'ABTalks Interview Agent',
    slug: 'interview-agent',
    description:
      'AI interviewer that forms beliefs about a candidate, then tests them.',
    tags: ['Agentic AI', 'FastAPI', 'Groq'],
    status: 'Live',
image: '/covers/interview-agent.svg',

    links: {
      live: 'https://the-interview-agent-ashen.vercel.app',
      github: 'https://github.com/murali2212/-The-Interview-Agent',
    },

    overview:
      "A panel of agents that forms explicit beliefs about a candidate before asking anything, then interviews to test those beliefs. Most AI interviewers are a system prompt around a chat box with no model of the candidate. This one reads the candidate's cohort telemetry first and commits to a number for every interviewable day: how likely is it that this person really understands this material. At the end it shows what it believed before, what it believes now, and which answer changed its mind.",

    problem:
      "Normal AI interviewers pick a question, read the answer, pick another. They can't be surprised, and they can't catch someone whose job title claims more than their record supports.",

    features: [
      'Belief for every curriculum day, updated after every answer',
      'Bluff detection: catches overclaiming (example: a 28-year "Distinguished Engineer" whose record shows skipped fine-tuning days, belief on Security dropped 0.90 -> 0.64)',
      'Also confirms real strength (example: a candidate with 31/31 missions first try, belief stayed high)',
      'Final report: summary, strengths, gaps, next steps, plus before/after beliefs',
      'Chat mode and live Voice mode',
      'Works with no API key (offline engine)',
    ],

    how_it_works: [
      'Director agent runs each turn',
      'Profile Analyst builds priors from candidate telemetry',
      'Evidence Ledger updates beliefs with Bayesian log-odds math',
      'Next question chosen by: gain = entropy x stakes x decay x source bonus (asks about what it is least sure of)',
      '4 override rules: verify the boast, coverage lock, no verdict on one answer, capped recovery',
      'Agentic RAG over the curriculum and candidate record (no vector store, because the corpus is 31 short, exactly-titled documents)',
      'LLM: Groq llama-3.3-70b-versatile with a circuit breaker (3 failures -> 45s cooldown -> deterministic offline engine)',
      'Voice pipeline: microphone -> Web Audio gain + silence detection -> Groq Whisper (STT) -> Director -> browser speech synthesis (TTS), LiveKit room transport',
      'Data handling: four mission states (passed / failed / skipped / unobserved), so unlisted days are never treated as weaknesses',
    ],

    stack: [
      'Python',
      'FastAPI',
      'Groq (llama-3.3-70b, Whisper)',
      'LangChain (LCEL)',
      'LiveKit',
      'Web Audio API',
      'HTML/JS console UI',
      'Vercel',
      'pytest',
    ],

    highlights: [
      '49 passing tests',
      '20 candidate profiles',
      '31-day curriculum across 8 modules',
      'works offline',
      '24 commits',
    ],

    my_role: '[YOU FILL]',
  },

  {
    title: 'DualStream Player',
    slug: 'dualstream-player',
    description: 'Listen to the same song together, on two headphones, in sync.',
    tags: ['Music', 'JavaScript', 'PWA'],
    status: '[YOU FILL: Live / In progress]',
image: '/covers/dualstream-player.svg',

    links: {
      github: 'https://github.com/murali2212/dualstream-player',
      live: '[YOU FILL if hosted]',
    },

    overview:
      'A music player built so multiple people can hear the same song at the same time and vibe together. GitHub tagline: "Spotify dual headphone music player."',

    problem:
      '[YOU FILL: e.g. friends in the same room or on a call want to share one song without sharing one pair of headphones]',

    features: ['[YOU FILL: 3 to 5 real features]'],

    how_it_works: ['[YOU FILL: how the sync works]'],

    stack: ['HTML', 'CSS', 'JavaScript', 'PWA manifest (installable on phone)'],

    highlights: ['MIT licensed', '[YOU FILL]'],

    my_role: '[YOU FILL]',
  },

  {
    title: 'TeamHub MCP Server',
    slug: 'teamhub-mcp',
    description:
      "Shared MCP server so teammates' Claude Code sessions can collaborate.",
    tags: ['MCP', 'TypeScript', 'SQLite'],
    status: 'Live (self-hosted) [YOU FILL if there is a public demo]',
image: '/covers/teamhub-mcp.svg',

    links: {
      github: 'https://github.com/murali2212/-teamhub-mcp-server',
    },

    overview:
      "A remote MCP (Model Context Protocol) server that lets multiple people's Claude Code sessions work together. They can see each other's live status, share and search project notes, hand off tasks, and share small durable facts. One person hosts it, and everyone else connects with a personal bearer token.",

    problem:
      "Each person's AI coding assistant works alone. TeamHub gives them a shared, permissioned workspace.",

    features: [
      'Live presence: see who is online and what they are doing',
      'Projects with owner-approved access: read_only or collaborate',
      'Shared notes (post, read, keyword search)',
      'Task handoff (create, claim, update status with result)',
      'Shared key-value memory (remember / recall)',
      'Audit log of every access change',
      '18 MCP tools in total',
      'Nothing is shared by default; every data flow is an explicit tool call',
    ],

    how_it_works: [
      'One Node.js process + one SQLite file (WAL mode)',
      'Express app with a /mcp endpoint and /health',
      'Stateless HTTP transport (fresh server instance per request)',
      'Per-person bearer tokens; only SHA-256 hashes are stored',
      'AsyncLocalStorage carries caller identity into tool handlers',
      'users.json reloaded per request, so adding a teammate needs no restart',
      'Docker (multi-stage) and VPS/Fly.io/Railway deploy options',
    ],

    security: [
      'Tokens hashed at rest',
      'Per-project permissions + audit trail',
      'Rate limit: 120 requests per 60s per token',
      'No stack traces leaked on errors',
      'Tool descriptions tell the model to treat shared content as data, never as instructions (prompt injection mitigation)',
      'Deliberately no OAuth: built for 2 to 15 trusted teammates',
    ],

    stack: ['TypeScript', 'Node.js', 'Express', 'SQLite', 'MCP', 'Docker'],

    highlights: ['18 tools', 'hashed tokens', 'audit log', 'rate limiting'],

    my_role: '[YOU FILL]',
  },

  {
    title: 'Journey',
    slug: 'journey',
    description: 'A custom anniversary website built for a client.',
    tags: ['Next.js', 'TypeScript', 'Client Work'],
    status: 'Live [YOU FILL: confirm]',
image: '/covers/journey.svg',

    links: {
      github: 'https://github.com/valavan-k-p/journey',
      live: '[YOU FILL]',
    },

    overview:
      "A website designed and built for a client to celebrate their anniversary.\n\n[YOU FILL: 2 to 3 sentences on the experience: what sections it has, the mood, what the client wanted]",

    features: [
      '[YOU FILL: e.g. timeline, photo gallery, animations, music, countdown, a final message]',
    ],

    stack: [
      'Next.js',
      'TypeScript',
      'Tailwind CSS (PostCSS)',
      'ESLint',
      'GitHub Actions workflow',
      'Vercel-style deploy',
    ],

    highlights: ['real paid/real client delivery', '[YOU FILL if true]'],

    my_role: '[YOU FILL]',

    privacy:
      "Do NOT show the couple's names, photos, or personal details unless the client approved. Use blurred/generic screenshots for the card.",
  },

  {
    title: 'FactoryBrain',
    slug: 'factorybrain',
    description:
      'Multi-agent AI that handles factory breakdowns from sensor alert to recovery.',
    tags: ['Multi-Agent', 'MCP', 'NitroStack'],
    status: 'Concept [YOU FILL: Concept / Hackathon prototype]',
image: '/covers/factorybrain.svg',

    links: {
      github: 'https://github.com/murali2212/nitrostack',
    },
    folder: 'sample-apps/factorybrain',

    overview:
      'An agentic manufacturing operations platform where specialized agents work together from the first sign of a failing machine to restored production.\n\nTagline:\n"Factories do not lose money only because machines fail. They lose money because decisions happen too late."\n\nBuilt for an Agentic AI hackathon by Team Naalvar, using the NitroStack framework and the Model Context Protocol.',

    problem:
      'Factory data is scattered across monitoring, maintenance, inventory, procurement, and scheduling systems. People coordinate by hand, often after downtime has started.',

    features: [
      'Detects sustained anomalies, not single noisy readings',
      'Creates a maintenance plan from machine config and repair history',
      'Checks and reserves spare parts, or starts procurement if low',
      'Ranks suppliers by urgency, delivery speed, reliability, cost',
      'Proposes production rerouting (never silently changes the schedule)',
      'Manager approval policy, automatic or human-in-the-loop',
      'Role-specific notifications with retries and deduplication',
      'Tracks the workflow until the machine is running again',
    ],

    how_it_works: [
      '8 agents: Machine → Orchestrator → Maintenance → Inventory → Purchase (only if stock is low) → Production → Manager → Notification → Monitoring',
      'Every step is logged with an idempotency key so it is explainable and safe against duplicates.',
    ],

    stack: [
      'TypeScript',
      'Node.js',
      'NitroStack',
      'MCP',
      'Zod',
      'MongoDB',
      'Redis + BullMQ',
      'Socket.IO',
      'React + Next.js widgets',
    ],

    highlights: [
      '8 cooperating agents',
      'runs with zero infrastructure (in-memory fallback)',
      'full test suite across the whole Machine → Monitoring chain',
    ],

    credit:
      'Team project (Team Naalvar).\n\nBuilt on the NitroStack framework (a fork of nitrocloudofficial/nitrostack).\n\nDo NOT describe NitroStack itself as my work.',

    my_role: '[YOU FILL]',
  },

  {
    title: 'Cognitive Engine — Colony',
    slug: 'cognitive-engine',
    description:
      'A runtime-independent cognitive layer for memory, planning, reasoning, and execution.',
    tags: ['Cognitive AI', 'Multi-Agent', 'Python'],
    status: 'Experimental / In Development',
image: '/covers/cognitive-engine.svg',

    overview:
      'Colony is a runtime-independent cognitive AI architecture designed to provide a reusable cognitive layer over different AI models, agents, and execution runtimes. It explores memory, goals, planning, reasoning, learning, tool execution, agent coordination, and recovery.',

    problem:
      'AI applications often tightly couple the model, memory, planning, tools, and execution. Colony explores separating these capabilities into a reusable cognitive layer.',

    features: [
      'Multi-layer memory',
      'Goal management and planning',
      'Agent coordination',
      'Tool execution',
      'Knowledge graphs',
      'Vector retrieval',
      'Runtime/model routing',
      'Reflection and validation',
      'Checkpoints and recovery',
    ],

    architecture:
      'Application → Conversation Gateway → Queen → Cognitive Engine → Runtime Adapter → AI Runtime',

    stack: [
      'Python',
      'LLMs',
      'Vector Search',
      'Knowledge Graphs',
      'Multi-Agent Systems',
    ],

    my_role:
      'Personal R&D, architecture, cognitive systems, memory, retrieval, and agent coordination.',
  },

  {
    title: 'CURA',
    slug: 'cura',
    description:
      'A desktop AI assistant with voice interaction, automation, memory, and a reactive interface.',
    tags: ['Python', 'PyQt6', 'AI Assistant'],
    status: 'In Development',
image: '/covers/cura.svg',

    overview:
      'CURA is a native desktop AI assistant built with Python and PyQt6, combining AI interaction, voice control, automation, memory, and a visual desktop interface.',

    features: [
      'Voice interaction',
      'AI responses',
      'Desktop automation',
      'Memory',
      'Animated AI orb',
      'Listening, thinking, speaking, and idle states',
      'Native desktop interface',
      'Dashboard',
      'Remote control',
    ],

    architecture:
      'Desktop → CURA Orb → Voice/Wake → AI Processing → Response/Action',

    stack: ['Python', 'PyQt6', 'AI APIs', 'Voice Processing'],

    my_role:
      'Designed and developed the architecture, AI integration, automation, desktop interface, and interaction system.',
  },

  {
    title: 'AI Automation System',
    slug: 'ai-automation',
    description:
      'AI-powered business workflows connecting models, APIs, data, and automation.',
    tags: ['n8n', 'LLM APIs', 'Automation'],
    status: 'In Development',
image: '/covers/ai-automation.svg',

    overview:
      'An AI automation system combining existing AI models with business workflows, APIs, data sources, and automation tools to handle repetitive business processes.',

    features: [
      'AI lead generation',
      'Company research',
      'Lead qualification',
      'Personalized outreach',
      'Follow-ups',
      'Data processing',
      'Business workflow automation',
      'Google Sheets integration',
      'Email automation',
      'AI-assisted research',
    ],

    core_workflow:
      'Lead → Research → Analysis → Qualification → Personalized Pitch → Human Approval → Email → Follow-up → CRM/Sheets',

    stack: [
      'n8n',
      'LLM APIs',
      'Python',
      'Google Sheets',
      'Gmail',
      'Webhooks',
      'APIs',
    ],

    my_role:
      'Designed and developed AI automation workflows, integrations, research systems, and AI-assisted business processes.',
  },

  {
    title: 'Experimental AI',
    slug: 'experimental-ai',
    description:
      'Experiments with LLM applications, MCP systems, agents, and AI developer tools.',
    tags: ['LLM', 'MCP', 'Agents'],
    status: 'Experimental',
image: '/covers/experimental-ai.svg',

    overview:
      'A collection of AI experiments exploring LLM applications, AI agents, MCP, tool calling, automation, developer tools, and AI workflows.',

    areas: [
      'LLM applications',
      'AI agents',
      'Agent workflows',
      'Tool calling',
      'MCP',
      'Multi-agent systems',
      'AI developer tools',
      'Model experimentation',
      'Automation',
      'AI interfaces',
    ],

    stack: ['LLMs', 'MCP', 'Python', 'AI APIs', 'Agent Frameworks'],

    my_role:
      'Personal experimentation and development across LLM applications, agents, MCP, automation, and AI developer tooling.',
  },
]

const PROJECT_ORDER = [
  'cognitive-engine',
  'teamhub-mcp',
  'cura',
  'ai-automation',
  'interview-agent',
  'dualstream-player',
  'journey',
  'factorybrain',
  'experimental-ai',
] as const

const bySlug = new Map(projectData.map((project) => [project.slug, project]))

export const projects: Project[] = PROJECT_ORDER.flatMap((slug) => {
  const project = bySlug.get(slug)
  return project ? [project] : []
})

export const featuredProjects = projects.slice(0, 4)

export const getProject = (slug: string) =>
  projects.find((project) => project.slug === slug)

export const isPlaceholder = (value?: string | null) =>
  !!value && value.includes('[YOU FILL')

export const isLinkable = (value?: string) =>
  !!value && /^https?:\/\//.test(value)
