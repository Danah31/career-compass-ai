CareerPilot 🎯

AI-Powered CV Analyzer

CareerPilot is an AI-powered web application that helps students and fresh graduates evaluate their CVs against specific job descriptions. It analyzes candidates' qualifications, identifies skill gaps, and provides actionable recommendations to improve their CVs and career readiness.

✨ Key Features

CV Upload: Upload PDF resumes up to 10 MB.

PDF Text Extraction: Extracts text from standard text-based PDF files using PDF.js.

OCR Support: Uses Tesseract.js to recognize text in scanned PDF documents.

AI-Powered Analysis: Uses Google Gemini API to analyze CV content against job requirements.

Match Score: Provides a compatibility score between the candidate's CV and the target job.

Skills Comparison: Identifies matched, partially matched, and missing skills.

Strengths & Weaknesses: Highlights candidate strengths and areas for improvement.

Personalized Recommendations: Suggests CV improvements and skills to develop.

⚙️ System Workflow

The user uploads a CV in PDF format and enters a job description.

The application extracts text from the PDF using PDF.js.

If the PDF contains scanned images, Tesseract.js performs OCR to extract the text.

The extracted CV text and job description are sent to the backend.

The backend sends the information to Google Gemini through the AI SDK.

The AI generates a structured analysis based on the candidate's qualifications and job requirements.

The application validates and sanitizes the AI response using Zod.

The results are displayed in an interactive analysis dashboard.

🔒 Privacy & Data Handling

The application does not currently provide user accounts or persistent analysis history.

CV files are processed for analysis and are not stored in an application database.

The extracted CV text and job description are sent to Google Gemini for AI analysis.

API keys are kept in server-side environment variables and should never be exposed in frontend code.

Please avoid uploading sensitive personal information when using the application.



🚧 Current Scope & Limitations

PDF uploads only, with a maximum file size of 10 MB.

OCR currently uses English language recognition.

Analysis quality depends on the extracted text and the AI model's response.

No authentication, database, or saved analysis history.

Gemini API usage is subject to the available model quotas and pricing.

🛠️ Tech Stack

React

TypeScript

Tailwind CSS

Google Gemini API

PDF.js

Tesseract.js (OCR)



👩‍💻 Project Goal

The goal of CareerPilot is to make job applications more informed and effective by helping users understand how their qualifications align with job requirements and where they can improve.


Developed as a practical project exploring AI-powered career tools and intelligent document analysis.