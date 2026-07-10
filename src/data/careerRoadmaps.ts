/**
 * Curated career roadmaps — local data, no API dependency.
 * Based on industry-standard learning paths for each role.
 *
 * Structure:
 *   CareerRoadmap → sections → topics
 *   Each topic has: id, title, description, level, resources[]
 */

export type TopicLevel = "foundation" | "core" | "advanced" | "optional";

export type Resource = {
  label: string;
  url: string;
  type: "article" | "video" | "course" | "docs" | "book";
};

export type Topic = {
  id: string;
  title: string;
  description: string;
  level: TopicLevel;
  resources: Resource[];
};

export type Section = {
  id: string;
  title: string;
  icon: string;
  topics: Topic[];
};

export type ProjectDifficulty = "beginner" | "intermediate" | "advanced";

export type Project = {
  title: string;
  description: string;
  difficulty: ProjectDifficulty;
  /** Key skills / tech this project exercises */
  skills: string[];
};

export type CareerRoadmap = {
  id: string;
  title: string;
  icon: string;
  color: string;
  bg: string;
  description: string;
  jobTitles: string[];
  avgSalary: string;
  timeToJob: string;
  projects: Project[];
  sections: Section[];
};

// ─── Frontend Web Developer ──────────────────────────────────────────────────

