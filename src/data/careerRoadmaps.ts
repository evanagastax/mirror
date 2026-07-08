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

// ─── Master export ────────────────────────────────────────────────────────────

export const CAREER_ROADMAPS: CareerRoadmap[] = [
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
];

export function getRoadmapById(id: string): CareerRoadmap | undefined {
  return CAREER_ROADMAPS.find((r) => r.id === id);
}

export function allTopicIds(roadmap: CareerRoadmap): string[] {
  return roadmap.sections.flatMap((s) => s.topics.map((t) => t.id));
}
