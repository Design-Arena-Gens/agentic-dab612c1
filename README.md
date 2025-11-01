# Agentic Workspace

AI-powered executive assistant that orchestrates tasks across Notion, Google Calendar, and Gmail. Built with Next.js 14 and ready to deploy to Vercel.

## Features
- Dashboard with live (or sample) snapshots of Notion tasks, upcoming Calendar events, and Gmail inbox highlights.
- Command center UI that lets you delegate requests to an OpenAI-driven agent.
- Serverless API routes that execute real actions: create/update Notion tasks, schedule Google Calendar events, and send Gmail replies.
- Graceful fallbacks with realistic sample data when credentials are not configured.

## Getting Started
```bash
npm install
npm run dev
```
The app runs at `http://localhost:3000`.

## Environment Variables
Create a `.env.local` file with the following keys:
```
OPENAI_API_KEY=
NOTION_API_KEY=
NOTION_DATABASE_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=
GMAIL_USER_ID=you@example.com
```

- Notion: database must include `Name` (title), `Status` (status), and `Due` (date) properties.
- Google: set up a service account with Calendar & Gmail scopes, then delegate domain-wide authority to the desired user.

## Scripts
- `npm run dev` – start development server
- `npm run lint` – lint with ESLint
- `npm run build` – production build
- `npm run start` – run production server

## Deployment
The project targets Vercel. After a successful `npm run build`, deploy with:
```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-dab612c1
```

## License
MIT
