# Resuvio-AI 🚀

Resuvio-AI is a comprehensive web application that helps users optimize their resumes, analyze their content using AI, match them against job descriptions, and generate professional cover letters.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Models and Database](#models-and-database)
- [User Workflow](#user-workflow)
- [API Endpoints Overview](#api-endpoints-overview)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Building for Production](#building-for-production)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features ✨
*   **Secure Authentication:** Firebase-based user signup and login with secure token management.
*   **Resume Upload & Parsing:** Support for PDF and DOCX file uploads with automatic content extraction.
*   **AI-Powered Resume Analysis:** Intelligent analysis and scoring of uploaded resumes using Google Generative AI.
*   **AI Resume Builder:** Create professional, ATS-optimized resumes from scratch or existing content.
*   **Job Matching Engine:** Compare resumes against job descriptions to identify skill gaps and compatibility.
*   **Cover Letter Generation:** AI-powered cover letter creation tailored to job descriptions.
*   **Activity Tracking:** Monitor usage and activity history across the platform.
*   **Credits System:** Flexible credit-based system for managing feature usage.
*   **Payment Integration:** Razorpay integration for purchasing credits and premium features.
*   **Referral Program:** Earn credits by referring other users.
*   **Responsive Dashboard:** Intuitive dashboard for managing resumes, generating letters, and tracking progress.

## Technologies Used 🛠️
**Frontend:**

*   **Framework/Library:** React
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **UI Components:** shadcn/ui
*   **Styling:** Tailwind CSS
*   **Routing:** React Router DOM
*   **State Management/Data Fetching:** TanStack Query (React Query)
*   **API Client:** Axios
*   **Authentication:** Firebase Client SDK

**Backend:**

*   **Framework:** Express.js
*   **Language:** TypeScript
*   **Runtime:** Node.js
*   **Authentication:** Firebase Admin SDK (for token verification)
*   **AI:** Google Generative AI SDK (`@google/generative-ai`)
*   **Database:** Firebase Firestore (for storing user data, resume metadata, generated content, etc.)
*   **File Handling:** Multer (uploads), Mammoth (docx parsing), pdf-parse (pdf parsing)
*   **PDF Generation:** pdf-lib for generating downloadable resumes
*   **Payment Processing:** Razorpay SDK for payment integration
*   **API Testing:** Jest, Supertest

## Project Structure 🗂️
The project is organized into two main parts:

*   `frontend` (root directory): Contains the React application built with Vite.
    *   `src/`: Main source code.
        *   `components/`: Reusable UI components (including shadcn/ui).
        *   `pages/`: Top-level page components for different routes.
        *   `lib/`: Core utilities like API client (`api.ts`), Firebase setup (`firebase.ts`).
        *   `context/`: React context providers (e.g., `AuthContext.tsx`).
        *   `App.tsx`: Main application component defining routes.
        *   `main.tsx`: Application entry point.
*   `backend/`: Contains the Node.js/Express API server.
    *   `src/`: Main source code.
        *   `controllers/`: Request handlers containing business logic.
        *   `routes/`: Defines API endpoints and maps them to controllers.
        *   `middleware/`: Custom middleware (e.g., `auth.middleware.ts` for token verification).
        *   `config/`: Configuration files (e.g., `multer.config.ts`, Firebase Admin setup).
        *   `models/`: Contains data models/schemas (e.g., for User, Resume, JobMatchResult) likely interacting with the database.
        *   `server.ts`: Express application setup and entry point.

## Models and Database 📈
*   **Models:** The `backend/src/models/` directory likely defines the structure of data used in the application, such as User profiles, Resume details (metadata, parsed content, analysis results), and potentially Job descriptions or Match results. These models interface with the database.
*   **Database:** Firebase Firestore is used as the NoSQL database. It stores user account information, links to uploaded resumes (stored possibly in Firebase Storage or locally), parsed resume content, analysis scores, generated resume data, and job matching results.

## User Workflow 📊
A typical user interaction with Resuvio-AI follows these steps:

1.  **Authentication:**
    *   New users sign up for an account.
    *   Existing users log in.
2.  **Resume Management (Choose one or more):
    *   **Upload & Analyze:** Upload an existing resume (PDF/DOCX). The system parses it and provides AI-driven analysis and scoring.
    *   **Build:** Use the Resume Builder feature to create a new resume from scratch or based on provided information.
3.  **Job Matching:**
    *   Provide a job description.
    *   Select an uploaded or generated resume.
    *   The system analyzes the match between the resume and the job description, providing insights.
4.  **Review & Refine:**
    *   Based on analysis and matching results, users can refine their resumes using the builder or by uploading revised versions.
    *   Access general resume tips for guidance.
5.  **(Optional) Cover Letter:** Generate cover letters (feature implied by dashboard structure).

## API Endpoints Overview 📚
The backend exposes RESTful API endpoints authenticated using Firebase ID tokens verified by the auth middleware.

Key route groups under `/api`:

**Authentication (`/auth`)**
- `POST /signup` - User registration
- `POST /login` - User login

**Resume Management (`/resumes` - Protected)**
- `GET /` - List all uploaded resumes
- `POST /upload` - Upload and parse resume (PDF/DOCX)
- `POST /:resumeId/analyze` - Get AI analysis for a resume
- `GET /:resumeId` - Get resume details

**Resume Builder (`/builder` - Protected)**
- `GET /generated` - List generated resumes
- `POST /generate` - Generate a new resume with AI
- `GET /download/:id` - Download resume as PDF
- `PUT /:id` - Update generated resume

**Job Matching (`/match` - Protected)**
- `POST /resume-job` - Match resume against job description

**Cover Letter (`/cover-letter` - Protected)**
- `POST /generate` - Generate AI cover letter
- `GET /` - List generated cover letters

**Activity & Credits (`/activity`, `/credits` - Protected)**
- `GET /activity` - User activity history
- `GET /credits` - Get current credit balance

**Payments (`/payment` - Protected)**
- `POST /create-order` - Create Razorpay payment order
- `POST /verify-payment` - Verify payment and add credits

**Referral (`/referral` - Protected)**
- `GET /` - Get referral data
- `POST /share` - Share referral code

**Tips (`/tips` - Public)**
- `GET /` - Fetch general resume writing tips

## Getting Started 🚀
### Prerequisites

*   Node.js and npm (or yarn/pnpm/bun)
*   Firebase Project: Set up a Firebase project for Authentication and Firestore.
*   Google Cloud Project: Set up a project for Google Generative AI and enable the API.
*   Environment Variables: Create `.env` files in both the `frontend` and `backend` directories.

### Environment Variables

**Frontend Directory (`frontend/.env`):**

```
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
VITE_FIREBASE_PROJECT_ID="your_firebase_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
VITE_FIREBASE_APP_ID="your_firebase_app_id"

VITE_API_BASE_URL="http://localhost:3001" # Backend URL (no /api suffix — code adds it automatically)
```

**Backend Directory (`backend/.env`):**

```
PORT=3001

# Firebase Admin SDK Configuration (Service Account Key)
# Option 1: Path to service account JSON file
# GOOGLE_APPLICATION_CREDENTIALS="path/to/your/serviceAccountKey.json"
# Option 2: JSON string directly
# FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
# Option 3: Base64 encoded service account JSON string (preferred for CI/CD)
# FIREBASE_SERVICE_ACCOUNT_BASE64="your_base64_encoded_service_account_json"

# Google Gemini AI API Key
GEMINI_API_KEY="your_gemini_api_key"
GEMINI_MODEL="gemini-2.5-flash"

# CORS Origin (Frontend URL)
FRONTEND_URL="http://localhost:8080" # Vite dev server runs on port 8080
```

## Installation 🛠️
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/piyushh62/Resuvio-AI.git
    cd Resuvio-AI
    ```

2.  **Install Frontend Dependencies:**
    ```bash
    cd frontend
    npm install
    # or yarn install, pnpm install, bun install
    cd ..
    ```

3.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    # or yarn install, pnpm install, bun install
    cd ..
    ```

## Running the Project 🚀
1.  **Start the Backend Server:**
    Open a terminal in the `backend` directory:
    ```bash
    cd backend
    npm run dev
    # or yarn dev, pnpm dev, bun dev
    ```
    The backend server will typically start on `http://localhost:3001` (or the port specified in `backend/.env`).

2.  **Start the Frontend Development Server:**
    Open another terminal in the `frontend` directory:
    ```bash
    cd frontend
    npm run dev
    # or yarn dev, pnpm dev, bun dev
    ```
    The frontend development server will typically start on `http://localhost:8080`.

3.  Open your browser and navigate to `http://localhost:8080`.

## Building for Production 📦
**Frontend:**

From the `frontend` directory:
```bash
cd frontend
npm run build
```
This will create a `dist` folder with the production-ready static assets.

**Backend:**

From the `backend` directory:
```bash
npm run build
```
This will compile TypeScript to JavaScript, outputting to the `dist` folder within the `backend` directory. You can then run the compiled code using `node dist/server.js`.

## Contributing 🤝
Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes and commit them (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/your-feature-name`).
5.  Open a Pull Request.

Please ensure your code adheres to the existing style and that any new features are well-tested.

## License 📄
This project is licensed under the MIT License. See the `LICENSE` file for details (if one is created, otherwise assume MIT).

## Contact 📧
For questions or support, please reach out to [piyushsenjaliya1999@gmail.com](mailto:piyushsenjaliya1999@gmail.com).

---

Made with ❤️ by the Resuvio-AI team.
