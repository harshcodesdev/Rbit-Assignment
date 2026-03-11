# Rabbit-Sync: Sales Insight Automator

## The Engineer's Log

Welcome to **Rabbit-Sync**, an internal tool created for the RabbitAI sales team to instantly distill massive `.csv` and `.xlsx` figures into an actionable AI-generated executive briefing.

This repository serves as a functional, containerized prototype built under a 3-hour constraint as part of the AI Cloud DevOps Engineer evaluation.

### Features
1. **Dynamic Landing Page:** Enter a recipient email to initiate the workflow.
2. **Beautiful Upload Experience:** Drag-and-drop files representing quarterly sales data.
3. **Robust Processing Engine:** 
   - Uses robust data parsers for accurate CSV/Excel extraction.
   - Leverages **Google Gemini API** to generate a narrative.
   - Operates resiliently utilizing a **Prisma + PostgreSQL** backend.
4. **Instant Delivery:** Delivers beautifully formatted summaries directly using **Resend**.
5. **Real-time Insights Dashboard:** Monitor every job's status and outcome seamlessly.

---

### Run Locally via Docker

We use a unified Next.js Application approach that is multi-staged and easy to containerize.

1. **Clone the repository.**
2. **Setup your environment properties:** Create a `.env` file referencing the `.env.example`.
3. **Spin up the stack:**
   Ensure Docker is running and run:
   ```bash
   docker-compose up -d --build
   ```
4. **Migrate the Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. **View the Application:**
   Navigate to `http://localhost:3000`

---

### API Documentation (Swagger)
A live documentation endpoint is available via the unified backend. Navigate to:
- **`http://localhost:3000/docs`** to test endpoints securely and view schema definitions.

---

### Endpoint Security Approach
To meet the requirement for "Secured Endpoints," the application uses:
- **Prisma Schema Constraints:** Avoided SQL injections seamlessly.
- **Strict Typing:** Request bodies are type-checked using strict checks.
- **Resource Abuse Protection:** All actions are tied to a standard predictable Job architecture (`uuid`-based tracking).
- *(Note: In a true production environment with more time, standard Rate Limiting middlewares via Upstash Redis and robust Authentication flows (e.g. NextAuth) should be instituted).*

---

### CI/CD Automation
The repo contains `.github/workflows/ci.yml` that checks code formatting, builds the Next.js static portions, and lints Prisma schemas automatically on push to the `main` branch.
