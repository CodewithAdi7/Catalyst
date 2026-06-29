# CATALYST // AI intergrated reminder
### *The End of Blank Screen Anxiety. Start Swiftly, Finish Flawlessly.*

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](file:///d:/Catalyst/vercel.json)
[![Python FastAPI Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](file:///d:/Catalyst/backend)
[![Vite React TypeScript Frontend](https://img.shields.io/badge/Frontend-Vite%20%2B%20React%20%2B%20TS-646CFF?style=flat-square&logo=vite&logoColor=white)](file:///d:/Catalyst/frontend)
[![Powered by Gemini](https://img.shields.io/badge/AI-Gemini%202.5-blue?style=flat-square&logo=google-gemini)](https://ai.google.dev/)

---

## Live app link :-  https://catalyst-opal-five.vercel.app/

### Note:- The above link will open the website of my app that explains you about the features and functionality of the app, to test it you have to click on "Launch App" button on the navbar and then start testing.

##  Key Features

### 1. AI-Driven "Time Sprint Attack" Slicing
Catalyst takes a monolithic goal (e.g., *"Build an auth middleware for FastAPI"*) and breaks it down into bite-sized 15-minute sprints using customized prompt constraints.
* **UI-First Slicing**: Slices start with the most visible elements, ensuring rapid visual feedback, before progressing to backend logic and integration.
* **Grounding Engine**: Leverages the Gemini API with **Google Search Grounding** to research best-practice folder arrangements and technology trends for your stack before generating structural suggestions.

### 2. Dynamic Code & Document Scaffolding
* **Developer Workspaces**: Generates setup commands (e.g. `npm install`, `venv` configurations), file structures, import boilerplate, design notes, and API references.
* **Office & Creative Suites**: Bridges development with administrative writing. Connects to Microsoft Office (Word, PowerPoint, Excel) and Notepad.
  * **MS Word & PowerPoint**: Automatically structures content outlines and saves them as formatted Rich Text Format (`.rtf`) templates.
  * **MS Excel**: Automatically populates columns, structures rows, and sets up live mathematical functions (like `SUM` or `AVERAGE`) inside formatted `.csv` sheets.
  * **Notepad**: Generates clean plain-text `.txt` drafting starter pads.

### 3. Direct System Materialization & App Launching
* Writes code scaffolds directly onto your machine under `~/Desktop/generated_workspace/`.
* Runs project dependencies configurations in background sub-shells.
* Uses native OS launchers to boot up the materialized workspace directly inside VS Code or Microsoft Office.

### 4. Conflict-Aware Calendar & Deadline Fit
* Imports calendar events (e.g., meetings, client syncs, releases) to calculate scheduling conflicts.
* Compares time budgets against sprint durations.
* Scores deadline urgency on a scale of 1-100 and ranks the task queue using risk indicators (`low`, `medium`, `high`) along with AI-reasoned schedule adjustments.

### 5. File-System Verification & Procrastination Check
* Actively scans workspace files on your local drive.
* Evaluates code density changes and deletes boilerplate comments to track real progress.
* Locks the next step until the current milestone is programmatically verified as complete.

---

## Note :- The AI scaffolding will write the code scaffolds directly on your machine only when you run the backend locally on your machine as in the above given live link it runs on online server so the AI will not be able to write code scaffold on your machine locally.

## System Architecture

Catalyst uses a decoupled server-client architecture, deploying on **Vercel** as unified experimental services.

```
                  ┌──────────────────────────────┐
                  │      React SPA Frontend      │
                  │         (Vite + TS)          │
                  └──────────────┬───────────────┘
                                 │
                                 │ HTTP POST REST Requests
                                 ▼
                  ┌──────────────────────────────┐
                  │       FastAPI Backend        │
                  │      (Python Gateway)        │
                  └──────────────┬───────────────┘
                                 │
                 ┌───────────────┼────────────────┐
                 ▼               ▼                ▼
       ┌──────────────────┐┌───────────┐┌───────────────────┐
       │Gemini Service API││Filesystem ││    OS Launchers   │
       │(Search Grounded) ││(Local OS) ││ (Sub-process CLI)│
       └──────────────────┘└───────────┘└───────────────────┘
```

### Technical Stack & Libraries
* **Frontend**: [Vite](https://vitejs.dev/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Tailwind CSS](https://tailwindcss.com/) + [Motion](https://motion.dev/) (Framer Motion) + [Lucide Icons](https://lucide.dev/).
* **Backend**: [FastAPI](https://fastapi.tiangolo.com/) + [Pydantic v2](https://docs.pydantic.dev/) + [Uvicorn](https://www.uvicorn.org/).
* **AI Orchestration**: [Google Gemini 2.5 API](https://ai.google.dev/) (Flash/Pro) with Structured outputs & Search Grounding.
* **Environment Configuration**: [Vercel Multi-Project Routing](file:///d:/Catalyst/vercel.json).

---

##  Repository Structure

* [backend/](file:///d:/Catalyst/backend) - FastAPI microservice application.
  * [backend/app/main.py](file:///d:/Catalyst/backend/app/main.py) - API entry point and router attachments.
  * [backend/app/api/sprint.py](file:///d:/Catalyst/backend/app/api/sprint.py) - Endpoint route declarations.
  * [backend/app/services/sprint_service.py](file:///d:/Catalyst/backend/app/services/sprint_service.py) - Main logic for slicing, scaffolding, and file writing.
  * [backend/app/models/sprint.py](file:///d:/Catalyst/backend/app/models/sprint.py) - Rigid Pydantic model contracts.
* [frontend/](file:///d:/Catalyst/frontend) - Premium React developer workspace app.
  * [frontend/src/App.tsx](file:///d:/Catalyst/frontend/src/App.tsx) - Interactive marketing shell and theme manager.
  * [frontend/src/components/OryzoApp.tsx](file:///d:/Catalyst/frontend/src/components/OryzoApp.tsx) - Primary user workspace interface.
  * [frontend/src/components/ThreeDCalendar.tsx](file:///d:/Catalyst/frontend/src/components/ThreeDCalendar.tsx) - Interactive scheduling view.
* [vercel.json](file:///d:/Catalyst/vercel.json) - Production multi-project routing configuration.

---

##  Installation & Local Setup

###  1. Environment Configurations
First, acquire a Gemini API Key from [Google AI Studio](https://aistudio.google.com/).

Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

Configure environment endpoints in `frontend/` directory (if targeting non-standard development ports):
```env
VITE_BACKEND_URL="http://localhost:8000"
```

### 2. Run the Backend (FastAPI)
Navigate to the [backend](file:///d:/Catalyst/backend) folder and start the API server:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows
# source .venv/bin/activate    # macOS/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload
```
*The API docs will be live at http://127.0.0.1:8000/docs.*

### 3. Run the Frontend (Vite)
Navigate to the [frontend](file:///d:/Catalyst/frontend) folder and start the client dev server:

```powershell
cd frontend
npm install
npm run dev
```
*Open http://localhost:5173 to interact with the workspace.*

---

## Contributors & Credits

Created with ❤️ for the Hackathon. 

* **By Aditya** - [Aditya](https://github.com/CodewithAdi7)

*Feedback, bug reports, and pull requests are welcome!*
