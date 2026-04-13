# 🧠 Community Intelligence Layer

A production-grade WhatsApp AI assistant for professionals, freelancers, and small teams. Built with Meta Cloud API + Claude + Supabase.

## Architecture

```
User (WhatsApp)
    ↕ Meta Cloud API
Your Server (Express.js)
    ├── Security: webhook signature verification, rate limiting, input sanitization
    ├── Bot Logic: onboarding flow → personalized first response → AI conversations
    ├── AI: Claude Sonnet via Anthropic API, grounded in your knowledge base
    └── Storage: Supabase (PostgreSQL) for users, interactions, analytics
```

## Security Features
- **Webhook signature verification** (HMAC SHA-256) — rejects spoofed requests
- **Rate limiting** — 100 req/min per IP
- **Helmet.js** — HTTP security headers
- **Input sanitization** — strips control characters, caps message length
- **Row Level Security** — Supabase tables locked to service role only
- **Analytics auth** — token-protected dashboard endpoint

---

## Setup Guide (30 minutes)

### Step 1: Create a Meta App for WhatsApp (10 min)

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Other** → **Business** → fill in app name → Create
4. On the app dashboard, scroll down and click **Set up** on the **WhatsApp** product
5. You'll see the **API Setup** page with:
   - A temporary access token
   - A test phone number (Meta provides one for testing)
   - Your **Phone Number ID**

6. **Get a permanent access token:**
   - Go to **Business Settings** → **System Users** → Create a system user
   - Give it `admin` role
   - Click **Generate Token** → select your WhatsApp app → check `whatsapp_business_messaging` and `whatsapp_business_management`
   - Copy the token — this is your `WHATSAPP_ACCESS_TOKEN`

7. **Get your App Secret:**
   - Go to your app **Settings** → **Basic**
   - Copy the **App Secret** — this is your `WHATSAPP_APP_SECRET`

8. **Your Phone Number ID** is shown on the WhatsApp API Setup page.

### Step 2: Create a Supabase Project (5 min)

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it `community-intel-bot`, choose a region close to you, set a DB password
3. Once created, go to **Settings** → **API**:
   - Copy the **Project URL** → this is your `SUPABASE_URL`
   - Copy the **service_role key** (not the anon key!) → this is your `SUPABASE_SERVICE_KEY`

4. Go to **SQL Editor** → **New Query** and run this:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  whatsapp_name TEXT,
  name TEXT,
  org TEXT,
  role TEXT,
  pain_point TEXT,
  pain_point_detail TEXT,
  onboarding_step INTEGER,
  onboarded BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Interactions table
CREATE TABLE IF NOT EXISTS interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL REFERENCES users(phone) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interactions_phone ON interactions(phone);
CREATE INDEX IF NOT EXISTS idx_interactions_created ON interactions(created_at DESC);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on users"
  ON users FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on interactions"
  ON interactions FOR ALL USING (auth.role() = 'service_role');
```

### Step 3: Set Up the Project (5 min)

```bash
git clone https://github.com/YOUR_USERNAME/community-intel-bot.git
cd community-intel-bot
cp .env.example .env
```

Edit `.env` with your values:
```
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxx...
WHATSAPP_VERIFY_TOKEN=any_secret_string_you_make_up
WHATSAPP_APP_SECRET=abcdef123456
ANTHROPIC_API_KEY=sk-ant-xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
```

`WHATSAPP_VERIFY_TOKEN` — make up any random string. You'll use it when configuring the webhook in Meta.

```bash
npm install
npm run dev
```

### Step 4: Expose Your Server (for local testing)

```bash
npx ngrok http 3000
```

Copy the HTTPS URL (e.g. `https://abc123.ngrok-free.app`).

### Step 5: Configure the Meta Webhook (5 min)

1. In your Meta App Dashboard → WhatsApp → **Configuration**
2. Under **Webhook**:
   - Callback URL: `https://your-ngrok-url.ngrok-free.app/webhook`
   - Verify token: the same string you put in `WHATSAPP_VERIFY_TOKEN`
   - Click **Verify and Save**
3. Under **Webhook fields**, subscribe to: `messages`

### Step 6: Test It

Send "Hi" from your WhatsApp to the test number. You should see the onboarding flow start.

### Step 7: Deploy to Railway (5 min)

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

Set all environment variables in Railway Dashboard → Variables.

Update the Meta webhook URL to your Railway URL:
`https://your-app.up.railway.app/webhook`

### Step 8: Use Your Own Phone Number (Optional)

The Meta test number works for development. To use your own business number:

1. Go to WhatsApp → **API Setup** → **Add phone number**
2. Enter your business phone number
3. Verify via SMS or voice call
4. Update `WHATSAPP_PHONE_NUMBER_ID` in your environment variables

---

## Using the Bot

### Analytics
```
GET /analytics?token=YOUR_VERIFY_TOKEN
```

Returns: total users, pain point distribution, role distribution, recent questions.

### Adding Knowledge
Drop `.md` files into the `knowledge/` folder. The bot loads them automatically on startup.

### Customization
- **Onboarding questions**: edit `ONBOARDING` in `src/bot.js`
- **First responses**: edit `FIRST_RESPONSES` in `src/bot.js`
- **AI personality**: edit `buildSystemPrompt()` in `src/bot.js`
- **Knowledge base**: add/edit files in `knowledge/`

---

## Cost Summary

| Users | Monthly Messages | Claude API | WhatsApp (service) | Total |
|-------|-----------------|------------|-------------------|-------|
| 50    | 250             | ~$2        | $0 (free window)  | ~$2   |
| 200   | 1,600           | ~$10       | $0 (free window)  | ~$10  |
| 500   | 7,500           | ~$45       | $0 (free window)  | ~$45  |

Service messages (user-initiated conversations within 24h) are free on WhatsApp. You only pay for Claude API usage and proactive template messages.

---

## Project Structure

```
community-intel-bot/
├── src/
│   ├── index.js        # Express server, routes, middleware
│   ├── config.js       # Environment validation
│   ├── bot.js          # Onboarding flow, AI responses
│   ├── whatsapp.js     # Meta Cloud API: send, receive, parse
│   ├── security.js     # Signature verification, sanitization
│   ├── db.js           # Supabase: users, interactions, analytics
│   ├── knowledge.js    # Knowledge base loader
│   ├── logger.js       # Structured logging (pino)
│   └── db/
│       └── init.js     # Database schema (print to console)
├── knowledge/
│   └── community-ops.md  # Domain knowledge base
├── .env.example
├── package.json
└── README.md
```

## License

MIT — use it, fork it, improve it.
