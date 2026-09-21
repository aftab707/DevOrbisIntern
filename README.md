# DevOrbis AI Intern Training Program - Week 1

Welcome to my repository for the DevOrbis AI Intern Training Program. This repository contains my progress, daily learning logs, and the final weekly projects.

---

## 🎯 Week1 Project: TaskTrack (Full-Stack Task Manager)

TaskTrack is a complete, production-ready MERN stack application built as the final deliverable for Week 1. It allows users to register, securely log in, and manage their personal tasks. 

### Features
* **Secure Authentication:** User registration and login using JSON Web Tokens (JWT) and Bcrypt password hashing.
* **Data Scoping:** Tasks are strictly scoped so that users can only view, edit, and delete their own tasks.
* **Full CRUD Operations:** Create, Read, Update (edit text and toggle status), and Delete tasks.
* **REST API:** A robust Node.js/Express backend that handles all business logic and connects to MongoDB Atlas.
* **React Frontend:** A modern, responsive user interface built with Vite, React Router, and Context API for global state management.

### Tech Stack
* **MongoDB Atlas** (Database)
* **Express.js & Node.js** (Backend Framework & Runtime)
* **React.js (Vite)** (Frontend UI)
* **Mongoose** (ODM for MongoDB)
* **Axios** (HTTP Client)

---

##  Setup & Installation Instructions

If you want to clone this repository and run TaskTrack on your local machine, follow these steps carefully:

### Prerequisites
1. Ensure you have **Node.js** installed on your computer.
2. Create a free **MongoDB Atlas** account and get your cluster connection string.
3. Ensure you have **Git** installed.

### 1. Clone the Repository
Open your terminal and run the following command to download the project to your local machine:
```bash
git clone https://github.com/aftab707/DevOrbisIntern.git
cd DevOrbisIntern
```

### 2. Setup the Backend
1. In your terminal, navigate to the backend folder:
   ```bash
   cd Week1/TaskTrack/backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and add the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string_here
   JWT_SECRET=any_secret_random_string_here
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   *(You should see "MongoDB Connected" in your terminal).*

### 2. Setup the Frontend
1. Open a **new** terminal window and navigate to the frontend folder:
   ```bash
   cd Week1/TaskTrack/frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`. You are ready to go!

---

## 📅 Daily Progress Log

### Day 1: Environment & Workflow
* Set up the local development environment (Node.js, Git, VS Code).
* Created accounts for GitHub and MongoDB Atlas.
* Initialized the GitHub repository and established a professional workflow with proper `.gitignore`.
* Explored AI coding tools (Claude Code) and learned about precise, constraint-rich prompt engineering.

### Day 2: Node.js & Express
* Learned core web concepts: HTTP methods, routing, the request/response cycle, and REST conventions.
* Created an Express web server from scratch.
* Built an **In-Memory CRUD API** (Create, Read, Update, Delete) using a JavaScript array.
* Successfully tested all API endpoints using **Postman**.

### Day 3: MongoDB & Authentication
* **Database Connection:** Connected the Express backend to **MongoDB Atlas** cloud database using `mongoose`.
* **MVC Architecture:** Restructured the project into a professional folder structure (Models, Views, Controllers, Routes).
* **Authentication:** Implemented secure User Registration and Login. Used `bcryptjs` to hash passwords and `jsonwebtoken` (JWT) to generate authentication tokens.
* **Route Protection:** Created custom Auth Middleware to protect private routes and scoped Tasks to the logged-in user.

### Day 4: React Fundamentals & Integration
* Initialized a React frontend using **Vite**.
* Cleaned up boilerplate code and implemented **React Router** for multi-page navigation (Login, Register, Dashboard).
* Implemented the **Context API** (`AuthContext`) to manage global user state and persist logins using `localStorage`.
* Built the UI using React components and hooks (`useState`, `useEffect`).
* Connected the frontend to the backend using **Axios**, successfully testing end-to-end data fetching and form submissions.
* Added inline editing capabilities for full frontend CRUD functionality.

### Week 2 - Day 1: LLM Landscape & API Integration
* Explored the LLM API Landscape and successfully integrated the Groq API (OpenAI SDK standard) to run inference programmatically.
* Implemented the `tiktoken` library for accurate token counting and request size estimation before executing API calls.
* Configured core model hyperparameters, specifically tuning `temperature` for factual vs. creative outputs and managing `max_tokens` to prevent response cut-offs.

### Week 2 - Day 2: Prompt Engineering Principles
* Mastered Prompt Engineering fundamentals including System vs. User messages and Role-based prompting (personas).
* Applied the C.T.C.F (Context, Task, Constraints, Format) framework to systematically structure and improve vague prompts.
* Conducted prompt-fixing exercises to evaluate how constraint-rich instructions change LLM outputs.

### Week 2 - Day 3: Few-Shot Prompting & Templates
* Transitioned from zero-shot to Few-Shot prompting patterns to dictate strict output formatting to the AI.
* Developed a reusable prompt template architecture using `prompts.json` to cleanly decouple prompt text from the core Python application logic.
* Dynamically formatted template variables in Python to build modular LLM requests.

### Week 2 - Day 4: Structured JSON Output
* Designed strict data extraction schemas using `Pydantic` (`BaseModel`) to transform unstructured text into structured, predictable data.
* Enforced Structured JSON Output by integrating the `instructor` library.
* Implemented function-calling patterns, automatic Pydantic validation, and `retry-on-invalid` error handling for deterministic tasks.