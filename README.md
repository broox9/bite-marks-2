# Bite Marks

A restaurant bookmarking web application built with Svelte, SvelteKit, and Appwrite.

## Features

- 🔐 Authentication (Email/Password + Google OAuth)
- 📍 Restaurant discovery and bookmarking
- 🗺️ Google Maps integration
- 🏷️ Tag system for organizing restaurants
- 📱 Responsive design

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Appwrite account ([cloud.appwrite.io](https://cloud.appwrite.io))
- Google Cloud Console account (for Google OAuth and Maps)

### Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd bite-marks-2
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Appwrite credentials
   ```

3. **Configure Google OAuth** (if using)
   - Follow the complete setup guide: `scripts/google-oauth-setup-checklist.md`
   - Or see quick reference: `GOOGLE_OAUTH_FIX_SUMMARY.md`

4. **Start development server**
   ```bash
   npm run dev
   ```

## Documentation

### Authentication
- **`AUTH-README.md`** - Complete authentication system overview
- **`docs/oauth-social-sign-in.md`** - OAuth implementation details
- **`scripts/google-oauth-setup-checklist.md`** - Google OAuth configuration guide
- **`scripts/test-google-oauth.md`** - Testing and troubleshooting

### Project Structure
- **`AGENTS.md`** - Project overview and architecture

## Architecture

This project follows a hexagonal (ports-and-adapters) architecture:

```
src/
├── lib/
│   ├── core/domain/      # Domain types and schemas
│   ├── use_cases/        # Application use cases
│   ├── ports/            # Port interfaces
│   ├── adapters/
│   │   ├── primary/      # Inbound adapters (UI, handlers)
│   │   └── secondary/    # Outbound adapters (Appwrite, Google)
│   └── glue/             # Dependency injection
└── routes/               # SvelteKit routes and pages
```

## Key Technologies

- **Frontend**: Svelte, SvelteKit
- **Backend**: Appwrite
- **Build Tool**: Vite
- **Styling**: CSS custom properties (no Tailwind)
- **Language**: TypeScript

## Development

### Running the app

```bash
npm run dev
```

Or open in browser:

```bash
npm run dev -- --open
```

### Type checking

```bash
npm run check
```

## Building

To create a production version:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Configuration

### Environment Variables

Required variables:

```bash
# Public (client-side)
PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1

# Private (server-side)
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
```

Optional:

```bash
# For production behind reverse proxy
PUBLIC_APP_URL=https://yourdomain.com
```

See `.env.example` for complete configuration template.

## Google OAuth Setup

Google Sign-In requires configuration in both Google Cloud Console and Appwrite Console.

**Quick setup**: Follow `scripts/google-oauth-setup-checklist.md`

**Troubleshooting**: See `scripts/test-google-oauth.md`

## Contributing

This is a personal side project for practicing agentic coding and AI-assisted development.

## License

Private project - no license specified.

---

> **Note**: This project uses Prettier for formatting and ESLint for linting. No testing framework is currently configured.