const frontendRoadmap: CareerRoadmap = {
  id: "frontend",
  title: "Frontend Developer",
  icon: "🌐",
  color: "#378ADD",
  bg: "#F0F7FE",
  description: "Build user interfaces and web experiences. Master HTML, CSS, JavaScript, and modern frameworks.",
  jobTitles: ["Frontend Developer", "UI Developer", "React Developer", "Web Developer"],
  avgSalary: "Rp 8–20 jt/bulan",
  timeToJob: "6–12 months",
  projects: [
    { title: "Personal Portfolio", description: "Responsive portfolio site with dark mode, smooth scroll, and a contact form. Deploy to Vercel.", difficulty: "beginner", skills: ["HTML", "CSS", "Tailwind", "Vite"] },
    { title: "GitHub User Explorer", description: "Search GitHub users, view their repos and stats. Fetch from the GitHub REST API using async/await.", difficulty: "intermediate", skills: ["React", "TypeScript", "REST API", "React Query"] },
    { title: "Realtime Kanban Board", description: "Drag-and-drop task board with columns, local persistence, and optimistic updates. Think Trello-lite.", difficulty: "intermediate", skills: ["React", "Next.js", "Zustand", "Drag and Drop"] },
    { title: "E-commerce Storefront", description: "Product listing, cart, checkout flow with Stripe. SSR for SEO, image optimisation with Next.js Image.", difficulty: "advanced", skills: ["Next.js", "TypeScript", "Stripe", "Tailwind"] },
  ],
  sections: [
    {
      id: "fe-internet",
      title: "How the Internet Works",
      icon: "📡",
      topics: [
        { id: "fe-http", title: "HTTP & HTTPS", description: "Request/response cycle, status codes, headers, methods (GET, POST, PUT, DELETE).", level: "foundation", resources: [{ label: "MDN HTTP Overview", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview", type: "docs" }, { label: "HTTP Crash Course", url: "https://www.youtube.com/watch?v=iYM2zFP3Zn0", type: "video" }] },
        { id: "fe-dns", title: "DNS & Domain Names", description: "How domains resolve to IP addresses, DNS records, TTL.", level: "foundation", resources: [{ label: "How DNS Works", url: "https://howdns.works", type: "article" }] },
        { id: "fe-browser", title: "How Browsers Work", description: "Rendering pipeline, DOM construction, CSSOM, layout, paint.", level: "foundation", resources: [{ label: "Inside a Browser (web.dev)", url: "https://web.dev/inside-browser-part1/", type: "article" }] },
      ],
    },
    {
      id: "fe-html",
      title: "HTML",
      icon: "📄",
      topics: [
        { id: "fe-html-basics", title: "HTML Basics", description: "Semantic elements, forms, tables, accessibility attributes.", level: "foundation", resources: [{ label: "MDN HTML Guide", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML", type: "docs" }] },
        { id: "fe-seo-basics", title: "SEO Basics", description: "Meta tags, Open Graph, structured data, semantic HTML for SEO.", level: "core", resources: [{ label: "Google SEO Starter Guide", url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide", type: "docs" }] },
        { id: "fe-a11y", title: "Web Accessibility", description: "ARIA roles, keyboard navigation, screen reader support, WCAG 2.1.", level: "core", resources: [{ label: "web.dev Accessibility", url: "https://web.dev/accessibility/", type: "article" }] },
      ],
    },
    {
      id: "fe-css",
      title: "CSS",
      icon: "🎨",
      topics: [
        { id: "fe-css-basics", title: "CSS Fundamentals", description: "Box model, selectors, specificity, cascade, units.", level: "foundation", resources: [{ label: "MDN CSS Basics", url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps", type: "docs" }] },
        { id: "fe-flexbox", title: "Flexbox", description: "One-dimensional layout, flex container and item properties.", level: "foundation", resources: [{ label: "CSS Tricks Flexbox Guide", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/", type: "article" }, { label: "Flexbox Froggy", url: "https://flexboxfroggy.com", type: "article" }] },
        { id: "fe-grid", title: "CSS Grid", description: "Two-dimensional layout, grid areas, auto-placement.", level: "core", resources: [{ label: "CSS Tricks Grid Guide", url: "https://css-tricks.com/snippets/css/complete-guide-grid/", type: "article" }, { label: "Grid Garden", url: "https://cssgridgarden.com", type: "article" }] },
        { id: "fe-responsive", title: "Responsive Design", description: "Media queries, mobile-first design, viewport meta tag.", level: "core", resources: [{ label: "Responsive Design on web.dev", url: "https://web.dev/responsive-web-design-basics/", type: "article" }] },
        { id: "fe-tailwind", title: "Tailwind CSS", description: "Utility-first CSS framework, customisation, dark mode.", level: "core", resources: [{ label: "Tailwind CSS Docs", url: "https://tailwindcss.com/docs", type: "docs" }] },
      ],
    },
    {
      id: "fe-js",
      title: "JavaScript",
      icon: "⚡",
      topics: [
        { id: "fe-js-basics", title: "JS Fundamentals", description: "Variables, data types, functions, scope, closures, prototype.", level: "foundation", resources: [{ label: "javascript.info", url: "https://javascript.info", type: "article" }] },
        { id: "fe-dom", title: "DOM Manipulation", description: "Selecting elements, events, dynamic content, event delegation.", level: "foundation", resources: [{ label: "MDN DOM Introduction", url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction", type: "docs" }] },
        { id: "fe-async", title: "Async JS", description: "Callbacks, Promises, async/await, fetch API.", level: "core", resources: [{ label: "Async JS on javascript.info", url: "https://javascript.info/async", type: "article" }] },
        { id: "fe-es6", title: "ES6+ Features", description: "Destructuring, spread/rest, modules, arrow functions, classes.", level: "core", resources: [{ label: "ES6 Features Overview", url: "https://es6-features.org", type: "article" }] },
        { id: "fe-typescript", title: "TypeScript", description: "Static typing, interfaces, generics, enums, utility types.", level: "core", resources: [{ label: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html", type: "docs" }] },
      ],
    },
    {
      id: "fe-framework",
      title: "Frameworks & Libraries",
      icon: "⚛️",
      topics: [
        { id: "fe-react", title: "React", description: "Components, hooks, state management, React Router, Context API.", level: "core", resources: [{ label: "React Docs", url: "https://react.dev", type: "docs" }, { label: "Full React Course (freeCodeCamp)", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", type: "video" }] },
        { id: "fe-nextjs", title: "Next.js", description: "SSR, SSG, ISR, App Router, API routes, image optimisation.", level: "core", resources: [{ label: "Next.js Docs", url: "https://nextjs.org/docs", type: "docs" }] },
        { id: "fe-state", title: "State Management", description: "Redux Toolkit, Zustand, Jotai — when and why to use each.", level: "advanced", resources: [{ label: "Redux Toolkit Docs", url: "https://redux-toolkit.js.org", type: "docs" }, { label: "Zustand Docs", url: "https://docs.pmnd.rs/zustand", type: "docs" }] },
        { id: "fe-testing", title: "Testing", description: "Jest, React Testing Library, Cypress for E2E.", level: "advanced", resources: [{ label: "Testing Library Docs", url: "https://testing-library.com/docs/react-testing-library/intro/", type: "docs" }] },
      ],
    },
    {
      id: "fe-tooling",
      title: "Build Tools & DevOps",
      icon: "🔧",
      topics: [
        { id: "fe-git", title: "Git & GitHub", description: "Commits, branches, pull requests, merge conflicts, Git flow.", level: "foundation", resources: [{ label: "Pro Git Book", url: "https://git-scm.com/book/en/v2", type: "book" }] },
        { id: "fe-npm", title: "Package Managers", description: "npm, pnpm, yarn — lockfiles, scripts, workspaces.", level: "foundation", resources: [{ label: "npm Docs", url: "https://docs.npmjs.com", type: "docs" }] },
        { id: "fe-vite", title: "Vite / Webpack", description: "Module bundling, HMR, code splitting, tree shaking.", level: "core", resources: [{ label: "Vite Docs", url: "https://vitejs.dev/guide/", type: "docs" }] },
        { id: "fe-ci", title: "CI/CD Basics", description: "GitHub Actions, Vercel deployments, environment variables.", level: "advanced", resources: [{ label: "GitHub Actions Docs", url: "https://docs.github.com/en/actions", type: "docs" }] },
      ],
    },
  ],
};

// ─── Backend Developer ───────────────────────────────────────────────────────

const backendRoadmap: CareerRoadmap = {
  id: "backend",
  title: "Backend Developer",
  icon: "⚙️",
  color: "#1D9E75",
  bg: "#F0FBF7",
  description: "Build servers, APIs, and databases that power applications. Master Node.js or Python, SQL, and system design.",
  jobTitles: ["Backend Developer", "API Developer", "Node.js Developer", "Python Developer"],
  avgSalary: "Rp 10–25 jt/bulan",
  timeToJob: "8–14 months",
  projects: [
    { title: "REST API with Auth", description: "CRUD API for a blog — users, posts, comments. JWT auth, bcrypt passwords, rate limiting, Postgres.", difficulty: "beginner", skills: ["Node.js", "Express", "PostgreSQL", "JWT"] },
    { title: "URL Shortener Service", description: "Generate short links with click tracking, expiry, and analytics dashboard. Redis for caching.", difficulty: "intermediate", skills: ["Node.js", "Redis", "PostgreSQL", "Docker"] },
    { title: "Real-time Chat API", description: "WebSocket-based chat server with rooms, message history, and online presence. Socket.io + Postgres.", difficulty: "intermediate", skills: ["Node.js", "Socket.io", "PostgreSQL", "WebSockets"] },
    { title: "Multi-tenant SaaS Backend", description: "Organisation-scoped data model, subscription plans, Stripe webhooks, admin dashboard API.", difficulty: "advanced", skills: ["NestJS", "TypeScript", "PostgreSQL", "Stripe"] },
  ],
  sections: [
    {
      id: "be-internet",
      title: "Internet & OS Basics",
      icon: "📡",
      topics: [
        { id: "be-http", title: "HTTP / REST", description: "Status codes, methods, headers, REST constraints, versioning.", level: "foundation", resources: [{ label: "REST API Tutorial", url: "https://restfulapi.net", type: "article" }] },
        { id: "be-os", title: "OS & Terminal", description: "Process management, file system, environment variables, shell scripting.", level: "foundation", resources: [{ label: "Linux Command Line (book)", url: "https://linuxcommand.org/tlcl.php", type: "book" }] },
      ],
    },
    {
      id: "be-lang",
      title: "Programming Language",
      icon: "💻",
      topics: [
        { id: "be-nodejs", title: "Node.js", description: "Event loop, streams, modules, npm ecosystem, async patterns.", level: "foundation", resources: [{ label: "Node.js Docs", url: "https://nodejs.org/en/docs/", type: "docs" }, { label: "Node.js Course (freeCodeCamp)", url: "https://www.youtube.com/watch?v=Oe421EPjeBE", type: "video" }] },
        { id: "be-python", title: "Python", description: "Data types, OOP, decorators, virtual environments, pip.", level: "foundation", resources: [{ label: "Python Docs", url: "https://docs.python.org/3/tutorial/", type: "docs" }] },
        { id: "be-typescript", title: "TypeScript (Node)", description: "Strict typing on the server, tsconfig, path aliases.", level: "core", resources: [{ label: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html", type: "docs" }] },
      ],
    },
    {
      id: "be-frameworks",
      title: "Frameworks",
      icon: "🏗️",
      topics: [
        { id: "be-express", title: "Express.js", description: "Routing, middleware, error handling, request lifecycle.", level: "core", resources: [{ label: "Express Docs", url: "https://expressjs.com/en/guide/routing.html", type: "docs" }] },
        { id: "be-fastapi", title: "FastAPI (Python)", description: "Pydantic models, dependency injection, async endpoints, OpenAPI.", level: "core", resources: [{ label: "FastAPI Docs", url: "https://fastapi.tiangolo.com", type: "docs" }] },
        { id: "be-nestjs", title: "NestJS", description: "Modules, decorators, DI container, Guards, Interceptors.", level: "advanced", resources: [{ label: "NestJS Docs", url: "https://docs.nestjs.com", type: "docs" }] },
      ],
    },
    {
      id: "be-db",
      title: "Databases",
      icon: "🗄️",
      topics: [
        { id: "be-sql", title: "SQL Fundamentals", description: "SELECT, JOIN, indexes, transactions, ACID, normalization.", level: "foundation", resources: [{ label: "SQLZoo", url: "https://sqlzoo.net", type: "article" }, { label: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com", type: "article" }] },
        { id: "be-postgres", title: "PostgreSQL", description: "Advanced queries, JSONB, full-text search, Row Level Security.", level: "core", resources: [{ label: "PostgreSQL Docs", url: "https://www.postgresql.org/docs/", type: "docs" }] },
        { id: "be-nosql", title: "NoSQL (MongoDB)", description: "Documents, aggregation pipeline, indexes, Atlas.", level: "core", resources: [{ label: "MongoDB University", url: "https://learn.mongodb.com", type: "course" }] },
        { id: "be-redis", title: "Redis", description: "Caching, pub/sub, queues, data structures, TTL.", level: "advanced", resources: [{ label: "Redis University", url: "https://university.redis.com", type: "course" }] },
      ],
    },
    {
      id: "be-api",
      title: "API Design & Auth",
      icon: "🔐",
      topics: [
        { id: "be-rest", title: "RESTful API Design", description: "Resource naming, pagination, filtering, HATEOAS, versioning.", level: "core", resources: [{ label: "API Design Best Practices", url: "https://swagger.io/blog/api-design/api-design-best-practices/", type: "article" }] },
        { id: "be-auth", title: "Authentication", description: "JWT, OAuth 2.0, session cookies, refresh tokens, bcrypt.", level: "core", resources: [{ label: "JWT.io Introduction", url: "https://jwt.io/introduction", type: "article" }] },
        { id: "be-graphql", title: "GraphQL", description: "Schema, resolvers, mutations, subscriptions, DataLoader.", level: "advanced", resources: [{ label: "GraphQL.org Learn", url: "https://graphql.org/learn/", type: "docs" }] },
      ],
    },
    {
      id: "be-infra",
      title: "Infrastructure & DevOps",
      icon: "☁️",
      topics: [
        { id: "be-docker", title: "Docker", description: "Images, containers, Dockerfile, docker-compose, volumes.", level: "core", resources: [{ label: "Docker Getting Started", url: "https://docs.docker.com/get-started/", type: "docs" }] },
        { id: "be-ci", title: "CI/CD", description: "GitHub Actions pipelines, automated testing, deployment stages.", level: "core", resources: [{ label: "GitHub Actions Docs", url: "https://docs.github.com/en/actions", type: "docs" }] },
        { id: "be-cloud", title: "Cloud Basics (AWS/GCP)", description: "EC2, S3, Lambda, RDS — core services for a backend dev.", level: "advanced", resources: [{ label: "AWS Free Tier", url: "https://aws.amazon.com/free/", type: "docs" }] },
      ],
    },
  ],
};

// ─── Full Stack Developer ────────────────────────────────────────────────────

const fullStackRoadmap: CareerRoadmap = {
  id: "fullstack",
  title: "Full Stack Developer",
  icon: "🔀",
  color: "#7C3AED",
  bg: "#F5F3FF",
  description: "Build complete web applications end-to-end. Combine frontend, backend, and deployment skills.",
  jobTitles: ["Full Stack Developer", "Software Engineer", "Web Engineer"],
  avgSalary: "Rp 12–30 jt/bulan",
  timeToJob: "12–18 months",
  projects: [
    { title: "Task Management App", description: "Full-stack to-do app with auth, teams, due dates, and email reminders. Next.js + Supabase.", difficulty: "beginner", skills: ["Next.js", "Supabase", "TypeScript", "Tailwind"] },
    { title: "Social Bookmarking Site", description: "Save, tag, and share links. Follow other users. Full auth, feed, and search backed by Postgres.", difficulty: "intermediate", skills: ["Next.js", "PostgreSQL", "Prisma", "NextAuth"] },
    { title: "SaaS Invoicing Tool", description: "Create clients, invoices, track payments. PDF export, email delivery, Stripe for recurring billing.", difficulty: "advanced", skills: ["Next.js", "TypeScript", "Stripe", "PostgreSQL"] },
  ],
  sections: [
    { id: "fs-foundation", title: "Foundation", icon: "📐", topics: [
      { id: "fs-html-css", title: "HTML & CSS", description: "Semantic HTML, Flexbox, Grid, responsive design fundamentals.", level: "foundation", resources: [{ label: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Learn", type: "docs" }] },
      { id: "fs-js", title: "JavaScript ES6+", description: "Modern JS syntax, async/await, modules, DOM API.", level: "foundation", resources: [{ label: "javascript.info", url: "https://javascript.info", type: "article" }] },
      { id: "fs-git", title: "Git & GitHub", description: "Version control fundamentals, branching strategy, pull requests.", level: "foundation", resources: [{ label: "Pro Git Book", url: "https://git-scm.com/book/en/v2", type: "book" }] },
    ]},
    { id: "fs-frontend", title: "Frontend", icon: "🌐", topics: [
      { id: "fs-react", title: "React + TypeScript", description: "Hooks, Context, React Router, component patterns.", level: "core", resources: [{ label: "React Docs", url: "https://react.dev", type: "docs" }] },
      { id: "fs-nextjs", title: "Next.js", description: "App Router, Server Components, data fetching patterns.", level: "core", resources: [{ label: "Next.js Learn", url: "https://nextjs.org/learn", type: "course" }] },
    ]},
    { id: "fs-backend", title: "Backend", icon: "⚙️", topics: [
      { id: "fs-node", title: "Node.js + Express", description: "REST APIs, middleware, authentication, file uploads.", level: "core", resources: [{ label: "Express Guide", url: "https://expressjs.com/en/guide/routing.html", type: "docs" }] },
      { id: "fs-db", title: "SQL & ORM", description: "PostgreSQL basics, Prisma or Drizzle ORM, migrations.", level: "core", resources: [{ label: "Prisma Docs", url: "https://www.prisma.io/docs", type: "docs" }] },
      { id: "fs-auth", title: "Auth & Security", description: "JWT, OAuth2, HTTPS, input validation, rate limiting.", level: "core", resources: [{ label: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", type: "article" }] },
    ]},
    { id: "fs-deploy", title: "Deployment", icon: "🚀", topics: [
      { id: "fs-docker", title: "Docker Basics", description: "Containerise your app, docker-compose for local dev.", level: "core", resources: [{ label: "Docker Getting Started", url: "https://docs.docker.com/get-started/", type: "docs" }] },
      { id: "fs-vercel", title: "Vercel / Railway", description: "Deploy frontend and backend, environment variables, domains.", level: "core", resources: [{ label: "Vercel Docs", url: "https://vercel.com/docs", type: "docs" }] },
      { id: "fs-monitoring", title: "Monitoring & Logging", description: "Sentry, LogRocket, structured logging, uptime monitoring.", level: "advanced", resources: [{ label: "Sentry Docs", url: "https://docs.sentry.io", type: "docs" }] },
    ]},
  ],
};

// ─── DevOps Engineer ─────────────────────────────────────────────────────────

const devopsRoadmap: CareerRoadmap = {
  id: "devops",
  title: "DevOps Engineer",
  icon: "🔁",
  color: "#D97706",
  bg: "#FFFBEB",
  description: "Bridge development and operations. Automate infrastructure, build CI/CD pipelines, and ensure system reliability.",
  jobTitles: ["DevOps Engineer", "Platform Engineer", "Site Reliability Engineer", "Cloud Engineer"],
  avgSalary: "Rp 15–35 jt/bulan",
  timeToJob: "12–18 months",
  projects: [
    { title: "Dockerised Node App + CI/CD", description: "Containerise a Node.js API, write a GitHub Actions pipeline to test, build, and push image to Docker Hub on every merge.", difficulty: "beginner", skills: ["Docker", "GitHub Actions", "Node.js"] },
    { title: "Kubernetes Deployment", description: "Deploy a multi-service app (API + Redis + Postgres) to a local k8s cluster with Helm charts, HPA, and health probes.", difficulty: "intermediate", skills: ["Kubernetes", "Helm", "Docker", "kubectl"] },
    { title: "Terraform AWS Infrastructure", description: "Provision a VPC, EC2, RDS, and S3 with Terraform. Remote state in S3, separate dev/prod workspaces.", difficulty: "advanced", skills: ["Terraform", "AWS", "IaC", "S3"] },
  ],
  sections: [
    { id: "do-os", title: "OS & Networking", icon: "🖥️", topics: [
      { id: "do-linux", title: "Linux Administration", description: "File system, processes, users, cron, systemd, logs.", level: "foundation", resources: [{ label: "Linux Command Line Book", url: "https://linuxcommand.org/tlcl.php", type: "book" }] },
      { id: "do-networking", title: "Networking Fundamentals", description: "TCP/IP, DNS, HTTP/S, load balancers, firewalls, VPNs.", level: "foundation", resources: [{ label: "Computer Networking Course", url: "https://www.youtube.com/watch?v=IPvYjXCsTg8", type: "video" }] },
      { id: "do-shell", title: "Shell Scripting", description: "Bash scripting, automation, cron jobs, environment management.", level: "core", resources: [{ label: "Bash Scripting Tutorial", url: "https://linuxconfig.org/bash-scripting-tutorial", type: "article" }] },
    ]},
    { id: "do-containers", title: "Containers & Orchestration", icon: "📦", topics: [
      { id: "do-docker", title: "Docker", description: "Dockerfile, multi-stage builds, networking, volumes, registries.", level: "foundation", resources: [{ label: "Docker Docs", url: "https://docs.docker.com", type: "docs" }] },
      { id: "do-k8s", title: "Kubernetes", description: "Pods, Deployments, Services, ConfigMaps, Helm charts, kubectl.", level: "core", resources: [{ label: "Kubernetes Docs", url: "https://kubernetes.io/docs/home/", type: "docs" }, { label: "Kubernetes Course (TechWorld)", url: "https://www.youtube.com/watch?v=X48VuDVv0do", type: "video" }] },
    ]},
    { id: "do-cicd", title: "CI/CD", icon: "🔧", topics: [
      { id: "do-github-actions", title: "GitHub Actions", description: "Workflow files, jobs, steps, matrix builds, secrets.", level: "core", resources: [{ label: "GitHub Actions Docs", url: "https://docs.github.com/en/actions", type: "docs" }] },
      { id: "do-jenkins", title: "Jenkins", description: "Pipeline as code, Jenkinsfile, plugins, agents.", level: "advanced", resources: [{ label: "Jenkins Docs", url: "https://www.jenkins.io/doc/", type: "docs" }] },
    ]},
    { id: "do-iac", title: "Infrastructure as Code", icon: "📋", topics: [
      { id: "do-terraform", title: "Terraform", description: "HCL syntax, providers, state management, modules, workspaces.", level: "core", resources: [{ label: "Terraform Docs", url: "https://developer.hashicorp.com/terraform/docs", type: "docs" }] },
      { id: "do-ansible", title: "Ansible", description: "Playbooks, roles, inventory, idempotent configuration.", level: "advanced", resources: [{ label: "Ansible Docs", url: "https://docs.ansible.com", type: "docs" }] },
    ]},
    { id: "do-cloud", title: "Cloud Platforms", icon: "☁️", topics: [
      { id: "do-aws", title: "AWS Core Services", description: "EC2, S3, RDS, Lambda, VPC, IAM, CloudWatch.", level: "core", resources: [{ label: "AWS Training", url: "https://aws.amazon.com/training/", type: "course" }] },
      { id: "do-monitoring", title: "Monitoring & Observability", description: "Prometheus, Grafana, ELK stack, distributed tracing.", level: "advanced", resources: [{ label: "Prometheus Docs", url: "https://prometheus.io/docs/introduction/overview/", type: "docs" }] },
    ]},
  ],
};

// ─── Mobile Developer (React Native) ────────────────────────────────────────

const mobileRoadmap: CareerRoadmap = {
  id: "mobile",
  title: "Mobile Developer",
  icon: "📱",
  color: "#0EA5E9",
  bg: "#F0F9FF",
  description: "Build iOS and Android apps. React Native lets you ship to both platforms with JavaScript.",
  jobTitles: ["Mobile Developer", "React Native Developer", "Android Developer", "iOS Developer"],
  avgSalary: "Rp 10–28 jt/bulan",
  timeToJob: "8–14 months",
  projects: [
    { title: "Expense Tracker App", description: "Log income and expenses by category. Charts, monthly summary, AsyncStorage persistence. Expo + React Native.", difficulty: "beginner", skills: ["React Native", "Expo", "AsyncStorage", "Charts"] },
    { title: "Habit Tracker with Notifications", description: "Create habits, track daily streaks, get push reminders. Supabase backend for sync across devices.", difficulty: "intermediate", skills: ["React Native", "Expo Notifications", "Supabase", "TanStack Query"] },
    { title: "Realtime Chat App", description: "One-on-one and group chat with presence indicators, image sharing, and push notifications. Supabase Realtime.", difficulty: "advanced", skills: ["React Native", "Supabase Realtime", "Expo", "Push Notifications"] },
  ],
  sections: [
    { id: "mob-foundation", title: "Foundation", icon: "📐", topics: [
      { id: "mob-js", title: "JavaScript & TypeScript", description: "ES6+, async patterns, TypeScript for type-safe mobile apps.", level: "foundation", resources: [{ label: "javascript.info", url: "https://javascript.info", type: "article" }] },
      { id: "mob-react", title: "React Fundamentals", description: "Components, props, state, hooks, lifecycle — prerequisite for RN.", level: "foundation", resources: [{ label: "React Docs", url: "https://react.dev", type: "docs" }] },
    ]},
    { id: "mob-rn", title: "React Native", icon: "⚛️", topics: [
      { id: "mob-rn-core", title: "RN Core Components", description: "View, Text, ScrollView, FlatList, Image, TextInput, Pressable.", level: "core", resources: [{ label: "RN Docs", url: "https://reactnative.dev/docs/components-and-apis", type: "docs" }] },
      { id: "mob-styling", title: "Styling in RN", description: "StyleSheet API, Flexbox layout, NativeWind/Tailwind, Dimensions.", level: "core", resources: [{ label: "RN Style Docs", url: "https://reactnative.dev/docs/style", type: "docs" }] },
      { id: "mob-navigation", title: "Navigation", description: "React Navigation — Stack, Tab, Drawer, deep linking, params.", level: "core", resources: [{ label: "React Navigation Docs", url: "https://reactnavigation.org/docs/getting-started", type: "docs" }] },
      { id: "mob-expo", title: "Expo & EAS", description: "Expo SDK, EAS Build, OTA updates, app.json config.", level: "core", resources: [{ label: "Expo Docs", url: "https://docs.expo.dev", type: "docs" }] },
    ]},
    { id: "mob-data", title: "Data & State", icon: "💾", topics: [
      { id: "mob-async-storage", title: "AsyncStorage & MMKV", description: "Local persistence, key-value storage, performance trade-offs.", level: "core", resources: [{ label: "AsyncStorage Docs", url: "https://react-native-async-storage.github.io/async-storage/", type: "docs" }] },
      { id: "mob-tanstack", title: "TanStack Query", description: "Server state, caching, background refetch, optimistic updates.", level: "core", resources: [{ label: "TanStack Query Docs", url: "https://tanstack.com/query/latest", type: "docs" }] },
      { id: "mob-zustand", title: "Zustand / Redux Toolkit", description: "Global client state, slices, devtools.", level: "core", resources: [{ label: "Zustand Docs", url: "https://docs.pmnd.rs/zustand/getting-started/introduction", type: "docs" }] },
    ]},
    { id: "mob-native", title: "Native & Platform", icon: "🔩", topics: [
      { id: "mob-permissions", title: "Permissions & APIs", description: "Camera, location, notifications, biometrics, share.", level: "advanced", resources: [{ label: "Expo Modules", url: "https://docs.expo.dev/versions/latest/", type: "docs" }] },
      { id: "mob-perf", title: "Performance", description: "JS thread vs UI thread, Hermes, Reanimated, FlashList.", level: "advanced", resources: [{ label: "RN Performance Docs", url: "https://reactnative.dev/docs/performance", type: "docs" }] },
      { id: "mob-publish", title: "Publishing to Stores", description: "App Store & Play Store submission, signing, metadata, reviews.", level: "advanced", resources: [{ label: "EAS Submit Docs", url: "https://docs.expo.dev/submit/introduction/", type: "docs" }] },
    ]},
  ],
};

// ─── Data Scientist ──────────────────────────────────────────────────────────

const dataScienceRoadmap: CareerRoadmap = {
  id: "data-science",
  title: "Data Scientist",
  icon: "📊",
  color: "#8B5CF6",
  bg: "#F5F3FF",
  description: "Extract insights from data using statistics, machine learning, and visualisation. Python is the primary language.",
  jobTitles: ["Data Scientist", "ML Engineer", "Data Analyst", "AI Engineer"],
  avgSalary: "Rp 12–35 jt/bulan",
  timeToJob: "12–24 months",
  projects: [
    { title: "Exploratory Data Analysis", description: "Pick any public dataset (Kaggle). Clean, explore, and visualise with Pandas, Seaborn, and a Jupyter notebook.", difficulty: "beginner", skills: ["Python", "Pandas", "Matplotlib", "Seaborn"] },
    { title: "Churn Prediction Model", description: "Binary classification on customer data. Feature engineering, scikit-learn pipeline, ROC-AUC evaluation, SHAP explainability.", difficulty: "intermediate", skills: ["scikit-learn", "Pandas", "SHAP", "Python"] },
    { title: "Sentiment Analysis API", description: "Fine-tune a DistilBERT model on product reviews. Serve via FastAPI, Docker, with a simple React frontend.", difficulty: "advanced", skills: ["HuggingFace", "PyTorch", "FastAPI", "Docker"] },
  ],
  sections: [
    { id: "ds-math", title: "Math & Statistics", icon: "📐", topics: [
      { id: "ds-linear-algebra", title: "Linear Algebra", description: "Vectors, matrices, eigenvalues, SVD — the backbone of ML models.", level: "foundation", resources: [{ label: "3Blue1Brown Essence of Linear Algebra", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab", type: "video" }] },
      { id: "ds-stats", title: "Statistics & Probability", description: "Distributions, hypothesis testing, p-values, Bayes theorem.", level: "foundation", resources: [{ label: "StatQuest YouTube", url: "https://www.youtube.com/@statquest", type: "video" }] },
      { id: "ds-calculus", title: "Calculus for ML", description: "Derivatives, chain rule, gradient descent intuition.", level: "foundation", resources: [{ label: "3Blue1Brown Calculus", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr", type: "video" }] },
    ]},
    { id: "ds-python", title: "Python for Data", icon: "🐍", topics: [
      { id: "ds-py-basics", title: "Python Fundamentals", description: "OOP, list comprehensions, iterators, generators, decorators.", level: "foundation", resources: [{ label: "Python Docs Tutorial", url: "https://docs.python.org/3/tutorial/", type: "docs" }] },
      { id: "ds-numpy", title: "NumPy & Pandas", description: "Array operations, DataFrames, groupby, merging, missing data.", level: "core", resources: [{ label: "Pandas Docs", url: "https://pandas.pydata.org/docs/user_guide/index.html", type: "docs" }] },
      { id: "ds-viz", title: "Data Visualisation", description: "Matplotlib, Seaborn, Plotly — charts, distributions, heatmaps.", level: "core", resources: [{ label: "Seaborn Tutorial", url: "https://seaborn.pydata.org/tutorial.html", type: "docs" }] },
    ]},
    { id: "ds-ml", title: "Machine Learning", icon: "🤖", topics: [
      { id: "ds-sklearn", title: "scikit-learn", description: "Regression, classification, clustering, pipelines, cross-validation.", level: "core", resources: [{ label: "scikit-learn User Guide", url: "https://scikit-learn.org/stable/user_guide.html", type: "docs" }] },
      { id: "ds-deep-learning", title: "Deep Learning Basics", description: "Neural networks, backprop, CNNs, RNNs — PyTorch or TensorFlow.", level: "advanced", resources: [{ label: "fast.ai Practical DL", url: "https://course.fast.ai", type: "course" }] },
      { id: "ds-nlp", title: "NLP & LLMs", description: "Tokenisation, embeddings, transformers, fine-tuning, RAG.", level: "advanced", resources: [{ label: "HuggingFace Course", url: "https://huggingface.co/learn/nlp-course", type: "course" }] },
    ]},
    { id: "ds-deploy", title: "ML Ops & Deployment", icon: "🚀", topics: [
      { id: "ds-mlflow", title: "Experiment Tracking", description: "MLflow, Weights & Biases — logging metrics, params, artefacts.", level: "advanced", resources: [{ label: "MLflow Docs", url: "https://mlflow.org/docs/latest/index.html", type: "docs" }] },
      { id: "ds-api", title: "Serving Models", description: "FastAPI + Docker for model serving, batch vs real-time inference.", level: "advanced", resources: [{ label: "FastAPI Docs", url: "https://fastapi.tiangolo.com", type: "docs" }] },
    ]},
  ],
};

// ─── Cyber Security ──────────────────────────────────────────────────────────

const cyberSecRoadmap: CareerRoadmap = {
  id: "cyber-security",
  title: "Cyber Security",
  icon: "🔐",
  color: "#EF4444",
  bg: "#FFF1F2",
  description: "Protect systems and networks from attacks. Learn offensive and defensive security techniques.",
  jobTitles: ["Security Engineer", "Penetration Tester", "SOC Analyst", "Security Analyst"],
  avgSalary: "Rp 12–40 jt/bulan",
  timeToJob: "12–24 months",
  projects: [
    { title: "Vulnerable Web App Lab", description: "Set up DVWA or Juice Shop locally, exploit OWASP Top 10 vulnerabilities, and write a findings report.", difficulty: "beginner", skills: ["Burp Suite", "OWASP", "Kali Linux", "HTTP"] },
    { title: "Network Scanner Tool", description: "Python script that does host discovery, port scanning, and banner grabbing. Wrapper around socket + nmap.", difficulty: "intermediate", skills: ["Python", "Nmap", "Networking", "Sockets"] },
    { title: "CTF Portfolio (5 machines)", description: "Solve and write up 5 HackTheBox or TryHackMe machines covering recon, exploitation, and privilege escalation.", difficulty: "advanced", skills: ["Metasploit", "Linux", "Privilege Escalation", "OSINT"] },
  ],
  sections: [
    { id: "cs-foundation", title: "Foundation", icon: "📐", topics: [
      { id: "cs-networking", title: "Networking", description: "TCP/IP, DNS, HTTP, TLS, firewalls, VPNs, Wireshark basics.", level: "foundation", resources: [{ label: "CompTIA Network+ Study", url: "https://www.professormesser.com/network-plus/n10-008/n10-008-video/n10-008-training-course/", type: "video" }] },
      { id: "cs-linux", title: "Linux & Command Line", description: "File permissions, processes, users, netstat, iptables.", level: "foundation", resources: [{ label: "OverTheWire Bandit", url: "https://overthewire.org/wargames/bandit/", type: "article" }] },
      { id: "cs-python", title: "Python Scripting", description: "Automation scripts, network tools, parsing, socket programming.", level: "foundation", resources: [{ label: "Black Hat Python Book", url: "https://nostarch.com/black-hat-python2E", type: "book" }] },
    ]},
    { id: "cs-offensive", title: "Offensive Security", icon: "⚔️", topics: [
      { id: "cs-recon", title: "Reconnaissance", description: "OSINT, Shodan, Nmap, subdomain enumeration, footprinting.", level: "core", resources: [{ label: "TryHackMe — Recon", url: "https://tryhackme.com/room/passiverecon", type: "course" }] },
      { id: "cs-web-attacks", title: "Web Application Attacks", description: "OWASP Top 10: SQLi, XSS, CSRF, SSRF, IDOR, XXE.", level: "core", resources: [{ label: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", type: "article" }, { label: "PortSwigger Web Academy", url: "https://portswigger.net/web-security", type: "course" }] },
      { id: "cs-pentest", title: "Penetration Testing", description: "Metasploit, Burp Suite, privilege escalation, post-exploitation.", level: "advanced", resources: [{ label: "TCM Security Pentest Course", url: "https://academy.tcm-sec.com", type: "course" }] },
    ]},
    { id: "cs-defensive", title: "Defensive Security", icon: "🛡️", topics: [
      { id: "cs-soc", title: "SOC & SIEM", description: "Log analysis, Splunk, ELK, alert triage, incident response.", level: "core", resources: [{ label: "Splunk Free Training", url: "https://www.splunk.com/en_us/training.html", type: "course" }] },
      { id: "cs-forensics", title: "Digital Forensics", description: "Memory analysis, disk imaging, timeline analysis, Autopsy.", level: "advanced", resources: [{ label: "Digital Forensics Lab", url: "https://github.com/frankwxu/digital-forensics-lab", type: "article" }] },
    ]},
    { id: "cs-certs", title: "Certifications", icon: "🏅", topics: [
      { id: "cs-comptia", title: "CompTIA Security+", description: "Entry-level security cert recognised worldwide. Good first cert.", level: "core", resources: [{ label: "Professor Messer Security+", url: "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-comptia-security-plus-course/", type: "video" }] },
      { id: "cs-ejpt", title: "eJPT / OSCP", description: "eJPT for entry, OSCP for professional pentest certification.", level: "advanced", resources: [{ label: "eJPT on INE", url: "https://ine.com/learning/certifications/internal/elearnsecurity-junior-penetration-tester-cert", type: "course" }] },
    ]},
  ],
};

// ─── UI/UX Designer ─────────────────────────────────────────────────────────

const uiuxRoadmap: CareerRoadmap = {
  id: "uiux",
  title: "UI/UX Designer",
  icon: "🎨",
  color: "#EC4899",
  bg: "#FDF2F8",
  description: "Design beautiful, usable digital products. Master design thinking, Figma, and user research.",
  jobTitles: ["UI Designer", "UX Designer", "Product Designer", "Interaction Designer"],
  avgSalary: "Rp 8–25 jt/bulan",
  timeToJob: "6–12 months",
  projects: [
    { title: "Mobile App Redesign", description: "Pick any app you use daily. Audit its UX, identify pain points, then redesign 5 key screens in Figma with a full component library.", difficulty: "beginner", skills: ["Figma", "UX Audit", "Components", "Auto Layout"] },
    { title: "Design System", description: "Build a complete design system — colour tokens, typography scale, 20+ components, dark/light mode, documented in Figma.", difficulty: "intermediate", skills: ["Figma", "Design Tokens", "Components", "Documentation"] },
    { title: "End-to-End Product Case Study", description: "Full UX process: user research, affinity mapping, wireframes, prototype, usability testing, and iterated hi-fi mockups.", difficulty: "advanced", skills: ["User Research", "Wireframing", "Prototyping", "Usability Testing"] },
  ],
  sections: [
    { id: "ux-principles", title: "Design Principles", icon: "📐", topics: [
      { id: "ux-fundamentals", title: "Design Fundamentals", description: "Typography, colour theory, spacing, visual hierarchy, grid systems.", level: "foundation", resources: [{ label: "Design for Developers (Scrimba)", url: "https://scrimba.com/learn/design", type: "course" }] },
      { id: "ux-thinking", title: "Design Thinking", description: "Empathise, Define, Ideate, Prototype, Test — the 5-stage process.", level: "foundation", resources: [{ label: "IDEO Design Thinking", url: "https://designthinking.ideo.com", type: "article" }] },
    ]},
    { id: "ux-research", title: "User Research", icon: "🔍", topics: [
      { id: "ux-interviews", title: "User Interviews", description: "Recruiting, interview scripts, affinity mapping, synthesis.", level: "core", resources: [{ label: "Nielsen Norman User Interviews", url: "https://www.nngroup.com/articles/user-interviews/", type: "article" }] },
      { id: "ux-usability", title: "Usability Testing", description: "Moderated vs unmoderated tests, task analysis, heuristic evaluation.", level: "core", resources: [{ label: "NN/g Usability Testing", url: "https://www.nngroup.com/articles/usability-testing-101/", type: "article" }] },
    ]},
    { id: "ux-tools", title: "Design Tools", icon: "🛠️", topics: [
      { id: "ux-figma", title: "Figma", description: "Frames, components, auto layout, variants, prototyping, dev mode.", level: "core", resources: [{ label: "Figma Learn", url: "https://www.figma.com/learn/", type: "course" }, { label: "Figma YouTube Channel", url: "https://www.youtube.com/@Figma", type: "video" }] },
      { id: "ux-design-systems", title: "Design Systems", description: "Component libraries, tokens, documentation, Storybook integration.", level: "advanced", resources: [{ label: "Design Systems Handbook", url: "https://www.designbetter.co/design-systems-handbook", type: "book" }] },
    ]},
    { id: "ux-portfolio", title: "Portfolio & Career", icon: "💼", topics: [
      { id: "ux-case-studies", title: "Case Studies", description: "Document your design process: problem, research, iteration, outcome.", level: "core", resources: [{ label: "UX Portfolio Guide (NN/g)", url: "https://www.nngroup.com/articles/ux-portfolio-case-study/", type: "article" }] },
      { id: "ux-handoff", title: "Developer Handoff", description: "Spec annotations, Figma inspect, design tokens, collaboration.", level: "advanced", resources: [{ label: "Figma Dev Mode Docs", url: "https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode", type: "docs" }] },
    ]},
  ],
};

// ─── Android Developer ───────────────────────────────────────────────────────

const androidRoadmap: CareerRoadmap = {
  id: "android",
  title: "Android Developer",
  icon: "🤖",
  color: "#16A34A",
  bg: "#F0FDF4",
  description: "Build native Android apps with Kotlin and Jetpack Compose. Google's modern Android development stack.",
  jobTitles: ["Android Developer", "Mobile Engineer", "Kotlin Developer"],
  avgSalary: "Rp 10–30 jt/bulan",
  timeToJob: "10–18 months",
  projects: [
    { title: "Notes App with Room", description: "Create, edit, delete notes with search. Room for local DB, Jetpack Compose UI, ViewModel + StateFlow.", difficulty: "beginner", skills: ["Kotlin", "Jetpack Compose", "Room", "ViewModel"] },
    { title: "Weather App", description: "Fetch weather from OpenWeatherMap API. Location permission, Retrofit, Hilt DI, animated conditions, offline cache.", difficulty: "intermediate", skills: ["Kotlin", "Retrofit", "Hilt", "Coroutines"] },
    { title: "Fitness Tracker", description: "Log workouts, track sets/reps/weight over time. Room with migrations, charts, background sync, Play Store release.", difficulty: "advanced", skills: ["Kotlin", "Jetpack Compose", "Room", "WorkManager"] },
  ],
  sections: [
    { id: "and-kotlin", title: "Kotlin", icon: "🟪", topics: [
      { id: "and-kotlin-basics", title: "Kotlin Fundamentals", description: "Null safety, data classes, coroutines, extension functions, lambdas.", level: "foundation", resources: [{ label: "Kotlin Docs", url: "https://kotlinlang.org/docs/home.html", type: "docs" }, { label: "Kotlin Koans", url: "https://play.kotlinlang.org/koans/overview", type: "course" }] },
      { id: "and-coroutines", title: "Coroutines & Flow", description: "Suspend functions, scopes, Flow, StateFlow, SharedFlow.", level: "core", resources: [{ label: "Coroutines Guide", url: "https://kotlinlang.org/docs/coroutines-guide.html", type: "docs" }] },
    ]},
    { id: "and-ui", title: "UI Development", icon: "🎨", topics: [
      { id: "and-compose", title: "Jetpack Compose", description: "Composables, state hoisting, theming, animations, LazyColumn.", level: "core", resources: [{ label: "Compose Pathway", url: "https://developer.android.com/courses/pathways/compose", type: "course" }] },
      { id: "and-material3", title: "Material Design 3", description: "Dynamic colour, typography scale, component library.", level: "core", resources: [{ label: "Material 3 Docs", url: "https://m3.material.io", type: "docs" }] },
    ]},
    { id: "and-arch", title: "Architecture", icon: "🏗️", topics: [
      { id: "and-mvvm", title: "MVVM + ViewModel", description: "ViewModel, LiveData vs StateFlow, Repository pattern.", level: "core", resources: [{ label: "Android Architecture Guide", url: "https://developer.android.com/topic/architecture", type: "docs" }] },
      { id: "and-di", title: "Dependency Injection (Hilt)", description: "Hilt modules, bindings, scopes, Inject annotations.", level: "core", resources: [{ label: "Hilt Docs", url: "https://developer.android.com/training/dependency-injection/hilt-android", type: "docs" }] },
      { id: "and-room", title: "Room Database", description: "Entities, DAOs, migrations, Flow queries, type converters.", level: "core", resources: [{ label: "Room Docs", url: "https://developer.android.com/training/data-storage/room", type: "docs" }] },
    ]},
    { id: "and-publish", title: "Publishing", icon: "🚀", topics: [
      { id: "and-signing", title: "App Signing & Release", description: "Keystore, build variants, ProGuard/R8, Play Console setup.", level: "advanced", resources: [{ label: "Publish on Google Play", url: "https://developer.android.com/distribute/googleplay/start", type: "docs" }] },
    ]},
  ],
};

// ─── Product Manager ─────────────────────────────────────────────────────────

const productManagerRoadmap: CareerRoadmap = {
  id: "product-manager",
  title: "Product Manager",
  icon: "📦",
  color: "#F59E0B",
  bg: "#FFFBEB",
  description: "Define what to build and why. Bridge customer needs, business goals, and engineering execution.",
  jobTitles: ["Product Manager", "Product Owner", "Associate PM", "Technical PM"],
  avgSalary: "Rp 15–50 jt/bulan",
  timeToJob: "6–18 months",
  projects: [
    { title: "PRD for a Feature", description: "Write a full Product Requirements Document for a real feature on a product you use. Problem, users, success metrics, edge cases.", difficulty: "beginner", skills: ["PRD Writing", "User Stories", "Acceptance Criteria"] },
    { title: "Competitive Analysis Report", description: "Analyse 3 competitors in one vertical. Positioning matrix, feature gap analysis, pricing strategy, and strategic recommendations.", difficulty: "intermediate", skills: ["Market Research", "SWOT", "Positioning", "Deck Design"] },
    { title: "Shipped Side Project", description: "Define, scope, and ship a small real product end-to-end — working with a developer (or no-code tools). Measure 2 metrics post-launch.", difficulty: "advanced", skills: ["Discovery", "Prioritisation", "OKRs", "Analytics"] },
  ],
  sections: [
    { id: "pm-foundation", title: "PM Fundamentals", icon: "📐", topics: [
      { id: "pm-role", title: "The PM Role", description: "Discovery vs delivery, stakeholder management, working with engineers.", level: "foundation", resources: [{ label: "Inspired by Marty Cagan", url: "https://www.svpg.com/inspired-how-to-create-tech-products-customers-love/", type: "book" }] },
      { id: "pm-frameworks", title: "Prioritisation Frameworks", description: "RICE, ICE, MoSCoW, Kano model, opportunity scoring.", level: "foundation", resources: [{ label: "Product Plan Prioritisation", url: "https://www.productplan.com/learn/prioritization-techniques/", type: "article" }] },
    ]},
    { id: "pm-discovery", title: "Product Discovery", icon: "🔍", topics: [
      { id: "pm-user-research", title: "User Research", description: "Customer interviews, jobs-to-be-done, surveys, usability testing.", level: "core", resources: [{ label: "JTBD Theory", url: "https://jtbd.info/2-what-is-jobs-to-be-done-jtbd-796b82081cca", type: "article" }] },
      { id: "pm-metrics", title: "Product Metrics", description: "North Star metric, AARRR funnel, OKRs, retention, NPS.", level: "core", resources: [{ label: "Reforge Metrics", url: "https://www.reforge.com/blog/north-star-metric-and-input", type: "article" }] },
    ]},
    { id: "pm-execution", title: "Execution", icon: "⚡", topics: [
      { id: "pm-agile", title: "Agile & Scrum", description: "Sprints, backlog grooming, user stories, acceptance criteria, retros.", level: "core", resources: [{ label: "Scrum Guide", url: "https://scrumguides.org/scrum-guide.html", type: "docs" }] },
      { id: "pm-roadmapping", title: "Roadmapping", description: "Now/Next/Later, themes vs features, communicating strategy.", level: "core", resources: [{ label: "Productboard Roadmap Guide", url: "https://www.productboard.com/blog/product-roadmap/", type: "article" }] },
      { id: "pm-analytics", title: "Analytics & SQL", description: "Basic SQL for self-serve analytics, Mixpanel, Amplitude, Looker.", level: "advanced", resources: [{ label: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial/", type: "course" }] },
    ]},
  ],
};

// ─── Cloud Architect ─────────────────────────────────────────────────────────

const cloudArchitectRoadmap: CareerRoadmap = {
  id: "cloud-architect",
  title: "Cloud Architect",
  icon: "☁️",
  color: "#0891B2",
  bg: "#ECFEFF",
  description: "Design and manage cloud infrastructure at scale. Multi-cloud expertise (AWS, Azure, GCP), architecture patterns, and cost optimization.",
  jobTitles: ["Cloud Architect", "Solutions Architect", "Cloud Engineer", "Infrastructure Architect"],
  avgSalary: "Rp 20–50 jt/bulan",
  timeToJob: "18–36 months",
  projects: [
    { title: "3-Tier App on AWS", description: "Deploy a React frontend (S3+CloudFront), Node.js API (EC2 + ALB), and Postgres (RDS) with proper VPC, SGs, and IAM.", difficulty: "intermediate", skills: ["AWS EC2", "RDS", "S3", "VPC", "IAM"] },
    { title: "Serverless API", description: "Build a REST API with API Gateway + Lambda + DynamoDB. CI/CD via SAM or Serverless Framework, CloudWatch alarms.", difficulty: "intermediate", skills: ["AWS Lambda", "API Gateway", "DynamoDB", "CloudWatch"] },
    { title: "Multi-Region DR Setup", description: "Design and implement active-passive failover between two AWS regions. Route 53 health checks, RDS cross-region replica, runbook.", difficulty: "advanced", skills: ["AWS", "Route 53", "RDS", "Terraform", "DR Planning"] },
  ],
  sections: [
    { id: "ca-foundation", title: "Cloud Fundamentals", icon: "📐", topics: [
      { id: "ca-iaas-paas", title: "IaaS vs PaaS vs SaaS", description: "Service models, shared responsibility model, use cases for each.", level: "foundation", resources: [{ label: "AWS Cloud Concepts", url: "https://aws.amazon.com/what-is-cloud-computing/", type: "article" }] },
      { id: "ca-regions", title: "Regions & Availability Zones", description: "Global infrastructure, latency, disaster recovery, multi-region design.", level: "foundation", resources: [{ label: "AWS Global Infrastructure", url: "https://aws.amazon.com/about-aws/global-infrastructure/", type: "docs" }] },
    ]},
    { id: "ca-aws", title: "AWS Core Services", icon: "🟧", topics: [
      { id: "ca-ec2", title: "EC2 & Auto Scaling", description: "Instance types, AMIs, Launch Templates, Auto Scaling Groups, spot instances.", level: "core", resources: [{ label: "AWS EC2 Docs", url: "https://docs.aws.amazon.com/ec2/", type: "docs" }] },
      { id: "ca-vpc", title: "VPC Networking", description: "Subnets, route tables, Internet Gateway, NAT Gateway, Security Groups, NACLs.", level: "core", resources: [{ label: "AWS VPC Guide", url: "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html", type: "docs" }] },
      { id: "ca-s3", title: "S3 & Storage", description: "Buckets, lifecycle policies, versioning, encryption, CloudFront CDN.", level: "core", resources: [{ label: "AWS S3 Docs", url: "https://docs.aws.amazon.com/s3/", type: "docs" }] },
      { id: "ca-rds", title: "RDS & Databases", description: "Multi-AZ, read replicas, Aurora, backup strategies, parameter groups.", level: "core", resources: [{ label: "AWS RDS Docs", url: "https://docs.aws.amazon.com/rds/", type: "docs" }] },
      { id: "ca-lambda", title: "Lambda & Serverless", description: "Function triggers, layers, VPC access, cold starts, Step Functions.", level: "advanced", resources: [{ label: "AWS Lambda Docs", url: "https://docs.aws.amazon.com/lambda/", type: "docs" }] },
    ]},
    { id: "ca-patterns", title: "Architecture Patterns", icon: "🏗️", topics: [
      { id: "ca-well-architected", title: "AWS Well-Architected", description: "5 pillars: operational excellence, security, reliability, performance, cost.", level: "core", resources: [{ label: "AWS Well-Architected Framework", url: "https://aws.amazon.com/architecture/well-architected/", type: "docs" }] },
      { id: "ca-microservices", title: "Microservices on Cloud", description: "Service mesh, API Gateway, ECS/EKS, observability.", level: "advanced", resources: [{ label: "Microservices on AWS", url: "https://aws.amazon.com/microservices/", type: "article" }] },
      { id: "ca-ha", title: "High Availability & DR", description: "RTO/RPO, backup strategies, multi-region failover, health checks.", level: "advanced", resources: [{ label: "AWS Disaster Recovery", url: "https://aws.amazon.com/disaster-recovery/", type: "article" }] },
    ]},
    { id: "ca-security", title: "Security & Compliance", icon: "🔒", topics: [
      { id: "ca-iam", title: "IAM Best Practices", description: "Least privilege, roles, policies, MFA, SCPs, ABAC.", level: "core", resources: [{ label: "AWS IAM Best Practices", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html", type: "docs" }] },
      { id: "ca-compliance", title: "Compliance Frameworks", description: "GDPR, HIPAA, SOC 2, ISO 27001 — cloud controls and audit trails.", level: "advanced", resources: [{ label: "AWS Compliance Programs", url: "https://aws.amazon.com/compliance/programs/", type: "docs" }] },
    ]},
    { id: "ca-cost", title: "Cost Optimization", icon: "💰", topics: [
      { id: "ca-cost-mgmt", title: "Cost Management", description: "Cost Explorer, budgets, Reserved Instances, Savings Plans, tagging strategy.", level: "core", resources: [{ label: "AWS Cost Optimization", url: "https://aws.amazon.com/aws-cost-management/", type: "docs" }] },
    ]},
  ],
};

// ─── iOS Developer ───────────────────────────────────────────────────────────

const iosRoadmap: CareerRoadmap = {
  id: "ios",
  title: "iOS Developer",
  icon: "🍎",
  color: "#3B82F6",
  bg: "#EFF6FF",
  description: "Build native iOS apps with Swift and SwiftUI. Apple's modern development stack for iPhone and iPad.",
  jobTitles: ["iOS Developer", "Swift Developer", "Mobile Engineer"],
  avgSalary: "Rp 12–35 jt/bulan",
  timeToJob: "10–18 months",
  projects: [
    { title: "Pomodoro Timer", description: "Focus timer with customisable work/break intervals, session history, and local notifications. SwiftUI + SwiftData.", difficulty: "beginner", skills: ["SwiftUI", "SwiftData", "Notifications", "Timers"] },
    { title: "Crypto Price Tracker", description: "Live crypto prices from CoinGecko API. Watchlist with persistence, price charts with Swift Charts, Combine publishers.", difficulty: "intermediate", skills: ["Swift", "SwiftUI", "Combine", "URLSession"] },
    { title: "Budget & Finance App", description: "Track transactions by category, monthly budget goals, iCloud sync via CloudKit, App Store submission.", difficulty: "advanced", skills: ["SwiftUI", "SwiftData", "CloudKit", "App Store"] },
  ],
  sections: [
    { id: "ios-swift", title: "Swift Language", icon: "🦅", topics: [
      { id: "ios-swift-basics", title: "Swift Fundamentals", description: "Optionals, closures, protocols, generics, error handling, ARC.", level: "foundation", resources: [{ label: "Swift.org Tour", url: "https://docs.swift.org/swift-book/GuidedTour/GuidedTour.html", type: "docs" }, { label: "100 Days of Swift", url: "https://www.hackingwithswift.com/100", type: "course" }] },
      { id: "ios-async", title: "Async/Await & Concurrency", description: "Tasks, async let, actors, MainActor, structured concurrency.", level: "core", resources: [{ label: "Swift Concurrency", url: "https://docs.swift.org/swift-book/LanguageGuide/Concurrency.html", type: "docs" }] },
    ]},
    { id: "ios-ui", title: "UI Development", icon: "🎨", topics: [
      { id: "ios-swiftui", title: "SwiftUI", description: "Views, state, bindings, @State/@Binding/@ObservedObject, List, NavigationStack.", level: "core", resources: [{ label: "Apple SwiftUI Tutorials", url: "https://developer.apple.com/tutorials/swiftui", type: "course" }] },
      { id: "ios-animations", title: "Animations & Gestures", description: "withAnimation, transitions, matched geometry effect, DragGesture.", level: "core", resources: [{ label: "Hacking with Swift Animations", url: "https://www.hackingwithswift.com/books/ios-swiftui/animations", type: "article" }] },
    ]},
    { id: "ios-arch", title: "Architecture", icon: "🏗️", topics: [
      { id: "ios-mvvm", title: "MVVM Pattern", description: "ObservableObject, ViewModel lifecycle, Combine publishers.", level: "core", resources: [{ label: "iOS Architecture Patterns", url: "https://medium.com/ios-os-x-development/ios-architecture-patterns-ecba4c38de52", type: "article" }] },
      { id: "ios-swiftdata", title: "SwiftData", description: "Model persistence, queries, relationships, CloudKit sync.", level: "core", resources: [{ label: "SwiftData Docs", url: "https://developer.apple.com/documentation/swiftdata", type: "docs" }] },
      { id: "ios-networking", title: "Networking", description: "URLSession, Codable, async APIs, error handling, Alamofire.", level: "core", resources: [{ label: "URLSession Tutorial", url: "https://www.kodeco.com/3244963-urlsession-tutorial-getting-started", type: "article" }] },
    ]},
    { id: "ios-publish", title: "Publishing", icon: "🚀", topics: [
      { id: "ios-xcode", title: "Xcode & Instruments", description: "Debugging, profiling, memory leaks, Instruments, TestFlight.", level: "advanced", resources: [{ label: "Xcode Help", url: "https://developer.apple.com/documentation/xcode", type: "docs" }] },
      { id: "ios-appstore", title: "App Store Submission", description: "App Store Connect, provisioning profiles, screenshots, ASO.", level: "advanced", resources: [{ label: "App Distribution Guide", url: "https://developer.apple.com/distribute/", type: "docs" }] },
    ]},
  ],
};

// ─── ML Engineer ─────────────────────────────────────────────────────────────

const mlEngineerRoadmap: CareerRoadmap = {
  id: "ml-engineer",
  title: "ML Engineer",
  icon: "🤖",
  color: "#7C3AED",
  bg: "#F5F3FF",
  description: "Build production-grade machine learning systems. Bridge data science and software engineering to ship models at scale.",
  jobTitles: ["ML Engineer", "AI Engineer", "Applied Scientist", "MLOps Engineer"],
  avgSalary: "Rp 18–45 jt/bulan",
  timeToJob: "18–30 months",
  projects: [
    { title: "House Price Predictor", description: "Train a regression model on public housing data. Feature engineering, cross-validation, SHAP explanations, deployed as a FastAPI endpoint.", difficulty: "beginner", skills: ["scikit-learn", "Pandas", "FastAPI", "SHAP"] },
    { title: "Image Classifier API", description: "Fine-tune ResNet on a custom dataset (flowers, food, etc.). ONNX export, TorchServe or FastAPI serving, Dockerised.", difficulty: "intermediate", skills: ["PyTorch", "ONNX", "Docker", "FastAPI"] },
    { title: "MLOps Pipeline", description: "End-to-end: data versioning (DVC), training (MLflow tracking), CI with GitHub Actions, model registry, automated retraining on drift.", difficulty: "advanced", skills: ["MLflow", "DVC", "GitHub Actions", "Evidently AI"] },
  ],
  sections: [
    { id: "mle-foundations", title: "Foundations", icon: "📐", topics: [
      { id: "mle-python", title: "Python for ML", description: "NumPy, Pandas, virtual environments, type hints, profiling.", level: "foundation", resources: [{ label: "Python Data Science Handbook", url: "https://jakevdp.github.io/PythonDataScienceHandbook/", type: "book" }] },
      { id: "mle-math", title: "Math for ML", description: "Linear algebra, calculus, probability, statistics, information theory.", level: "foundation", resources: [{ label: "Mathematics for ML (book)", url: "https://mml-book.github.io/", type: "book" }] },
    ]},
    { id: "mle-modeling", title: "Modeling", icon: "🧠", topics: [
      { id: "mle-classical", title: "Classical ML", description: "Linear/logistic regression, trees, ensembles, SVMs, clustering, scikit-learn.", level: "core", resources: [{ label: "scikit-learn User Guide", url: "https://scikit-learn.org/stable/user_guide.html", type: "docs" }] },
      { id: "mle-deep", title: "Deep Learning", description: "Neural nets, CNNs, RNNs, transformers — PyTorch or TensorFlow.", level: "core", resources: [{ label: "fast.ai Practical DL", url: "https://course.fast.ai", type: "course" }, { label: "PyTorch Tutorials", url: "https://pytorch.org/tutorials/", type: "docs" }] },
      { id: "mle-llm", title: "LLMs & Foundation Models", description: "Fine-tuning, PEFT/LoRA, RAG, prompt engineering, LangChain.", level: "advanced", resources: [{ label: "HuggingFace NLP Course", url: "https://huggingface.co/learn/nlp-course", type: "course" }] },
    ]},
    { id: "mle-engineering", title: "ML Engineering", icon: "⚙️", topics: [
      { id: "mle-features", title: "Feature Engineering & Stores", description: "Feature pipelines, Feast, online vs offline stores, data drift.", level: "core", resources: [{ label: "Feast Feature Store Docs", url: "https://docs.feast.dev", type: "docs" }] },
      { id: "mle-training", title: "Distributed Training", description: "Data parallelism, model parallelism, PyTorch DDP, Ray Train.", level: "advanced", resources: [{ label: "PyTorch Distributed", url: "https://pytorch.org/tutorials/beginner/dist_overview.html", type: "docs" }] },
      { id: "mle-serving", title: "Model Serving", description: "TorchServe, Triton, FastAPI, latency vs throughput, batching.", level: "core", resources: [{ label: "BentoML Docs", url: "https://docs.bentoml.com", type: "docs" }] },
    ]},
    { id: "mle-mlops", title: "MLOps", icon: "🔁", topics: [
      { id: "mle-tracking", title: "Experiment Tracking", description: "MLflow, Weights & Biases, DVC, model registry.", level: "core", resources: [{ label: "MLflow Docs", url: "https://mlflow.org/docs/latest/", type: "docs" }] },
      { id: "mle-pipelines", title: "ML Pipelines", description: "Kubeflow, ZenML, Metaflow, Airflow for orchestrating training.", level: "advanced", resources: [{ label: "ZenML Docs", url: "https://docs.zenml.io", type: "docs" }] },
      { id: "mle-monitoring", title: "Model Monitoring", description: "Data drift, concept drift, Evidently AI, Grafana dashboards.", level: "advanced", resources: [{ label: "Evidently AI Docs", url: "https://docs.evidentlyai.com", type: "docs" }] },
    ]},
  ],
};

// ─── Blockchain Developer ────────────────────────────────────────────────────

const blockchainRoadmap: CareerRoadmap = {
  id: "blockchain",
  title: "Blockchain Developer",
  icon: "⛓️",
  color: "#F59E0B",
  bg: "#FFFBEB",
  description: "Build decentralised applications, smart contracts, and Web3 protocols on Ethereum and other blockchains.",
  jobTitles: ["Blockchain Developer", "Smart Contract Engineer", "Web3 Developer", "DeFi Engineer"],
  avgSalary: "Rp 20–60 jt/bulan",
  timeToJob: "12–24 months",
  projects: [
    { title: "ERC-20 Token", description: "Deploy a custom ERC-20 token on Sepolia testnet. Minting, burning, transfer events. Verify on Etherscan.", difficulty: "beginner", skills: ["Solidity", "Hardhat", "OpenZeppelin", "Etherscan"] },
    { title: "NFT Minting DApp", description: "IPFS-hosted metadata, ERC-721 contract, React + Wagmi frontend for minting and viewing owned NFTs.", difficulty: "intermediate", skills: ["Solidity", "IPFS", "Wagmi", "React"] },
    { title: "DeFi Yield Vault", description: "Deposit ERC-20 tokens, earn simulated yield. Proxy upgradeable pattern, re-entrancy guard, Foundry tests with 95%+ coverage.", difficulty: "advanced", skills: ["Solidity", "Foundry", "OpenZeppelin", "DeFi"] },
  ],
  sections: [
    { id: "bc-fundamentals", title: "Blockchain Fundamentals", icon: "📐", topics: [
      { id: "bc-how", title: "How Blockchains Work", description: "Distributed ledgers, consensus mechanisms (PoW, PoS), nodes, wallets.", level: "foundation", resources: [{ label: "Bitcoin Whitepaper", url: "https://bitcoin.org/bitcoin.pdf", type: "article" }, { label: "Ethereum.org Learn", url: "https://ethereum.org/en/learn/", type: "article" }] },
      { id: "bc-crypto", title: "Cryptography Basics", description: "Public/private keys, hashing, digital signatures, Merkle trees.", level: "foundation", resources: [{ label: "Crypto101", url: "https://www.crypto101.io/", type: "book" }] },
    ]},
    { id: "bc-solidity", title: "Smart Contracts", icon: "📜", topics: [
      { id: "bc-solidity", title: "Solidity", description: "Data types, functions, modifiers, events, inheritance, gas optimisation.", level: "core", resources: [{ label: "Solidity Docs", url: "https://docs.soliditylang.org", type: "docs" }, { label: "CryptoZombies", url: "https://cryptozombies.io", type: "course" }] },
      { id: "bc-patterns", title: "Contract Patterns", description: "Upgradeable contracts (proxy pattern), factory pattern, re-entrancy guard.", level: "advanced", resources: [{ label: "OpenZeppelin Contracts", url: "https://docs.openzeppelin.com/contracts", type: "docs" }] },
      { id: "bc-security", title: "Smart Contract Security", description: "Re-entrancy, overflow, oracle manipulation, auditing with Slither.", level: "advanced", resources: [{ label: "SWC Registry", url: "https://swcregistry.io", type: "article" }] },
    ]},
    { id: "bc-tooling", title: "Dev Tooling", icon: "🔧", topics: [
      { id: "bc-hardhat", title: "Hardhat / Foundry", description: "Compile, test, deploy, fork mainnet, scripts, tasks.", level: "core", resources: [{ label: "Hardhat Docs", url: "https://hardhat.org/docs", type: "docs" }, { label: "Foundry Book", url: "https://book.getfoundry.sh", type: "docs" }] },
      { id: "bc-ethers", title: "Ethers.js / Viem", description: "Connect wallets, read/write contracts, event listeners, ENS.", level: "core", resources: [{ label: "Ethers.js Docs", url: "https://docs.ethers.org/v6/", type: "docs" }] },
    ]},
    { id: "bc-web3", title: "Web3 Frontend & DeFi", icon: "🌐", topics: [
      { id: "bc-wagmi", title: "React + Wagmi", description: "Wallet connection, hooks for contracts, RainbowKit UI.", level: "core", resources: [{ label: "Wagmi Docs", url: "https://wagmi.sh", type: "docs" }] },
      { id: "bc-defi", title: "DeFi Protocols", description: "AMMs, lending protocols (Aave, Compound), yield farming, flash loans.", level: "advanced", resources: [{ label: "DeFi Developer Road Map", url: "https://github.com/OffcierCia/DeFi-Developer-Road-Map", type: "article" }] },
    ]},
  ],
};

// ─── Game Developer ──────────────────────────────────────────────────────────

const gameDevRoadmap: CareerRoadmap = {
  id: "game-dev",
  title: "Game Developer",
  icon: "🎮",
  color: "#8B5CF6",
  bg: "#F5F3FF",
  description: "Build games for PC, mobile, and console. Master Unity or Unreal Engine, game physics, and design patterns.",
  jobTitles: ["Game Developer", "Unity Developer", "Gameplay Programmer", "Game Designer"],
  avgSalary: "Rp 8–30 jt/bulan",
  timeToJob: "12–24 months",
  projects: [
    { title: "2D Platformer", description: "Side-scrolling platformer with player movement, enemies, collectibles, and 3 levels. Unity 2D physics, tilemaps, ScriptableObjects.", difficulty: "beginner", skills: ["Unity", "C#", "2D Physics", "Tilemaps"] },
    { title: "Top-Down Shooter", description: "Player shoots waves of enemies with different AI patterns. Object pooling, save system, leaderboard, WebGL build on itch.io.", difficulty: "intermediate", skills: ["Unity", "C#", "Object Pooling", "AI State Machine"] },
    { title: "Multiplayer Puzzle Game", description: "2-player co-op puzzle game using Mirror Networking. Lobby, matchmaking, client-side prediction, deployed server.", difficulty: "advanced", skills: ["Unity", "Mirror", "C#", "Multiplayer"] },
  ],
  sections: [
    { id: "gd-foundations", title: "Foundations", icon: "📐", topics: [
      { id: "gd-csharp", title: "C# Fundamentals", description: "OOP, inheritance, interfaces, delegates, events, async/await.", level: "foundation", resources: [{ label: "C# Docs", url: "https://learn.microsoft.com/en-us/dotnet/csharp/", type: "docs" }] },
      { id: "gd-math", title: "Game Math", description: "Vectors, matrices, quaternions, lerp, dot/cross product, trigonometry.", level: "foundation", resources: [{ label: "Essential Mathematics for Games", url: "https://essentialmath.com", type: "book" }] },
    ]},
    { id: "gd-unity", title: "Unity Engine", icon: "🔷", topics: [
      { id: "gd-unity-basics", title: "Unity Basics", description: "GameObjects, Components, Prefabs, Scenes, Physics2D/3D, Input System.", level: "core", resources: [{ label: "Unity Learn", url: "https://learn.unity.com", type: "course" }, { label: "Brackeys YouTube", url: "https://www.youtube.com/@Brackeys", type: "video" }] },
      { id: "gd-scripting", title: "Unity Scripting", description: "MonoBehaviour lifecycle, coroutines, ScriptableObjects, serialization.", level: "core", resources: [{ label: "Unity Scripting API", url: "https://docs.unity3d.com/ScriptReference/", type: "docs" }] },
      { id: "gd-animation", title: "Animation & UI", description: "Animator Controller, blend trees, UI Toolkit, TextMeshPro.", level: "core", resources: [{ label: "Unity Animation Docs", url: "https://docs.unity3d.com/Manual/AnimationOverview.html", type: "docs" }] },
    ]},
    { id: "gd-patterns", title: "Game Patterns", icon: "🧩", topics: [
      { id: "gd-design-patterns", title: "Design Patterns", description: "Singleton, Observer, Command, State Machine, Object Pooling.", level: "core", resources: [{ label: "Game Programming Patterns", url: "https://gameprogrammingpatterns.com", type: "book" }] },
      { id: "gd-ecs", title: "ECS Architecture", description: "Entity-Component-System, Unity DOTS, performance for large worlds.", level: "advanced", resources: [{ label: "Unity DOTS Guide", url: "https://docs.unity3d.com/Packages/com.unity.entities@latest", type: "docs" }] },
    ]},
    { id: "gd-advanced", title: "Advanced Topics", icon: "🚀", topics: [
      { id: "gd-multiplayer", title: "Multiplayer & Netcode", description: "Client-server, prediction, lag compensation, Mirror/Netcode for GameObjects.", level: "advanced", resources: [{ label: "Mirror Networking Docs", url: "https://mirror-networking.gitbook.io/docs/", type: "docs" }] },
      { id: "gd-shaders", title: "Shaders & VFX", description: "Shader Graph, HLSL, post-processing, particle systems.", level: "advanced", resources: [{ label: "Unity Shader Graph Tutorial", url: "https://learn.unity.com/tutorial/introduction-to-shader-graph", type: "course" }] },
      { id: "gd-publish", title: "Build & Publish", description: "Build settings, app stores (Steam, Google Play, App Store), IAP, ads.", level: "advanced", resources: [{ label: "Unity Publishing", url: "https://unity.com/solutions/release-and-publish", type: "article" }] },
    ]},
  ],
};

// ─── Data Engineer ───────────────────────────────────────────────────────────

const dataEngineerRoadmap: CareerRoadmap = {
  id: "data-engineer",
  title: "Data Engineer",
  icon: "🗂️",
  color: "#0891B2",
  bg: "#ECFEFF",
  description: "Build pipelines and infrastructure for data processing. Enable data scientists and analysts with clean, reliable data.",
  jobTitles: ["Data Engineer", "Analytics Engineer", "ETL Developer", "Big Data Engineer"],
  avgSalary: "Rp 15–35 jt/bulan",
  timeToJob: "10–18 months",
  projects: [
    { title: "ETL Pipeline with Airflow", description: "Pull data from a public API daily, transform with Pandas, load into Postgres. Airflow DAG, retries, email on failure.", difficulty: "beginner", skills: ["Airflow", "Python", "PostgreSQL", "Pandas"] },
    { title: "dbt Analytics Project", description: "Take raw e-commerce data, model it in dbt — staging, intermediate, mart layers. Tests, docs, and a Metabase dashboard.", difficulty: "intermediate", skills: ["dbt", "SQL", "PostgreSQL", "Metabase"] },
    { title: "Streaming Data Pipeline", description: "Kafka producer ingests events, Spark Streaming consumes and aggregates, results land in a Delta Lake table on S3.", difficulty: "advanced", skills: ["Kafka", "Spark", "Delta Lake", "S3"] },
  ],
  sections: [
    { id: "de-foundations", title: "Foundations", icon: "📐", topics: [
      { id: "de-sql", title: "SQL Mastery", description: "Joins, CTEs, window functions, indexes, query optimization, performance.", level: "foundation", resources: [{ label: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial/", type: "course" }, { label: "PostgreSQL Exercises", url: "https://pgexercises.com", type: "article" }] },
      { id: "de-python", title: "Python for Data", description: "Pandas, data wrangling, file I/O (CSV, JSON, Parquet), API requests.", level: "foundation", resources: [{ label: "Python Data Science Handbook", url: "https://jakevdp.github.io/PythonDataScienceHandbook/", type: "book" }] },
    ]},
    { id: "de-databases", title: "Databases", icon: "🗄️", topics: [
      { id: "de-rdbms", title: "Relational Databases", description: "PostgreSQL, normalization, transactions, partitioning, replication.", level: "core", resources: [{ label: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com", type: "article" }] },
      { id: "de-warehouses", title: "Data Warehouses", description: "Snowflake, BigQuery, Redshift — columnar storage, compute vs storage.", level: "core", resources: [{ label: "Snowflake University", url: "https://learn.snowflake.com", type: "course" }] },
      { id: "de-lakes", title: "Data Lakes", description: "S3, Delta Lake, Iceberg, Hudi — schema evolution, ACID on object stores.", level: "advanced", resources: [{ label: "Delta Lake Docs", url: "https://docs.delta.io", type: "docs" }] },
    ]},
    { id: "de-etl", title: "ETL / ELT Pipelines", icon: "🔀", topics: [
      { id: "de-airflow", title: "Apache Airflow", description: "DAGs, operators, sensors, task dependencies, retries, XComs.", level: "core", resources: [{ label: "Airflow Docs", url: "https://airflow.apache.org/docs/", type: "docs" }] },
      { id: "de-dbt", title: "dbt (Data Build Tool)", description: "SQL transformations, models, tests, docs, incremental models.", level: "core", resources: [{ label: "dbt Learn", url: "https://learn.getdbt.com", type: "course" }] },
      { id: "de-spark", title: "Apache Spark", description: "RDDs, DataFrames, PySpark, Spark SQL, partitioning, joins.", level: "advanced", resources: [{ label: "Databricks Spark Tutorial", url: "https://databricks.com/spark/about", type: "article" }] },
    ]},
    { id: "de-streaming", title: "Streaming Data", icon: "📡", topics: [
      { id: "de-kafka", title: "Apache Kafka", description: "Topics, partitions, producers, consumers, Kafka Connect, Streams API.", level: "advanced", resources: [{ label: "Kafka Docs", url: "https://kafka.apache.org/documentation/", type: "docs" }] },
    ]},
    { id: "de-ops", title: "DataOps", icon: "🔧", topics: [
      { id: "de-monitoring", title: "Data Observability", description: "Data quality checks, schema validation, Monte Carlo, Great Expectations.", level: "advanced", resources: [{ label: "Great Expectations Docs", url: "https://docs.greatexpectations.io", type: "docs" }] },
    ]},
  ],
};

// ─── QA / Test Engineer ──────────────────────────────────────────────────────

const qaEngineerRoadmap: CareerRoadmap = {
  id: "qa-engineer",
  title: "QA / Test Engineer",
  icon: "🧪",
  color: "#16A34A",
  bg: "#F0FDF4",
  description: "Ensure software quality through manual and automated testing. Build test frameworks, catch bugs early, and own quality culture.",
  jobTitles: ["QA Engineer", "Test Automation Engineer", "SDET", "Quality Engineer"],
  avgSalary: "Rp 8–25 jt/bulan",
  timeToJob: "6–12 months",
  projects: [
    { title: "Automated UI Test Suite", description: "Write Playwright tests for a public web app (e.g. a todo app). Page Object Model, fixtures, CI run on every push.", difficulty: "beginner", skills: ["Playwright", "TypeScript", "Page Object Model", "GitHub Actions"] },
    { title: "API Test Framework", description: "Build a Postman/Newman test suite for a REST API. Contract tests with Pact, HTML report generation, integrated in CI.", difficulty: "intermediate", skills: ["Postman", "Newman", "Pact", "CI/CD"] },
    { title: "Performance Test Report", description: "Load test a web service with k6 — ramp-up scenarios, thresholds, p95 latency targets. Write a formal perf test report.", difficulty: "advanced", skills: ["k6", "Performance Testing", "Grafana", "Reporting"] },
  ],
  sections: [
    { id: "qa-foundations", title: "Testing Fundamentals", icon: "📐", topics: [
      { id: "qa-types", title: "Types of Testing", description: "Unit, integration, E2E, regression, smoke, UAT, exploratory testing.", level: "foundation", resources: [{ label: "Testing Types (Atlassian)", url: "https://www.atlassian.com/continuous-delivery/software-testing/types-of-software-testing", type: "article" }] },
      { id: "qa-sdlc", title: "SDLC & STLC", description: "Where QA fits in agile, test planning, entry/exit criteria, defect lifecycle.", level: "foundation", resources: [{ label: "ISTQB Foundation Syllabus", url: "https://www.istqb.org/downloads/syllabi/foundation-level.html", type: "docs" }] },
      { id: "qa-test-design", title: "Test Design Techniques", description: "Equivalence partitioning, boundary value, decision tables, pairwise testing.", level: "core", resources: [{ label: "Test Design Techniques Guide", url: "https://www.softwaretestinghelp.com/software-testing-techniques/", type: "article" }] },
    ]},
    { id: "qa-automation", title: "Test Automation", icon: "🤖", topics: [
      { id: "qa-selenium", title: "Selenium / Playwright", description: "Browser automation, page object model, selectors, waits, CI integration.", level: "core", resources: [{ label: "Playwright Docs", url: "https://playwright.dev/docs/intro", type: "docs" }, { label: "Selenium Docs", url: "https://www.selenium.dev/documentation/", type: "docs" }] },
      { id: "qa-api-testing", title: "API Testing", description: "Postman, REST Assured, Newman, contract testing, Pact.", level: "core", resources: [{ label: "Postman Learning Center", url: "https://learning.postman.com", type: "course" }] },
      { id: "qa-unit", title: "Unit & Integration Testing", description: "Jest, pytest, JUnit, mocking, test doubles, code coverage.", level: "core", resources: [{ label: "Jest Docs", url: "https://jestjs.io/docs/getting-started", type: "docs" }] },
    ]},
    { id: "qa-perf", title: "Performance & Security", icon: "⚡", topics: [
      { id: "qa-load", title: "Load & Performance Testing", description: "k6, JMeter, Locust — virtual users, ramp-up, assertions, reports.", level: "advanced", resources: [{ label: "k6 Docs", url: "https://k6.io/docs/", type: "docs" }] },
      { id: "qa-security", title: "Security Testing Basics", description: "OWASP ZAP, DAST, SQL injection checks, auth testing.", level: "advanced", resources: [{ label: "OWASP Testing Guide", url: "https://owasp.org/www-project-web-security-testing-guide/", type: "docs" }] },
    ]},
    { id: "qa-cicd", title: "CI/CD & Tooling", icon: "🔧", topics: [
      { id: "qa-pipeline", title: "Testing in CI/CD", description: "GitHub Actions, test parallelisation, flaky test detection, reporting.", level: "core", resources: [{ label: "GitHub Actions Docs", url: "https://docs.github.com/en/actions", type: "docs" }] },
      { id: "qa-bdd", title: "BDD with Cucumber", description: "Gherkin syntax, step definitions, living documentation, team collaboration.", level: "optional", resources: [{ label: "Cucumber Docs", url: "https://cucumber.io/docs/cucumber/", type: "docs" }] },
    ]},
  ],
};

// ─── Site Reliability Engineer ───────────────────────────────────────────────

const sreRoadmap: CareerRoadmap = {
  id: "sre",
  title: "Site Reliability Engineer",
  icon: "📡",
  color: "#DC2626",
  bg: "#FEF2F2",
  description: "Keep production systems reliable, scalable, and fast. Apply software engineering to operations — SLOs, incident response, and chaos engineering.",
  jobTitles: ["Site Reliability Engineer", "Platform Engineer", "Infrastructure Engineer", "Production Engineer"],
  avgSalary: "Rp 18–45 jt/bulan",
  timeToJob: "18–36 months",
  projects: [
    { title: "Prometheus + Grafana Stack", description: "Instrument a Node.js app with custom metrics. Deploy Prometheus scraper and a Grafana dashboard with RED method panels and alerts.", difficulty: "intermediate", skills: ["Prometheus", "Grafana", "Node.js", "PromQL"] },
    { title: "Incident Response Runbook", description: "Pick a real-world outage (e.g. a public post-mortem). Write a full runbook: detection, triage steps, rollback, and blameless post-mortem template.", difficulty: "intermediate", skills: ["Incident Management", "SLOs", "Documentation", "On-call"] },
    { title: "Chaos Engineering Lab", description: "Use Litmus or chaos-mesh on a local k8s cluster. Inject pod failures, network latency, and CPU stress. Measure SLO impact and add circuit breakers.", difficulty: "advanced", skills: ["Kubernetes", "Chaos Engineering", "Litmus", "SLOs"] },
  ],
  sections: [
    { id: "sre-foundations", title: "SRE Fundamentals", icon: "📐", topics: [
      { id: "sre-slo", title: "SLIs, SLOs & SLAs", description: "Error budgets, reliability targets, toil reduction, service-level objectives.", level: "foundation", resources: [{ label: "Google SRE Book", url: "https://sre.google/sre-book/table-of-contents/", type: "book" }] },
      { id: "sre-linux", title: "Linux Deep Dive", description: "Kernel, syscalls, namespaces, cgroups, networking stack, perf tools.", level: "foundation", resources: [{ label: "Linux Performance (Brendan Gregg)", url: "https://www.brendangregg.com/linuxperf.html", type: "article" }] },
    ]},
    { id: "sre-observability", title: "Observability", icon: "🔭", topics: [
      { id: "sre-metrics", title: "Metrics (Prometheus + Grafana)", description: "PromQL, recording rules, alerting rules, dashboards, RED method.", level: "core", resources: [{ label: "Prometheus Docs", url: "https://prometheus.io/docs/", type: "docs" }, { label: "Grafana Docs", url: "https://grafana.com/docs/grafana/latest/", type: "docs" }] },
      { id: "sre-logging", title: "Structured Logging (ELK/Loki)", description: "Log aggregation, Logstash, Kibana, Grafana Loki, log-based alerts.", level: "core", resources: [{ label: "Elastic Stack Docs", url: "https://www.elastic.co/guide/index.html", type: "docs" }] },
      { id: "sre-tracing", title: "Distributed Tracing", description: "OpenTelemetry, Jaeger, Tempo — trace context propagation, span analysis.", level: "advanced", resources: [{ label: "OpenTelemetry Docs", url: "https://opentelemetry.io/docs/", type: "docs" }] },
    ]},
    { id: "sre-reliability", title: "Reliability Engineering", icon: "🛡️", topics: [
      { id: "sre-incident", title: "Incident Management", description: "On-call rotation, runbooks, post-mortems (blameless), PagerDuty.", level: "core", resources: [{ label: "PagerDuty Incident Response", url: "https://response.pagerduty.com", type: "article" }] },
      { id: "sre-chaos", title: "Chaos Engineering", description: "Chaos Monkey, Litmus, fault injection, game days, blast radius.", level: "advanced", resources: [{ label: "Principles of Chaos Engineering", url: "https://principlesofchaos.org", type: "article" }] },
      { id: "sre-capacity", title: "Capacity Planning", description: "Traffic forecasting, auto-scaling policies, resource right-sizing.", level: "advanced", resources: [{ label: "Google SRE Workbook — Capacity", url: "https://sre.google/workbook/table-of-contents/", type: "book" }] },
    ]},
    { id: "sre-infra", title: "Infrastructure", icon: "☁️", topics: [
      { id: "sre-k8s", title: "Kubernetes Operations", description: "Cluster upgrades, node autoscaler, PodDisruptionBudgets, resource limits.", level: "core", resources: [{ label: "Kubernetes Docs", url: "https://kubernetes.io/docs/home/", type: "docs" }] },
      { id: "sre-terraform", title: "IaC (Terraform)", description: "State management, modules, drift detection, Atlantis for GitOps.", level: "core", resources: [{ label: "Terraform Docs", url: "https://developer.hashicorp.com/terraform/docs", type: "docs" }] },
    ]},
  ],
};

// ─── Database Administrator ──────────────────────────────────────────────────

const dbaRoadmap: CareerRoadmap = {
  id: "dba",
  title: "Database Administrator",
  icon: "🗄️",
  color: "#B45309",
  bg: "#FFFBEB",
  description: "Design, maintain, and optimise databases. Ensure data integrity, performance, availability, and security across production systems.",
  jobTitles: ["Database Administrator", "DBA", "Database Engineer", "Data Platform Engineer"],
  avgSalary: "Rp 12–30 jt/bulan",
  timeToJob: "12–18 months",
  projects: [
    { title: "Query Optimisation Case Study", description: "Take a slow Postgres query from a public dataset. Profile with EXPLAIN ANALYZE, add indexes, rewrite with CTEs, measure before/after.", difficulty: "beginner", skills: ["PostgreSQL", "EXPLAIN ANALYZE", "Indexing", "SQL"] },
    { title: "HA Postgres Setup", description: "Set up primary + replica with Patroni and HAProxy on 3 local VMs. Simulate failover, measure RTO, document the runbook.", difficulty: "intermediate", skills: ["PostgreSQL", "Patroni", "HAProxy", "Replication"] },
    { title: "Automated Backup & Restore", description: "Implement PITR with WAL archiving to S3, automated pg_basebackup, restore drills, and a Grafana alert when backup age > 24h.", difficulty: "advanced", skills: ["PostgreSQL", "WAL Archiving", "S3", "Monitoring"] },
  ],
  sections: [
    { id: "dba-sql", title: "SQL Mastery", icon: "📝", topics: [
      { id: "dba-advanced-sql", title: "Advanced SQL", description: "CTEs, window functions, lateral joins, recursive queries, EXPLAIN ANALYZE.", level: "foundation", resources: [{ label: "Use The Index, Luke", url: "https://use-the-index-luke.com", type: "article" }, { label: "PostgreSQL Exercises", url: "https://pgexercises.com", type: "article" }] },
      { id: "dba-stored-procs", title: "Stored Procedures & Functions", description: "PL/pgSQL, triggers, user-defined functions, procedural logic.", level: "core", resources: [{ label: "PostgreSQL PL/pgSQL Docs", url: "https://www.postgresql.org/docs/current/plpgsql.html", type: "docs" }] },
    ]},
    { id: "dba-admin", title: "Database Administration", icon: "⚙️", topics: [
      { id: "dba-installation", title: "Installation & Config", description: "postgresql.conf, pg_hba.conf, connection pooling (PgBouncer), tablespaces.", level: "core", resources: [{ label: "PostgreSQL Admin Guide", url: "https://www.postgresql.org/docs/current/admin.html", type: "docs" }] },
      { id: "dba-backup", title: "Backup & Recovery", description: "pg_dump, pg_basebackup, PITR, WAL archiving, recovery strategies.", level: "core", resources: [{ label: "PostgreSQL Backup Docs", url: "https://www.postgresql.org/docs/current/backup.html", type: "docs" }] },
      { id: "dba-ha", title: "High Availability", description: "Streaming replication, Patroni, pgpool-II, failover, read replicas.", level: "advanced", resources: [{ label: "Patroni Docs", url: "https://patroni.readthedocs.io", type: "docs" }] },
    ]},
    { id: "dba-performance", title: "Performance Tuning", icon: "⚡", topics: [
      { id: "dba-indexes", title: "Indexing Strategies", description: "B-tree, GIN, GiST, partial indexes, covering indexes, index bloat.", level: "core", resources: [{ label: "PostgreSQL Indexes Docs", url: "https://www.postgresql.org/docs/current/indexes.html", type: "docs" }] },
      { id: "dba-query-opt", title: "Query Optimization", description: "EXPLAIN, EXPLAIN ANALYZE, planner statistics, vacuuming, autovacuum.", level: "core", resources: [{ label: "EXPLAIN Docs", url: "https://www.postgresql.org/docs/current/using-explain.html", type: "docs" }] },
      { id: "dba-partitioning", title: "Partitioning & Sharding", description: "Range/list/hash partitioning, Citus for horizontal sharding.", level: "advanced", resources: [{ label: "Citus Docs", url: "https://docs.citusdata.com", type: "docs" }] },
    ]},
    { id: "dba-nosql", title: "NoSQL & Cloud Databases", icon: "☁️", topics: [
      { id: "dba-nosql-overview", title: "NoSQL Systems", description: "MongoDB, Redis, Cassandra, DynamoDB — when to use each.", level: "core", resources: [{ label: "MongoDB Docs", url: "https://www.mongodb.com/docs/", type: "docs" }] },
      { id: "dba-cloud-db", title: "Cloud-Managed Databases", description: "AWS RDS, Aurora, Cloud Spanner, AlloyDB — managed vs self-hosted trade-offs.", level: "advanced", resources: [{ label: "AWS RDS Docs", url: "https://docs.aws.amazon.com/rds/", type: "docs" }] },
    ]},
  ],
};

// ─── Embedded Systems Engineer ───────────────────────────────────────────────

const embeddedRoadmap: CareerRoadmap = {
  id: "embedded",
  title: "Embedded Systems Engineer",
  icon: "🔌",
  color: "#059669",
  bg: "#ECFDF5",
  description: "Program microcontrollers and hardware. Build firmware for IoT devices, robotics, and consumer electronics.",
  jobTitles: ["Embedded Engineer", "Firmware Engineer", "IoT Developer", "Systems Programmer"],
  avgSalary: "Rp 10–30 jt/bulan",
  timeToJob: "18–36 months",
  projects: [
    { title: "Temperature Logger", description: "Read a DHT11/DHT22 sensor on Arduino, log data over UART to a PC, and visualise on a simple Python serial plotter.", difficulty: "beginner", skills: ["Arduino", "C", "UART", "Python"] },
    { title: "IoT Door Sensor", description: "ESP32 detects door open/close via reed switch, publishes to MQTT broker, triggers a Node-RED dashboard alert and Telegram notification.", difficulty: "intermediate", skills: ["ESP32", "MQTT", "Node-RED", "C++"] },
    { title: "RTOS Motor Controller", description: "FreeRTOS on STM32 — two tasks: PID speed control via PWM and UART command interface. Logic analyser to verify timing.", difficulty: "advanced", skills: ["STM32", "FreeRTOS", "C", "PWM", "PID"] },
  ],
  sections: [
    { id: "emb-foundations", title: "Foundations", icon: "📐", topics: [
      { id: "emb-c", title: "C Programming", description: "Pointers, memory management, structs, bitwise ops, volatile keyword.", level: "foundation", resources: [{ label: "The C Programming Language (K&R)", url: "https://en.wikipedia.org/wiki/The_C_Programming_Language", type: "book" }] },
      { id: "emb-electronics", title: "Electronics Basics", description: "Voltage, current, Ohm's law, capacitors, transistors, logic levels.", level: "foundation", resources: [{ label: "All About Circuits", url: "https://www.allaboutcircuits.com", type: "article" }] },
      { id: "emb-digital", title: "Digital Logic", description: "Binary, hex, logic gates, flip-flops, state machines, timing diagrams.", level: "foundation", resources: [{ label: "Nand to Tetris", url: "https://www.nand2tetris.org", type: "course" }] },
    ]},
    { id: "emb-microcontrollers", title: "Microcontrollers", icon: "🔧", topics: [
      { id: "emb-arduino", title: "Arduino / AVR", description: "GPIO, PWM, ADC, I2C, SPI, UART — starting point for embedded.", level: "core", resources: [{ label: "Arduino Reference", url: "https://www.arduino.cc/reference/en/", type: "docs" }] },
      { id: "emb-stm32", title: "STM32 / ARM Cortex-M", description: "Registers, HAL library, timers, interrupts, DMA, clock trees.", level: "core", resources: [{ label: "STM32 Reference Manuals", url: "https://www.st.com/en/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus.html", type: "docs" }] },
      { id: "emb-rtos", title: "RTOS (FreeRTOS)", description: "Tasks, queues, semaphores, mutexes, scheduling, watchdog timers.", level: "advanced", resources: [{ label: "FreeRTOS Docs", url: "https://www.freertos.org/Documentation/RTOS_book.html", type: "docs" }] },
    ]},
    { id: "emb-protocols", title: "Protocols & Interfaces", icon: "📡", topics: [
      { id: "emb-serial", title: "Serial Protocols", description: "UART, SPI, I2C, CAN bus — timing, framing, debugging with logic analyser.", level: "core", resources: [{ label: "SparkFun Serial Comms", url: "https://learn.sparkfun.com/tutorials/serial-communication", type: "article" }] },
      { id: "emb-iot", title: "IoT Connectivity", description: "MQTT, BLE, WiFi (ESP32), LoRaWAN, AWS IoT Core.", level: "advanced", resources: [{ label: "ESP-IDF Docs", url: "https://docs.espressif.com/projects/esp-idf/en/latest/", type: "docs" }] },
    ]},
    { id: "emb-advanced", title: "Advanced Topics", icon: "🚀", topics: [
      { id: "emb-linux", title: "Embedded Linux", description: "Yocto, Buildroot, device trees, kernel modules, U-Boot.", level: "advanced", resources: [{ label: "Yocto Project Docs", url: "https://docs.yoctoproject.org", type: "docs" }] },
      { id: "emb-debugging", title: "Debugging & Testing", description: "JTAG/SWD, GDB, oscilloscopes, unit testing with Unity/Ceedling.", level: "advanced", resources: [{ label: "Embedded Artistry Testing", url: "https://embeddedartistry.com/blog/2020/05/04/an-introduction-to-embedded-testing/", type: "article" }] },
    ]},
  ],
};

// ─── Technical Writer ────────────────────────────────────────────────────────

const technicalWriterRoadmap: CareerRoadmap = {
  id: "technical-writer",
  title: "Technical Writer",
  icon: "✍️",
  color: "#6366F1",
  bg: "#EEF2FF",
  description: "Create clear, accurate documentation for developers and users. API docs, guides, tutorials, and content strategy for technical products.",
  jobTitles: ["Technical Writer", "Documentation Engineer", "Developer Advocate", "Content Engineer"],
  avgSalary: "Rp 8–25 jt/bulan",
  timeToJob: "6–12 months",
  projects: [
    { title: "API Reference Docs", description: "Document a public REST API (GitHub, Stripe, etc.) from scratch using OpenAPI 3.0. Publish with Redoc or Stoplight. Include code examples in 2 languages.", difficulty: "beginner", skills: ["OpenAPI", "Markdown", "Redoc", "REST APIs"] },
    { title: "Docs-as-Code Site", description: "Build a full documentation site with Docusaurus. Version your docs in Git, set up CI to deploy on merge, include search and dark mode.", difficulty: "intermediate", skills: ["Docusaurus", "Markdown", "GitHub Actions", "Git"] },
    { title: "Developer Tutorial Series", description: "Write a 5-part tutorial series for a real open-source library. Each part builds on the last, includes runnable code samples and a feedback survey.", difficulty: "advanced", skills: ["Technical Writing", "Code Samples", "SEO", "Developer Experience"] },
  ],
  sections: [
    { id: "tw-writing", title: "Writing Craft", icon: "📝", topics: [
      { id: "tw-style", title: "Technical Style Guides", description: "Microsoft Writing Style Guide, Google Developer Docs Style — tone, voice, clarity.", level: "foundation", resources: [{ label: "Google Developer Documentation Style Guide", url: "https://developers.google.com/style", type: "docs" }, { label: "Microsoft Writing Style Guide", url: "https://learn.microsoft.com/en-us/style-guide/welcome/", type: "docs" }] },
      { id: "tw-minimalism", title: "Minimalism in Docs", description: "Task-oriented writing, DITA principles, progressive disclosure.", level: "foundation", resources: [{ label: "Every Page is Page One", url: "https://everypageispageone.com", type: "article" }] },
      { id: "tw-structured", title: "Structured Writing", description: "Topic-based authoring, concept/task/reference model, reuse.", level: "core", resources: [{ label: "DITA Introduction", url: "https://www.oasis-open.org/committees/dita/", type: "docs" }] },
    ]},
    { id: "tw-docs-as-code", title: "Docs as Code", icon: "💻", topics: [
      { id: "tw-markdown", title: "Markdown & MDX", description: "Markdown syntax, frontmatter, MDX components, doc site generators.", level: "foundation", resources: [{ label: "Markdown Guide", url: "https://www.markdownguide.org", type: "docs" }] },
      { id: "tw-git", title: "Git for Writers", description: "Branching, pull requests, reviews, conflict resolution in prose.", level: "core", resources: [{ label: "Git for Docs Writers", url: "https://www.writethedocs.org/guide/tools/git-for-docs/", type: "article" }] },
      { id: "tw-static-sites", title: "Doc Site Generators", description: "Docusaurus, MkDocs, Sphinx, Hugo — building and deploying doc sites.", level: "core", resources: [{ label: "Docusaurus Docs", url: "https://docusaurus.io/docs", type: "docs" }] },
    ]},
    { id: "tw-api-docs", title: "API Documentation", icon: "🔌", topics: [
      { id: "tw-openapi", title: "OpenAPI / Swagger", description: "Writing OpenAPI 3.0 specs, generating reference docs, Redoc.", level: "core", resources: [{ label: "OpenAPI Specification", url: "https://spec.openapis.org/oas/latest.html", type: "docs" }, { label: "Swagger Editor", url: "https://editor.swagger.io", type: "article" }] },
      { id: "tw-api-concepts", title: "API Concepts for Writers", description: "REST, authentication, request/response, pagination, error codes.", level: "core", resources: [{ label: "I'd Rather Be Writing — API Docs", url: "https://idratherbewriting.com/learnapidoc/", type: "course" }] },
    ]},
    { id: "tw-tools", title: "Tools & Process", icon: "🛠️", topics: [
      { id: "tw-diagramming", title: "Diagrams & Visuals", description: "Mermaid, draw.io, Excalidraw, screenshots, annotated images.", level: "core", resources: [{ label: "Mermaid Docs", url: "https://mermaid.js.org/intro/", type: "docs" }] },
      { id: "tw-metrics", title: "Docs Metrics", description: "Page analytics, time-on-page, search queries, user feedback loops.", level: "optional", resources: [{ label: "Write the Docs Guide", url: "https://www.writethedocs.org/guide/", type: "article" }] },
    ]},
  ],
};

// ─── Scrum Master / Agile Coach ──────────────────────────────────────────────

const scrumMasterRoadmap: CareerRoadmap = {
  id: "scrum-master",
  title: "Scrum Master",
  icon: "🏃",
  color: "#0EA5E9",
  bg: "#F0F9FF",
  description: "Facilitate agile teams to deliver value continuously. Remove blockers, coach the team on Scrum, and drive continuous improvement.",
  jobTitles: ["Scrum Master", "Agile Coach", "Agile Delivery Manager", "RTE"],
  avgSalary: "Rp 12–35 jt/bulan",
  timeToJob: "3–12 months",
  projects: [
    { title: "Sprint Retrospective Facilitation", description: "Facilitate a real (or simulated) retro using 3 different formats (Start/Stop/Continue, 4Ls, Sailboat). Document outcomes and action items.", difficulty: "beginner", skills: ["Facilitation", "Retrospectives", "Miro", "Team Dynamics"] },
    { title: "Team Metrics Dashboard", description: "Build a dashboard tracking velocity, cycle time, and sprint burndown for a real or mock team. Present insights and improvement actions.", difficulty: "intermediate", skills: ["Agile Metrics", "Jira", "Excel/Sheets", "Data Storytelling"] },
    { title: "Agile Transformation Plan", description: "Design a 3-month agile transformation roadmap for a fictional waterfall team. Stakeholder analysis, change management, training plan, success metrics.", difficulty: "advanced", skills: ["Change Management", "SAFe", "Coaching", "OKRs"] },
  ],
  sections: [
    { id: "sm-agile", title: "Agile & Scrum", icon: "📐", topics: [
      { id: "sm-manifesto", title: "Agile Manifesto & Principles", description: "4 values, 12 principles, agile mindset vs process — understanding the why.", level: "foundation", resources: [{ label: "Agile Manifesto", url: "https://agilemanifesto.org", type: "article" }] },
      { id: "sm-scrum", title: "Scrum Framework", description: "Roles (PO, SM, Dev), events (Sprint, Planning, Daily, Review, Retro), artifacts.", level: "foundation", resources: [{ label: "Scrum Guide 2020", url: "https://scrumguides.org/scrum-guide.html", type: "docs" }] },
      { id: "sm-kanban", title: "Kanban", description: "Visualise workflow, WIP limits, flow metrics, Kanban vs Scrum.", level: "core", resources: [{ label: "Kanban Guide", url: "https://kanbanguides.org/html-kanban-guide/", type: "docs" }] },
    ]},
    { id: "sm-facilitation", title: "Facilitation", icon: "🎯", topics: [
      { id: "sm-ceremonies", title: "Running Scrum Ceremonies", description: "Sprint Planning, Daily Standup, Sprint Review, Retrospective facilitation techniques.", level: "core", resources: [{ label: "Fun Retrospectives", url: "https://www.funretrospectives.com", type: "article" }] },
      { id: "sm-conflict", title: "Conflict Resolution", description: "Team dynamics, Tuckman stages, coaching conversations, non-violent communication.", level: "core", resources: [{ label: "Coaching Agile Teams (book)", url: "https://www.lyssa.com/coaching-agile-teams", type: "book" }] },
    ]},
    { id: "sm-metrics", title: "Metrics & Improvement", icon: "📊", topics: [
      { id: "sm-velocity", title: "Velocity & Forecasting", description: "Story points, velocity trends, Monte Carlo forecasting, capacity planning.", level: "core", resources: [{ label: "AgileForce Forecasting Guide", url: "https://medium.com/agileinsider/monte-carlo-simulation-in-agile-project-planning-8bc11a91fe9f", type: "article" }] },
      { id: "sm-flow", title: "Flow Metrics", description: "Cycle time, lead time, throughput, cumulative flow diagrams.", level: "advanced", resources: [{ label: "Actionable Agile Metrics (book)", url: "https://actionableagile.com/resources/publications/aamfp/", type: "book" }] },
    ]},
    { id: "sm-scaling", title: "Scaling Agile", icon: "🏗️", topics: [
      { id: "sm-safe", title: "SAFe Framework", description: "PI Planning, ARTs, trains, portfolio kanban, Release Train Engineer.", level: "advanced", resources: [{ label: "Scaled Agile Framework", url: "https://scaledagileframework.com", type: "docs" }] },
      { id: "sm-less", title: "LeSS & Nexus", description: "Large-Scale Scrum, Nexus integration team, multi-team coordination.", level: "advanced", resources: [{ label: "LeSS Framework", url: "https://less.works", type: "docs" }] },
    ]},
    { id: "sm-certs", title: "Certifications", icon: "🏅", topics: [
      { id: "sm-csm", title: "CSM / PSM I", description: "Certified ScrumMaster (Scrum Alliance) or Professional Scrum Master (Scrum.org).", level: "core", resources: [{ label: "Scrum.org PSM I", url: "https://www.scrum.org/assessments/professional-scrum-master-i-certification", type: "course" }] },
      { id: "sm-safe-cert", title: "SAFe Agilist (SA)", description: "Leading SAFe certification — entry-level SAFe credential.", level: "optional", resources: [{ label: "Leading SAFe Certification", url: "https://scaledagile.com/training/leading-safe/", type: "course" }] },
    ]},
  ],
};

// ─── AI Engineer ─────────────────────────────────────────────────────────────

const aiEngineerRoadmap: CareerRoadmap = {
  id: "ai-engineer",
  title: "AI Engineer",
  icon: "🧠",
  color: "#6366F1",
  bg: "#EEF2FF",
  description: "Build AI-powered products using foundation models, APIs, and orchestration frameworks. The fastest-growing role in tech.",
  jobTitles: ["AI Engineer", "LLM Engineer", "Generative AI Engineer", "AI Application Developer"],
  avgSalary: "Rp 20–55 jt/bulan",
  timeToJob: "6–18 months",
  projects: [
    { title: "AI Chatbot with Memory", description: "Build a chatbot using OpenAI GPT-4o with conversation memory (LangChain ConversationBufferMemory), deployed as a Next.js app.", difficulty: "beginner", skills: ["OpenAI API", "LangChain", "Next.js", "TypeScript"] },
    { title: "RAG Document Q&A", description: "Upload PDFs, chunk and embed them into a vector DB (Qdrant). Ask questions and get answers grounded in the documents with source citations.", difficulty: "intermediate", skills: ["RAG", "Qdrant", "LangChain", "OpenAI Embeddings"] },
    { title: "Autonomous Research Agent", description: "Multi-step agent that takes a research question, searches the web, reads pages, synthesises findings, and writes a structured report.", difficulty: "advanced", skills: ["LangGraph", "Tool Use", "Web Search", "Structured Output"] },
  ],
  sections: [
    { id: "aie-foundations", title: "Foundations", icon: "📐", topics: [
      { id: "aie-python", title: "Python for AI", description: "Data types, async/await, REST calls, environment management, type hints.", level: "foundation", resources: [{ label: "Python Docs Tutorial", url: "https://docs.python.org/3/tutorial/", type: "docs" }] },
      { id: "aie-llm-concepts", title: "How LLMs Work", description: "Transformer architecture, tokenization, context windows, temperature, sampling.", level: "foundation", resources: [{ label: "Attention Is All You Need (paper)", url: "https://arxiv.org/abs/1706.03762", type: "article" }, { label: "Andrej Karpathy — Let's build GPT", url: "https://www.youtube.com/watch?v=kCc8FmEb1nY", type: "video" }] },
    ]},
    { id: "aie-apis", title: "Foundation Model APIs", icon: "🔌", topics: [
      { id: "aie-openai", title: "OpenAI API", description: "Chat completions, function calling, embeddings, streaming, vision, JSON mode.", level: "core", resources: [{ label: "OpenAI API Docs", url: "https://platform.openai.com/docs/", type: "docs" }] },
      { id: "aie-anthropic", title: "Anthropic Claude API", description: "Messages API, system prompts, tool use, long-context tasks.", level: "core", resources: [{ label: "Anthropic Docs", url: "https://docs.anthropic.com", type: "docs" }] },
      { id: "aie-opensource", title: "Open-Source Models", description: "Llama 3, Mistral, Gemma — run locally with Ollama or deploy on HuggingFace.", level: "core", resources: [{ label: "Ollama Docs", url: "https://ollama.com/library", type: "docs" }, { label: "HuggingFace Hub", url: "https://huggingface.co/models", type: "docs" }] },
    ]},
    { id: "aie-orchestration", title: "Orchestration & RAG", icon: "⚙️", topics: [
      { id: "aie-langchain", title: "LangChain / LlamaIndex", description: "Chains, agents, tools, memory, document loaders, retrievers.", level: "core", resources: [{ label: "LangChain Docs", url: "https://python.langchain.com/docs/", type: "docs" }, { label: "LlamaIndex Docs", url: "https://docs.llamaindex.ai", type: "docs" }] },
      { id: "aie-rag", title: "RAG (Retrieval-Augmented Generation)", description: "Chunking, embedding, vector search, re-ranking, hybrid search.", level: "core", resources: [{ label: "RAG Survey Paper", url: "https://arxiv.org/abs/2312.10997", type: "article" }] },
      { id: "aie-vector-db", title: "Vector Databases", description: "Pinecone, Qdrant, Chroma, Weaviate — similarity search, metadata filtering.", level: "core", resources: [{ label: "Qdrant Docs", url: "https://qdrant.tech/documentation/", type: "docs" }] },
    ]},
    { id: "aie-agents", title: "AI Agents", icon: "🤖", topics: [
      { id: "aie-agents-core", title: "Agentic Patterns", description: "ReAct, tool use, multi-step planning, reflection, self-correction loops.", level: "advanced", resources: [{ label: "LangGraph Docs", url: "https://langchain-ai.github.io/langgraph/", type: "docs" }] },
      { id: "aie-multi-agent", title: "Multi-Agent Systems", description: "CrewAI, AutoGen — agent orchestration, role assignment, communication protocols.", level: "advanced", resources: [{ label: "CrewAI Docs", url: "https://docs.crewai.com", type: "docs" }, { label: "AutoGen Docs", url: "https://microsoft.github.io/autogen/", type: "docs" }] },
    ]},
    { id: "aie-production", title: "Production & Evals", icon: "🚀", topics: [
      { id: "aie-evals", title: "LLM Evaluation", description: "RAGAS, DeepEval, LLM-as-judge, hallucination detection, benchmarking.", level: "advanced", resources: [{ label: "RAGAS Docs", url: "https://docs.ragas.io", type: "docs" }] },
      { id: "aie-guardrails", title: "Guardrails & Safety", description: "NeMo Guardrails, content moderation, PII detection, prompt injection defense.", level: "advanced", resources: [{ label: "NeMo Guardrails Docs", url: "https://github.com/NVIDIA/NeMo-Guardrails", type: "docs" }] },
      { id: "aie-cost", title: "Cost & Latency Optimization", description: "Caching (semantic cache), prompt compression, model routing, batching.", level: "advanced", resources: [{ label: "LiteLLM Docs", url: "https://docs.litellm.ai", type: "docs" }] },
    ]},
  ],
};

// ─── Prompt Engineer ─────────────────────────────────────────────────────────

const promptEngineerRoadmap: CareerRoadmap = {
  id: "prompt-engineer",
  title: "Prompt Engineer",
  icon: "💬",
  color: "#10B981",
  bg: "#ECFDF5",
  description: "Design and optimise prompts for LLMs to maximise reliability, accuracy, and safety across AI applications.",
  jobTitles: ["Prompt Engineer", "AI Content Strategist", "LLM Specialist", "Conversational AI Designer"],
  avgSalary: "Rp 12–35 jt/bulan",
  timeToJob: "3–9 months",
  projects: [
    { title: "Prompt Library", description: "Build a versioned library of 20+ prompts for common tasks (summarisation, classification, extraction). Document what works and why for each.", difficulty: "beginner", skills: ["Prompt Design", "Few-Shot", "OpenAI API", "Documentation"] },
    { title: "Automated Prompt Eval Suite", description: "Use PromptFoo to A/B test 3 prompt variants for a classification task. Define LLM-as-judge scoring, track results, pick the winner.", difficulty: "intermediate", skills: ["PromptFoo", "LLM Evaluation", "Python", "A/B Testing"] },
    { title: "Adversarial Red-Teaming Report", description: "Red-team a chatbot system prompt with 10+ jailbreak and injection attempts. Document each vector, success rate, and proposed mitigations.", difficulty: "advanced", skills: ["Red Teaming", "Prompt Injection", "Safety", "Reporting"] },
  ],
  sections: [
    { id: "pe-fundamentals", title: "LLM Fundamentals", icon: "📐", topics: [
      { id: "pe-how-llms", title: "How LLMs Work", description: "Tokens, context windows, temperature, top-p, frequency/presence penalties.", level: "foundation", resources: [{ label: "OpenAI Tokenizer", url: "https://platform.openai.com/tokenizer", type: "article" }, { label: "Intro to LLMs (Karpathy)", url: "https://www.youtube.com/watch?v=zjkBMFhNj_g", type: "video" }] },
      { id: "pe-models", title: "Model Landscape", description: "GPT-4o, Claude 3.5, Gemini, Llama 3 — strengths, pricing, context limits.", level: "foundation", resources: [{ label: "LMSYS Chatbot Arena", url: "https://chat.lmsys.org", type: "article" }] },
    ]},
    { id: "pe-techniques", title: "Core Techniques", icon: "🔧", topics: [
      { id: "pe-zero-few", title: "Zero-Shot & Few-Shot", description: "In-context learning, example selection, format demonstration.", level: "core", resources: [{ label: "Prompt Engineering Guide", url: "https://www.promptingguide.ai", type: "article" }] },
      { id: "pe-cot", title: "Chain-of-Thought (CoT)", description: "Step-by-step reasoning, zero-shot CoT, self-consistency, tree of thoughts.", level: "core", resources: [{ label: "Chain-of-Thought Paper", url: "https://arxiv.org/abs/2201.11903", type: "article" }] },
      { id: "pe-system", title: "System Prompt Design", description: "Persona, constraints, output format, tone, safety instructions.", level: "core", resources: [{ label: "Anthropic Prompt Library", url: "https://docs.anthropic.com/en/prompt-library/", type: "docs" }] },
      { id: "pe-rag-prompts", title: "RAG Prompt Patterns", description: "Grounding, citation instructions, context stuffing, fallback handling.", level: "core", resources: [{ label: "LlamaIndex Prompting Guide", url: "https://docs.llamaindex.ai/en/stable/understanding/querying/querying/", type: "docs" }] },
    ]},
    { id: "pe-advanced", title: "Advanced Prompting", icon: "🧩", topics: [
      { id: "pe-react", title: "ReAct & Tool Use", description: "Thought-Action-Observation loop, function calling, structured output.", level: "advanced", resources: [{ label: "ReAct Paper", url: "https://arxiv.org/abs/2210.03629", type: "article" }] },
      { id: "pe-adversarial", title: "Adversarial Prompting", description: "Prompt injection, jailbreaks, red-teaming, defense strategies.", level: "advanced", resources: [{ label: "Prompt Injection Guide", url: "https://www.promptingguide.ai/risks/adversarial", type: "article" }] },
    ]},
    { id: "pe-eval", title: "Evaluation & Iteration", icon: "📊", topics: [
      { id: "pe-testing", title: "Prompt Testing", description: "A/B prompt testing, regression suites, LLM-as-judge scoring.", level: "core", resources: [{ label: "PromptFoo Docs", url: "https://promptfoo.dev/docs/intro/", type: "docs" }] },
      { id: "pe-structured", title: "Structured Output", description: "JSON mode, Pydantic + instructor, constrained generation, grammar-based.", level: "advanced", resources: [{ label: "Instructor Docs", url: "https://python.useinstructor.com", type: "docs" }] },
    ]},
  ],
};

// ─── Computer Vision Engineer ─────────────────────────────────────────────────

const computerVisionRoadmap: CareerRoadmap = {
  id: "computer-vision",
  title: "Computer Vision Engineer",
  icon: "👁️",
  color: "#0EA5E9",
  bg: "#F0F9FF",
  description: "Build systems that understand and interpret images and video. From classic OpenCV to deep learning with CNNs and Vision Transformers.",
  jobTitles: ["Computer Vision Engineer", "CV Researcher", "Vision AI Engineer", "Perception Engineer"],
  avgSalary: "Rp 18–50 jt/bulan",
  timeToJob: "18–36 months",
  projects: [
    { title: "Face Mask Detector", description: "Train a binary classifier to detect face mask usage on a public dataset. OpenCV webcam integration, real-time inference, confusion matrix.", difficulty: "beginner", skills: ["Python", "OpenCV", "scikit-learn", "Transfer Learning"] },
    { title: "Object Detection App", description: "Fine-tune YOLOv8 on a custom dataset (collect 200+ images, label with Roboflow). FastAPI endpoint + simple webcam demo.", difficulty: "intermediate", skills: ["YOLOv8", "Roboflow", "FastAPI", "PyTorch"] },
    { title: "Semantic Segmentation Pipeline", description: "Segment objects in driving footage using Mask R-CNN or SAM. ONNX export, TensorRT optimisation, measure FPS on CPU vs GPU.", difficulty: "advanced", skills: ["Mask R-CNN", "SAM", "ONNX", "TensorRT"] },
  ],
  sections: [
    { id: "cv-foundations", title: "Foundations", icon: "📐", topics: [
      { id: "cv-math", title: "Linear Algebra & Calculus", description: "Matrix ops, eigendecomposition, gradient descent — essential for CNNs.", level: "foundation", resources: [{ label: "3Blue1Brown Linear Algebra", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab", type: "video" }] },
      { id: "cv-python-cv", title: "Python & OpenCV", description: "Image loading, colour spaces, morphological ops, contours, histograms.", level: "foundation", resources: [{ label: "OpenCV Python Tutorial", url: "https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html", type: "docs" }] },
    ]},
    { id: "cv-classical", title: "Classical CV", icon: "🔍", topics: [
      { id: "cv-image-processing", title: "Image Processing", description: "Filtering, edge detection (Canny), Hough transform, SIFT/ORB features.", level: "core", resources: [{ label: "OpenCV Tutorials", url: "https://docs.opencv.org/4.x/d9/df8/tutorial_root.html", type: "docs" }] },
      { id: "cv-camera", title: "Camera Geometry", description: "Pinhole model, intrinsics, extrinsics, distortion, homography.", level: "advanced", resources: [{ label: "Multiple View Geometry (book)", url: "https://www.robots.ox.ac.uk/~vgg/hzbook/", type: "book" }] },
    ]},
    { id: "cv-deep", title: "Deep Learning for CV", icon: "🧠", topics: [
      { id: "cv-cnns", title: "CNNs", description: "Convolutions, pooling, ResNet, EfficientNet, transfer learning.", level: "core", resources: [{ label: "Stanford CS231n", url: "https://cs231n.github.io", type: "course" }] },
      { id: "cv-detection", title: "Object Detection", description: "YOLO (v8/v11), Faster R-CNN, DETR, NMS, anchor boxes, mAP metric.", level: "core", resources: [{ label: "Ultralytics YOLOv8 Docs", url: "https://docs.ultralytics.com", type: "docs" }] },
      { id: "cv-segmentation", title: "Segmentation", description: "Semantic, instance, panoptic — Mask R-CNN, SAM (Segment Anything).", level: "advanced", resources: [{ label: "SAM2 Docs", url: "https://ai.meta.com/sam2/", type: "docs" }] },
      { id: "cv-vit", title: "Vision Transformers", description: "ViT, DINO, CLIP — self-supervised vision, vision-language models.", level: "advanced", resources: [{ label: "ViT Paper", url: "https://arxiv.org/abs/2010.11929", type: "article" }] },
    ]},
    { id: "cv-deploy", title: "Deployment & Edge", icon: "🚀", topics: [
      { id: "cv-onnx", title: "ONNX & TensorRT", description: "Model export, quantization, int8/fp16, TensorRT optimization for NVIDIA GPUs.", level: "advanced", resources: [{ label: "ONNX Runtime Docs", url: "https://onnxruntime.ai/docs/", type: "docs" }] },
      { id: "cv-edge", title: "Edge Deployment", description: "OpenVINO, TFLite, Coral TPU, Raspberry Pi, NVIDIA Jetson.", level: "advanced", resources: [{ label: "OpenVINO Docs", url: "https://docs.openvino.ai", type: "docs" }] },
    ]},
  ],
};

// ─── NLP Engineer ─────────────────────────────────────────────────────────────

const nlpEngineerRoadmap: CareerRoadmap = {
  id: "nlp-engineer",
  title: "NLP Engineer",
  icon: "📖",
  color: "#8B5CF6",
  bg: "#F5F3FF",
  description: "Build systems that understand and generate text. From classical NLP to transformers, fine-tuning LLMs, and production NLP pipelines.",
  jobTitles: ["NLP Engineer", "Computational Linguist", "Text Analytics Engineer", "Conversational AI Engineer"],
  avgSalary: "Rp 15–45 jt/bulan",
  timeToJob: "18–30 months",
  projects: [
    { title: "News Sentiment Dashboard", description: "Scrape headlines from RSS feeds, classify sentiment with a pre-trained HuggingFace model, visualise trends on a Streamlit dashboard.", difficulty: "beginner", skills: ["HuggingFace", "Python", "BeautifulSoup", "Streamlit"] },
    { title: "Named Entity Recognition API", description: "Fine-tune a BERT model on a custom NER dataset (e.g. Indonesian news). FastAPI endpoint, evaluate with seqeval F1 score.", difficulty: "intermediate", skills: ["HuggingFace", "BERT", "FastAPI", "seqeval"] },
    { title: "Fine-Tuned Summariser", description: "Fine-tune a seq2seq model (BART/mT5) on a domain-specific corpus. ROUGE evaluation, quantise with GGUF, serve with Ollama.", difficulty: "advanced", skills: ["BART", "PEFT", "ROUGE", "Ollama"] },
  ],
  sections: [
    { id: "nlp-foundations", title: "Foundations", icon: "📐", topics: [
      { id: "nlp-linguistics", title: "Linguistics Basics", description: "Tokenization, morphology, POS tagging, parsing, named entities.", level: "foundation", resources: [{ label: "NLTK Book (free)", url: "https://www.nltk.org/book/", type: "book" }] },
      { id: "nlp-python", title: "Python NLP Libraries", description: "spaCy, NLTK, Gensim — text preprocessing pipelines.", level: "foundation", resources: [{ label: "spaCy Course", url: "https://course.spacy.io", type: "course" }] },
    ]},
    { id: "nlp-classical", title: "Classical NLP", icon: "📝", topics: [
      { id: "nlp-features", title: "Text Features", description: "Bag of Words, TF-IDF, n-grams, word2vec, GloVe, FastText.", level: "core", resources: [{ label: "Stanford NLP Group", url: "https://nlp.stanford.edu", type: "article" }] },
      { id: "nlp-tasks", title: "Core NLP Tasks", description: "Text classification, NER, sentiment, relation extraction, summarization.", level: "core", resources: [{ label: "Papers With Code NLP", url: "https://paperswithcode.com/area/natural-language-processing", type: "article" }] },
    ]},
    { id: "nlp-transformers", title: "Transformers", icon: "🤖", topics: [
      { id: "nlp-attention", title: "Attention & Transformers", description: "Self-attention, multi-head attention, BERT, GPT architectures.", level: "core", resources: [{ label: "The Illustrated Transformer", url: "https://jalammar.github.io/illustrated-transformer/", type: "article" }] },
      { id: "nlp-huggingface", title: "HuggingFace Ecosystem", description: "Transformers, Datasets, Tokenizers, PEFT, Accelerate, Hub.", level: "core", resources: [{ label: "HuggingFace NLP Course", url: "https://huggingface.co/learn/nlp-course", type: "course" }] },
      { id: "nlp-finetuning", title: "Fine-Tuning LLMs", description: "Full fine-tune, LoRA, QLoRA, RLHF, DPO — when and how.", level: "advanced", resources: [{ label: "HuggingFace PEFT Docs", url: "https://huggingface.co/docs/peft", type: "docs" }] },
    ]},
    { id: "nlp-production", title: "Production NLP", icon: "🚀", topics: [
      { id: "nlp-serving", title: "Model Serving", description: "vLLM, TGI, OpenAI-compatible APIs, batching, streaming.", level: "advanced", resources: [{ label: "vLLM Docs", url: "https://docs.vllm.ai", type: "docs" }] },
      { id: "nlp-eval", title: "NLP Evaluation", description: "BLEU, ROUGE, BERTScore, human eval, task-specific metrics.", level: "advanced", resources: [{ label: "SacreBLEU", url: "https://github.com/mjpost/sacrebleu", type: "docs" }] },
    ]},
  ],
};

// ─── AI Product Manager ───────────────────────────────────────────────────────

const aiPMRoadmap: CareerRoadmap = {
  id: "ai-product-manager",
  title: "AI Product Manager",
  icon: "🎯",
  color: "#F97316",
  bg: "#FFF7ED",
  description: "Lead the development of AI-powered products. Understand model capabilities, set the right metrics, and ship responsibly.",
  jobTitles: ["AI Product Manager", "ML Product Manager", "Head of AI Product", "Technical PM — AI"],
  avgSalary: "Rp 20–60 jt/bulan",
  timeToJob: "6–18 months",
  projects: [
    { title: "AI Feature PRD", description: "Write a full PRD for an AI-powered feature (e.g. smart reply, content moderation). Include model choice rationale, eval metrics, failure modes, and rollback plan.", difficulty: "beginner", skills: ["PRD Writing", "AI Literacy", "Metrics", "Risk Analysis"] },
    { title: "LLM Eval Framework Design", description: "Design a qualitative + quantitative eval framework for a chatbot product. Define rubrics, build a 50-example test set, run with PromptFoo, present results.", difficulty: "intermediate", skills: ["LLM Evaluation", "PromptFoo", "Product Metrics", "Data Analysis"] },
    { title: "Responsible AI Audit", description: "Audit an existing AI product for bias, fairness, and safety. Produce a written report with findings, severity ratings, and a prioritised mitigation roadmap.", difficulty: "advanced", skills: ["AI Ethics", "Fairness Metrics", "Risk Assessment", "Stakeholder Communication"] },
  ],
  sections: [
    { id: "aipm-ai-literacy", title: "AI Literacy", icon: "🧠", topics: [
      { id: "aipm-ml-basics", title: "ML Concepts for PMs", description: "Supervised vs unsupervised, classification, regression, clustering — no math needed.", level: "foundation", resources: [{ label: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course", type: "course" }] },
      { id: "aipm-llm-basics", title: "LLMs for Product Leaders", description: "Tokens, context, hallucination, latency, cost — building intuition for AI products.", level: "foundation", resources: [{ label: "Ethan Mollick — One Useful Thing", url: "https://www.oneusefulthing.org", type: "article" }] },
      { id: "aipm-capabilities", title: "Current AI Capabilities", description: "What AI is and isn't good at, capability vs reliability, failure modes.", level: "foundation", resources: [{ label: "State of AI Report", url: "https://www.stateof.ai", type: "article" }] },
    ]},
    { id: "aipm-discovery", title: "AI Product Discovery", icon: "🔍", topics: [
      { id: "aipm-problem-fit", title: "Problem–AI Fit", description: "When AI adds value vs when it's overkill — heuristics for choosing AI.", level: "core", resources: [{ label: "AI Product Canvas", url: "https://www.ai-canvas.org", type: "article" }] },
      { id: "aipm-data-strategy", title: "Data Strategy", description: "Training data, labelling workflows, data flywheel, privacy constraints.", level: "core", resources: [{ label: "Andrew Ng — Data-Centric AI", url: "https://datacentricai.org", type: "article" }] },
    ]},
    { id: "aipm-execution", title: "Building AI Products", icon: "⚡", topics: [
      { id: "aipm-metrics", title: "AI-Specific Metrics", description: "Accuracy, precision/recall, latency, cost-per-call, human fallback rate.", level: "core", resources: [{ label: "Chip Huyen — Designing ML Systems", url: "https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/", type: "book" }] },
      { id: "aipm-iteration", title: "Rapid Experimentation", description: "Prompt versioning, A/B evals, shadow mode, gradual rollout for AI features.", level: "core", resources: [{ label: "PromptFoo Docs", url: "https://promptfoo.dev/docs/intro/", type: "docs" }] },
      { id: "aipm-human-loop", title: "Human-in-the-Loop Design", description: "When to surface AI suggestions, confidence thresholds, review queues, override UX.", level: "advanced", resources: [{ label: "Google PAIR Guidebook", url: "https://pair.withgoogle.com/guidebook/", type: "article" }] },
    ]},
    { id: "aipm-ethics", title: "AI Ethics & Responsible AI", icon: "⚖️", topics: [
      { id: "aipm-bias", title: "Bias & Fairness", description: "Types of bias, disparate impact, fairness metrics, audit frameworks.", level: "core", resources: [{ label: "Fairlearn Docs", url: "https://fairlearn.org", type: "docs" }] },
      { id: "aipm-safety", title: "AI Safety & Alignment", description: "Misuse vectors, content policy, red-teaming, EU AI Act basics.", level: "core", resources: [{ label: "EU AI Act Summary", url: "https://artificialintelligenceact.eu/the-act/", type: "article" }] },
    ]},
  ],
};

// ─── Master export ────────────────────────────────────────────────────────────

export const CAREER_ROADMAPS: CareerRoadmap[] = [
  // Original 10
  frontendRoadmap,
  backendRoadmap,
  fullStackRoadmap,
  devopsRoadmap,
  mobileRoadmap,
  dataScienceRoadmap,
  cyberSecRoadmap,
  uiuxRoadmap,
  androidRoadmap,
  productManagerRoadmap,
  // New 12
  cloudArchitectRoadmap,
  iosRoadmap,
  mlEngineerRoadmap,
  blockchainRoadmap,
  gameDevRoadmap,
  dataEngineerRoadmap,
  qaEngineerRoadmap,
  sreRoadmap,
  dbaRoadmap,
  embeddedRoadmap,
  technicalWriterRoadmap,
  scrumMasterRoadmap,
  // AI & ML
  aiEngineerRoadmap,
  promptEngineerRoadmap,
  computerVisionRoadmap,
  nlpEngineerRoadmap,
  aiPMRoadmap,
];

export function getRoadmapById(id: string): CareerRoadmap | undefined {
  return CAREER_ROADMAPS.find((r) => r.id === id);
}

export function allTopicIds(roadmap: CareerRoadmap): string[] {
  return roadmap.sections.flatMap((s) => s.topics.map((t) => t.id));
}
