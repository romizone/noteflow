<p align="center">
  <img src="https://img.icons8.com/fluency/96/note.png" alt="NoteFlow Logo" width="80" />
</p>

<h1 align="center">NoteFlow</h1>

<p align="center">
  <strong>Your Notes, Tasks & Ideas — All in One Place</strong>
</p>

<p align="center">
  A modern, full-featured note-taking web application inspired by Evernote.<br/>
  Built with Next.js 16 · Neon PostgreSQL · Google OAuth · Vercel
</p>

<p align="center">
  <a href="https://github.com/romizone/noteflow/releases/tag/v1.0.0"><img src="https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge" alt="Version" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
  <a href="https://neon.tech"><img src="https://img.shields.io/badge/Neon-PostgreSQL-00e5a0?style=for-the-badge&logo=postgresql&logoColor=white" alt="Neon" /></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel" alt="Vercel" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" /></a>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 📸 Overview

NoteFlow brings the power of professional note-taking to the web. Organize your thoughts with rich-text notes, manage tasks with due dates, categorize with notebooks and tags, and search instantly — all behind secure Google authentication.

---

## ✨ Features

### 📝 Rich Text Editor
| Feature | Description |
|---------|-------------|
| 🔤 **Text Formatting** | Bold, Italic, Underline, Strikethrough, Highlight |
| 📏 **Headings** | H1, H2, H3 support |
| 📋 **Lists** | Bullet, Numbered, and Task/Checkbox lists |
| 💻 **Code Blocks** | Syntax-highlighted code snippets |
| 💬 **Blockquotes** | Styled quote blocks |
| 🔗 **Links** | Insert and edit hyperlinks |
| 📐 **Alignment** | Left, Center, Right text alignment |
| ↩️ **Undo/Redo** | Full history support |

### 📒 Notes Management
| Feature | Description |
|---------|-------------|
| 📌 **Pin Notes** | Keep important notes at the top |
| ⭐ **Favorites** | Mark notes as favorites for quick access |
| 🗂️ **Notebooks** | Organize notes into color-coded notebooks |
| 🏷️ **Tags** | Flexible tagging system with multi-tag support |
| 🔍 **Search** | Full-text search across titles and content |
| 🗑️ **Trash** | Soft delete with restore and permanent delete |

### ✅ Tasks
| Feature | Description |
|---------|-------------|
| ➕ **Create Tasks** | Standalone task management |
| 📅 **Due Dates** | Set deadlines for your tasks |
| ✔️ **Completion** | Toggle complete/incomplete status |

### 📋 Scratch Pad
| Feature | Description |
|---------|-------------|
| ✏️ **Quick Notes** | Instant note area on the home dashboard |
| 💾 **Auto-Save** | Saves automatically as you type |

### 🔐 Authentication & Security
| Feature | Description |
|---------|-------------|
| 🔑 **Google OAuth** | Secure sign-in with Google account |
| 🛡️ **Session Management** | Server-side sessions via NextAuth.js |
| 🔒 **Data Isolation** | Each user can only access their own data |

### 📱 Responsive Design
| Feature | Description |
|---------|-------------|
| 🖥️ **Desktop** | Full sidebar with all navigation |
| 📱 **Mobile** | Collapsible hamburger menu sidebar |

---

## 🛠️ Tech Stack

<table>
  <tr>
    <td align="center" width="120">
      <img src="https://img.shields.io/badge/-Next.js-000?style=flat&logo=next.js" /><br/>
      <sub><b>Framework</b></sub>
    </td>
    <td align="center" width="120">
      <img src="https://img.shields.io/badge/-TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" /><br/>
      <sub><b>Language</b></sub>
    </td>
    <td align="center" width="120">
      <img src="https://img.shields.io/badge/-Tailwind-06B6D4?style=flat&logo=tailwindcss&logoColor=white" /><br/>
      <sub><b>Styling</b></sub>
    </td>
    <td align="center" width="120">
      <img src="https://img.shields.io/badge/-PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white" /><br/>
      <sub><b>Database</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="120">
      <img src="https://img.shields.io/badge/-Neon-00e5a0?style=flat&logo=postgresql&logoColor=white" /><br/>
      <sub><b>DB Provider</b></sub>
    </td>
    <td align="center" width="120">
      <img src="https://img.shields.io/badge/-Drizzle-C5F74F?style=flat&logo=drizzle&logoColor=black" /><br/>
      <sub><b>ORM</b></sub>
    </td>
    <td align="center" width="120">
      <img src="https://img.shields.io/badge/-NextAuth-000?style=flat&logo=next.js" /><br/>
      <sub><b>Auth</b></sub>
    </td>
    <td align="center" width="120">
      <img src="https://img.shields.io/badge/-Vercel-000?style=flat&logo=vercel" /><br/>
      <sub><b>Deployment</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="120">
      <img src="https://img.shields.io/badge/-TipTap-1a1a2e?style=flat" /><br/>
      <sub><b>Editor</b></sub>
    </td>
    <td align="center" width="120">
      <img src="https://img.shields.io/badge/-Lucide-f56565?style=flat" /><br/>
      <sub><b>Icons</b></sub>
    </td>
    <td align="center" width="120">
      <img src="https://img.shields.io/badge/-date--fns-770C56?style=flat" /><br/>
      <sub><b>Dates</b></sub>
    </td>
    <td align="center" width="120">
      <img src="https://img.shields.io/badge/-ESLint-4B32C3?style=flat&logo=eslint&logoColor=white" /><br/>
      <sub><b>Linting</b></sub>
    </td>
  </tr>
