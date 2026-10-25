# AI Usage Log — Motorstock

This file documents the use of ChatGPT as an AI-assisted development tool while building the Car Dealership Inventory System, Motorstock.

## Public Conversation

**Tool:** ChatGPT

**Shared conversation:** https://chatgpt.com/share/6ade1881-a7b8-83ec-9feb-564387b227e4

The shared conversation documents the AI-assisted development discussions, implementation guidance, debugging, testing, and documentation work associated with this project.

## 1. Backend Architecture and Authentication

**Topics covered:**
- Setting up a Node.js, Express, and TypeScript backend.
- Connecting the application to PostgreSQL.
- Initializing the database tables for users and vehicles.
- Implementing user registration and login.
- Hashing passwords with bcrypt.
- Implementing JWT authentication and protected routes.

**Code areas:** `backend/src/`

**Verification:** The backend was run locally, and registration and login were tested using automated tests.

## 2. Test-Driven Development and Vehicle Inventory

**Topics covered:**
- Writing and running automated tests for backend functionality.
- Implementing vehicle creation and listing.
- Searching the inventory.
- Purchasing vehicles and validating available stock.
- Restricting vehicle restocking and deletion to administrators.
- Resolving TypeScript build configuration issues.

**Code areas:** `backend/src/`, `backend/tests/`, `backend/tsconfig.json`

**Verification:** The backend test suite reported 11 passing tests. The TypeScript production build completed successfully.

## 3. Frontend Development

**Topics covered:**
- Setting up a React and TypeScript frontend using Vite.
- Connecting the frontend to the backend API using Axios.
- Implementing registration and login interfaces.
- Displaying and searching vehicle inventory.
- Adding vehicles and purchasing available stock.
- Providing administrative inventory controls.
- Styling the application with CSS.

**Code areas:** `frontend/src/`, `frontend/package.json`, `frontend/vite.config.ts`

**Verification:** The frontend was opened in a browser. Vehicle creation and purchasing were manually tested. The frontend production build completed successfully.

## 4. Documentation and Submission

**Topics covered:**
- Preparing the project README and setup instructions.
- Documenting the API and technology stack.
- Recording AI assistance in this file.
- Checking Git status, whitespace errors, staged files, and commit history.
- Preparing the project for submission.

**Files:** `README.md`, `PROMPTS.md`

**Verification:** The documentation and staged changes were reviewed during the final submission preparation.

## Raw Prompt and Response Reference

The shared ChatGPT conversation above is the reference for the original prompts and AI responses used during development.

This document is a structured summary of the AI-assisted work; it is not a verbatim transcript of every message. If the assignment requires raw prompt and response text to be included directly in this file, that text must be appended from the original conversation.

## Human Review and Responsibility

AI assistance was used for implementation guidance, debugging, testing support, and documentation. The project was run and tested locally. The developer is responsible for reviewing the implementation, understanding the code, validating the functionality, and disclosing any incomplete requirements or unverified behavior.