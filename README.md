# 🤖 Perplexity 2.0 – AI-Powered Search & Chat Assistant

 ### An end-to-end AI-powered search engine assistant 🔎✨ inspired by Perplexity AI, built with:

 #### 🎨 Frontend: React + TypeScript + TailwindCSS

##### ⚙️ Backend: FastAPI (Python) with SSE (Server-Sent Events)

##### 🧠 LLM & Search APIs: Google Generative AI + Tavily Search

##### 📊 Extras: Syntax highlighting, chart rendering, tables, and more

##### 🌍 Live Demo: https://client-733g.vercel.app/

## 📌 Features

##### ✅ Conversational Q&A with AI
##### ✅ Integrated Web Search (via Tavily API)
##### ✅ Syntax-Highlighted Code Blocks 💻
##### ✅ Inline Tables & Charts 📊
##### ✅ Live Streaming Responses (SSE) ⚡
##### ✅ User-friendly UI with message history

## 🏗️ Architecture Flow
### 1. Mermaid Diagram
```
flowchart TD

    User["🧑 User (Browser)"] -->|Types a question| Frontend["🎨 Frontend (React + TS)"]

    Frontend -->|Send request via SSE| Backend["⚙️ Backend (FastAPI + Python)"]

    Backend -->|Query| Search["🌐 Tavily Search API"]

    Backend -->|Send query| LLM["🧠 Google Generative AI"]

    Search --> Backend

    LLM --> Backend

    Backend -->|Stream response (sections: text/code/chart/table)| Frontend

    Frontend -->|Renders beautifully ✨| User
```

### 2. ASCII + Emoji Diagram (GitHub-safe 🪄)
```
🧑 User
   │  (asks question)
   ▼
🎨 Frontend (React + TS)
   │  (SSE request)
   ▼
⚙️ Backend (FastAPI + Python)
   ├──> 🌐 Tavily Search API
   └──> 🧠 Google Generative AI
          │
          ▼
   (merge results & stream back)
   │
   ▼
🎨 Frontend UI
   │
   ▼
🧑 User sees ✨ text, 💻 code, 📊 charts, 📋 tables

```

## 📂 Project Structure
```
Perplexity-2.0/
│── client/                # 🎨 Frontend (React + Vite + TS)
│   ├── src/
│   │   ├── components/    # UI components (Chat UI, CodeBlock, MessageList)
│   │   ├── pages/         # Main pages
│   │   ├── types.ts       # Shared TypeScript interfaces
│   │   └── App.tsx        # Entry point
│   └── package.json
│
│── server/                # ⚙️ Backend (FastAPI + Python)
│   ├── app.py             # Main FastAPI app
│   ├── requirements.txt   # Python dependencies
│   └── src/               # Helper modules (LLM, search, SSE handling)
│
│── .env                   # 🔑 API keys (not committed)
│── README.md              # 📖 This file
│── .gitignore
```

## ⚙️ Tech Stack

### 🔹 Frontend

  - React + TypeScript

  - TailwindCSS (styling)

  - Recharts (charts 📊)

  - React-Syntax-Highlighter (code blocks)

### 🔹 Backend

  - FastAPI (Python)

  - Server-Sent Events (SSE) for streaming responses

  - LangChain + Google Generative AI API

  - Tavily Search API

## 🚀 Getting Started (Local Development)

### 1️⃣ Clone the Repo
```
git clone https://github.com/your-username/perplexity-2.0.git
cd perplexity-2.0
```
### 2️⃣ Setup Backend (FastAPI)
```
cd server
python -m venv venv
source venv/bin/activate  # (Windows: venv\Scripts\activate)
pip install -r requirements.txt
```

### 🔑 Environment Variables

#### Create a .env file inside server/ with:
```
GOOGLE_API_KEY=your_google_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

#### Run backend:
```
uvicorn app:app --reload
```

#### Backend runs at: 
```
http://127.0.0.1:8000
```

### 3️⃣ Setup Frontend (React + Vite)

```
cd client
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

## 🌍 Deployment Guide

### 🚀 Deploy Backend on Render

#### Push code to GitHub.

#### Go to Render
 #### → New Web Service.

#### Connect your GitHub repo → select server/ as the root directory.

#### Set environment variables under Settings → Environment:
```
GOOGLE_API_KEY=your_google_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

### Build & Start Command:
```
pip install -r requirements.txt && uvicorn app:app --host 0.0.0.0 --port 10000
```

### Render gives you a live backend URL like:

 ```https://perplexity-backend.onrender.com```

### 🎨 Deploy Frontend on Vercel

#### Go to Vercel
 #### → New Project.

#### Import GitHub repo → select client/ as project root.

#### In Environment Variables, add:

```VITE_BACKEND_URL=https://perplexity-backend.onrender.com```


#### Vercel auto-deploys → get live frontend link:

```https://perplexity-frontend.vercel.app```

## 🔮 Future Improvements

#### ✅ Add authentication 🔑

#### ✅ Multi-modal (images + voice input 🎤)

#### ✅ Save chat history 📜

#### ✅ Export results (PDF/Markdown)

## 👨‍💻 Author

Made with ❤️ by Amber Bagchi