</table>

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Purpose |
|-------------|---------|
| 📦 **Node.js 18+** | Runtime environment |
| 🗄️ **[Neon](https://neon.tech) account** | PostgreSQL database |
| 🔑 **[Google Cloud](https://console.cloud.google.com) project** | OAuth authentication |
| ▲ **[Vercel](https://vercel.com) account** | Deployment (optional) |

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/romizone/noteflow.git
cd noteflow
npm install
```

### 2️⃣ Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# 🗄️ Neon Database
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# 🔑 Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# 🔐 NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
```

### 3️⃣ Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create or select a project
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Select **Web application**
6. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` *(development)*
   - `https://your-app.vercel.app/api/auth/callback/google` *(production)*
7. Copy the **Client ID** and **Client Secret** to `.env.local`

### 4️⃣ Push Database Schema

```bash
npm run db:push
```

### 5️⃣ Start Development Server

```bash
npm run dev
```

🌐 Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment

### Deploy to Vercel

1. Push your repository to GitHub
2. Visit [vercel.com/new](https://vercel.com/new) and import your repo
3. Configure the following **Environment Variables**:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Neon connection string |
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxx` | Google OAuth Client Secret |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production URL |
| `NEXTAUTH_SECRET` | *(generated)* | Run `openssl rand -base64 32` |

4. Click **Deploy** 🚀

---

## 🗃️ Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:push` | 📤 Push schema changes to Neon |
| `npm run db:generate` | 📄 Generate migration files |
| `npm run db:migrate` | ▶️ Run pending migrations |
| `npm run db:studio` | 🖥️ Open Drizzle Studio (database GUI) |

---

## 📁 Project Structure

```
noteflow/
├── 📂 src/
│   ├── 📂 app/
│   │   ├── 📂 api/
│   │   │   ├── 📂 auth/[...nextauth]/   # 🔑 NextAuth API
│   │   │   ├── 📂 notes/                # 📝 Notes CRUD
│   │   │   ├── 📂 notebooks/            # 📒 Notebooks CRUD
│   │   │   ├── 📂 tags/                 # 🏷️ Tags CRUD
│   │   │   ├── 📂 tasks/                # ✅ Tasks CRUD
│   │   │   ├── 📂 scratch-pad/          # 📋 Scratch Pad
│   │   │   └── 📂 search/               # 🔍 Search API
│   │   ├── 📂 login/                    # 🔐 Login page
│   │   ├── 📂 notes/[id]/               # ✏️ Note editor
│   │   ├── 📂 notebooks/                # 📒 Notebooks pages
│   │   ├── 📂 tags/                     # 🏷️ Tags pages
│   │   ├── 📂 tasks/                    # ✅ Tasks page
│   │   ├── 📂 trash/                    # 🗑️ Trash page
│   │   ├── 📄 layout.tsx                # 🖼️ Root layout
│   │   └── 📄 page.tsx                  # 🏠 Home page
│   ├── 📂 components/
│   │   ├── 📄 AuthGuard.tsx             # 🛡️ Auth wrapper
│   │   ├── 📄 CreateNotebookModal.tsx   # 📒 Notebook modal
│   │   ├── 📄 NoteCard.tsx              # 🃏 Note card
│   │   ├── 📄 NoteEditor.tsx            # ✏️ TipTap editor
│   │   ├── 📄 ScratchPad.tsx            # 📋 Scratch pad
│   │   ├── 📄 SessionProvider.tsx       # 🔑 Session provider
│   │   ├── 📄 Sidebar.tsx               # 📱 Navigation sidebar
│   │   └── 📄 TagManager.tsx            # 🏷️ Tag selector
│   └── 📂 lib/
│       ├── 📄 auth.ts                   # 🔐 NextAuth config
│       ├── 📄 auth-helpers.ts           # 🔧 Auth utilities
│       ├── 📄 db.ts                     # 🗄️ Database connection
│       ├── 📄 schema.ts                 # 📊 Drizzle schema
│       └── 📄 types.ts                  # 📝 TypeScript types
├── 📄 drizzle.config.ts                 # ⚙️ Drizzle config
├── 📄 next.config.ts                    # ⚙️ Next.js config
├── 📄 package.json                      # 📦 Dependencies
├── 📄 .env.example                      # 🔒 Env template
└── 📄 README.md                         # 📖 Documentation
```

---

## 🗄️ Database Schema

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    users      │     │   notebooks  │     │    tags       │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │◄────│ userId (FK)  │     │ id (PK)      │
│ name         │     │ id (PK)      │     │ userId (FK)  │
│ email        │     │ name         │     │ name         │
│ image        │     │ color        │     │ createdAt    │
│ createdAt    │     │ isDefault    │     └──────┬───────┘
└──────┬───────┘     └──────┬───────┘            │
       │                    │              ┌─────┴───────┐
       │              ┌─────┴───────┐      │  note_tags  │
       │              │    notes    │      ├─────────────┤
       │              ├─────────────┤      │ noteId (FK) │
       ├──────────────│ userId (FK) │──────│ tagId (FK)  │
       │              │ notebookId  │      └─────────────┘
       │              │ title       │
       │              │ content     │
       │              │ isPinned    │
       │              │ isFavorite  │
       │              │ isTrashed   │
       │              └─────────────┘
       │
       │  ┌──────────────┐     ┌──────────────┐
       ├──│    tasks      │     │ scratch_pad  │
       │  ├──────────────┤     ├──────────────┤
       └──│ userId (FK)  │     │ userId (FK)  │
          │ title        │     │ content      │
          │ isCompleted  │     │ updatedAt    │
          │ dueDate      │     └──────────────┘
          └──────────────┘
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. 🍴 Fork the repository
2. 🔀 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 📩 Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Romi Nur Ismanto** — [@romizone](https://github.com/romizone)

---

<p align="center">
  Made with ❤️ and ☕ — Powered by Next.js & Neon
</p>
