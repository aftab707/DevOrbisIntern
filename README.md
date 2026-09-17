# DevOrbis Internship

Welcome to my DevOrbis AI Intern Training Program repository. This repository contains all my code, notes, and progress throughout the 8-week structured roadmap.

## Week 1: Foundations (MERN Basics, Python & Developer Workflow)

### Day 1: Environment & Workflow
* Set up the local development environment (Node.js, Git, VS Code).
* Created accounts for GitHub and MongoDB Atlas.
* Initialized the GitHub repository and established a professional workflow with proper `.gitignore` and `README.md` files.
* Explored AI coding tools (Claude Code) and learned about precise, constraint-rich prompt engineering.

### Day 2: Node.js & Express
* Learned core web concepts: HTTP methods, routing, the request/response cycle, and REST conventions.
* Created an Express web server from scratch.
* Built an **In-Memory CRUD API** (Create, Read, Update, Delete) using a JavaScript array.
* Successfully tested all API endpoints (`GET`, `POST`, `PUT`, `DELETE`) using **Postman**.

### Day 3: MongoDB & Authentication
* **Database Connection:** Connected the Express backend to **MongoDB Atlas** cloud database using `mongoose` and environment variables (`dotenv`).
* **MVC Architecture:** Restructured the project into a professional folder structure (Models, Views, Controllers, Routes).
* **Database Schemas:** Designed robust MongoDB schemas for `User` and `Task` entities.
* **Authentication (JWT & Bcrypt):** 
  * Implemented secure User Registration and Login.
  * Used `bcryptjs` to hash and encrypt user passwords before saving them to the database.
  * Used `jsonwebtoken` (JWT) to generate authentication tokens upon successful login.
* **Route Protection & Data Scoping:** 
  * Created custom Auth Middleware to protect private routes.
  * Ensured that Tasks are strictly scoped to the logged-in user (A user can only see, edit, and delete their own tasks).