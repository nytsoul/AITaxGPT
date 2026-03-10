
# AI Tax Planning Assistant

This project now includes a redesigned React frontend and a Python FastAPI backend for each core module:

- Dashboard
- Tax Calculator
- AI Assistant
- Deductions
- Expenses
- Documents
- Scenarios
- Reports

## Stack

- Frontend: React + Vite + Tailwind + Radix UI
- Backend: FastAPI + Uvicorn
- Font: Roboto

## Running the app

1. Install frontend dependencies:

   `npm install`

2. Install backend dependencies:

   `python -m pip install -r requirements.txt`

3. Start both frontend and backend together:

   `npm run dev`

The frontend runs on `http://127.0.0.1:5173` and proxies API calls to the Python backend on `http://127.0.0.1:8000`.

## Build

`npm run build`
  