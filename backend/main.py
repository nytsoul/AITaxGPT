from __future__ import annotations

from copy import deepcopy
from datetime import date, datetime, timedelta
from typing import Literal
from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel

from typing import Optional
import os
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env file
load_dotenv()

# database
from .db import get_db, object_id
from motor.motor_asyncio import AsyncIOMotorDatabase

# auth helpers
import bcrypt
from jose import JWTError, jwt
from authlib.integrations.starlette_client import OAuth


app = FastAPI(title="TaxGPT API", version="1.0.0")

# auth configuration
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID", ""),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET", ""),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

# Initializing Groq Client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


IncomeType = Literal["salary", "freelance", "business", "investment"]
ExpenseCategory = Literal["business", "education", "medical", "travel", "insurance", "other"]
RoleType = Literal["user", "assistant"]


class CalculatorInput(BaseModel):
    filingStatus: str
    salary: float
    freelance: float
    business: float
    investment: float
    standard: float
    retirement: float
    hsa: float
    studentLoan: float
    charitable: float


class AssistantMessageRequest(BaseModel):
    message: str


class DeductionToggleRequest(BaseModel):
    applied: bool


class ExpenseCreateRequest(BaseModel):
    category: ExpenseCategory
    description: str
    amount: float
    date: str


class ExpenseToggleRequest(BaseModel):
    deductible: bool


class ScenarioSimulationRequest(BaseModel):
    baseIncome: float
    baseDeductions: float
    additionalInvestment: float


class ScenarioSaveRequest(BaseModel):
    name: str
    description: str
    additionalInvestment: float
    additionalDeductions: float
    projectedSavings: float

# auth models
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    hashed_password: str

class UserOut(UserBase):
    id: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None


calculator_profile = {
    "filingStatus": "single",
    "salary": 75000,
    "freelance": 15000,
    "business": 0,
    "investment": 5000,
    "standard": 13850,
    "retirement": 8000,
    "hsa": 3600,
    "studentLoan": 0,
    "charitable": 0,
}

deductions = [
    {
        "id": "ded-1",
        "type": "Standard Deduction",
        "description": "Standard deduction for single filer",
        "amount": 13850,
        "applied": True,
    },
    {
        "id": "ded-2",
        "type": "Retirement Contribution",
        "description": "401(k) contribution",
        "amount": 8000,
        "applied": True,
    },
    {
        "id": "ded-3",
        "type": "Health Savings Account",
        "description": "HSA contribution",
        "amount": 3600,
        "applied": True,
    },
    {
        "id": "ded-4",
        "type": "Student Loan Interest",
        "description": "Interest paid on qualified student loans",
        "amount": 2500,
        "applied": False,
    },
    {
        "id": "ded-5",
        "type": "Charitable Contributions",
        "description": "Documented donations to qualified charities",
        "amount": 1200,
        "applied": False,
    },
]

expenses = [
    {
        "id": "exp-1",
        "category": "business",
        "description": "Home Office Equipment",
        "amount": 2500,
        "date": "2026-01-15",
        "deductible": True,
    },
    {
        "id": "exp-2",
        "category": "education",
        "description": "Professional Course",
        "amount": 1500,
        "date": "2026-02-20",
        "deductible": True,
    },
    {
        "id": "exp-3",
        "category": "medical",
        "description": "Health Insurance Premium",
        "amount": 3600,
        "date": "2026-01-01",
        "deductible": True,
    },
    {
        "id": "exp-4",
        "category": "travel",
        "description": "Business Trip",
        "amount": 1200,
        "date": "2026-03-10",
        "deductible": True,
    },
    {
        "id": "exp-5",
        "category": "other",
        "description": "Personal Shopping",
        "amount": 800,
        "date": "2026-02-14",
        "deductible": False,
    },
]

documents = [
    {
        "id": "doc-1",
        "name": "W2_2025.pdf",
        "type": "PDF",
        "category": "Income",
        "size": "245 KB",
        "uploadDate": "2026-02-15",
        "status": "processed",
        "extractedData": {"amount": 75000, "date": "2025-12-31", "vendor": "ABC Corporation"},
    },
    {
        "id": "doc-2",
        "name": "health_insurance_receipt.jpg",
        "type": "Image",
        "category": "Medical",
        "size": "1.2 MB",
        "uploadDate": "2026-01-10",
        "status": "processed",
        "extractedData": {"amount": 3600, "date": "2026-01-01", "vendor": "HealthCare Plus"},
    },
    {
        "id": "doc-3",
        "name": "home_office_invoice.pdf",
        "type": "PDF",
        "category": "Business",
        "size": "180 KB",
        "uploadDate": "2026-01-20",
        "status": "processed",
        "extractedData": {"amount": 2500, "date": "2026-01-15", "vendor": "Office Depot"},
    },
    {
        "id": "doc-4",
        "name": "education_receipt.pdf",
        "type": "PDF",
        "category": "Education",
        "size": "95 KB",
        "uploadDate": "2026-02-25",
        "status": "processing",
        "extractedData": None,
    },
]

scenarios = [
    {
        "id": "scn-1",
        "name": "Maximize Retirement",
        "description": "Increase 401(k) contribution to the annual limit.",
        "additionalInvestment": 10000,
        "additionalDeductions": 10000,
        "projectedSavings": 2200,
    },
    {
        "id": "scn-2",
        "name": "Health Savings Strategy",
        "description": "Max out HSA contributions to lower taxable income.",
        "additionalInvestment": 4500,
        "additionalDeductions": 4500,
        "projectedSavings": 990,
    },
    {
        "id": "scn-3",
        "name": "Education Investment",
        "description": "Channel funds into an education savings plan.",
        "additionalInvestment": 5000,
        "additionalDeductions": 5000,
        "projectedSavings": 1100,
    },
]

yearly_data = [
    {"year": 2023, "totalIncome": 65000, "totalDeductions": 18000, "taxableIncome": 47000, "taxPaid": 7800},
    {"year": 2024, "totalIncome": 70000, "totalDeductions": 20000, "taxableIncome": 50000, "taxPaid": 8400},
    {"year": 2025, "totalIncome": 85000, "totalDeductions": 22000, "taxableIncome": 63000, "taxPaid": 11200},
    {"year": 2026, "totalIncome": 95000, "totalDeductions": 25450, "taxableIncome": 69550, "taxPaid": 12500},
]

deadlines = [
    {"title": "Q1 Estimated Tax Payment", "date": "April 15, 2026", "daysLeft": 36, "status": "upcoming"},
    {"title": "2025 Tax Return Filing", "date": "April 15, 2026", "daysLeft": 36, "status": "upcoming"},
    {"title": "Q2 Estimated Tax Payment", "date": "June 16, 2026", "daysLeft": 98, "status": "pending"},
]

deduction_categories = [
    {
        "name": "Above-the-Line Deductions",
        "description": "Reduce adjusted gross income before taxable income is computed.",
        "items": [
            {"name": "Educator Expenses", "max": 300, "description": "For classroom supplies purchased by teachers."},
            {"name": "IRA Contributions", "max": 6500, "description": "Traditional IRA contributions for eligible earners."},
            {"name": "Student Loan Interest", "max": 2500, "description": "Interest paid on qualified student loans."},
        ],
    },
    {
        "name": "Itemized Deductions",
        "description": "Useful when itemized deductions exceed the standard deduction.",
        "items": [
            {"name": "Medical Expenses", "max": None, "description": "Qualified medical expenses above the AGI threshold."},
            {"name": "State & Local Taxes", "max": 10000, "description": "SALT deduction cap."},
            {"name": "Charitable Contributions", "max": None, "description": "Donations to qualified organizations."},
        ],
    },
    {
        "name": "Business Deductions",
        "description": "For freelance and self-employed income streams.",
        "items": [
            {"name": "Home Office", "max": None, "description": "Dedicated workspace used regularly for business."},
            {"name": "Business Equipment", "max": None, "description": "Hardware, furniture, software, and supplies."},
            {"name": "Vehicle Expenses", "max": None, "description": "Mileage or actual expenses with documentation."},
        ],
    },
]

assistant_suggested_questions = [
    "How can I reduce my tax?",
    "Show my audit risk score",
    "What deductions am I missing?",
    "Explain my self-employment tax",
    "Run an investment scenario",
]



# authentication helpers

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except ValueError:
        return False


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> Optional[dict]:
    return await db["users"].find_one({"email": email})


async def authenticate_user(db: AsyncIOMotorDatabase, email: str, password: str) -> Optional[dict]:
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.get("hashed_password", "")):
        return None
    return user


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = await get_user_by_email(get_db(), token_data.email)
    if user is None:
        raise credentials_exception
    return user


async def get_user_calculator_profile(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    profile = await db["calculator_profiles"].find_one({"user_id": user_id})
    if not profile:
        profile = deepcopy(calculator_profile)
        profile["user_id"] = user_id
        await db["calculator_profiles"].insert_one(profile)
    profile["_id"] = str(profile.get("_id", ""))
    return profile


async def get_user_deductions(db: AsyncIOMotorDatabase, user_id: str) -> list[dict]:
    items = await db["deductions"].find({"user_id": user_id}).to_list(length=100)
    if not items:
        items = deepcopy(deductions)
        for item in items:
            item["user_id"] = user_id
        await db["deductions"].insert_many(items)
    for item in items:
        item["_id"] = str(item.get("_id", ""))
    return items


async def get_user_expenses(db: AsyncIOMotorDatabase, user_id: str) -> list[dict]:
    items = await db["expenses"].find({"user_id": user_id}).to_list(length=1000)
    if not items:
        # for initial users, we might want some demo expenses or empty
        items = deepcopy(expenses)
        for item in items:
            item["user_id"] = user_id
        await db["expenses"].insert_many(items)
    for item in items:
        item["_id"] = str(item.get("_id", ""))
    return items


async def get_user_documents(db: AsyncIOMotorDatabase, user_id: str) -> list[dict]:
    items = await db["documents"].find({"user_id": user_id}).to_list(length=100)
    if not items:
        items = deepcopy(documents)
        for item in items:
            item["user_id"] = user_id
        await db["documents"].insert_many(items)
    for item in items:
        item["_id"] = str(item.get("_id", ""))
    return items


async def get_user_scenarios(db: AsyncIOMotorDatabase, user_id: str) -> list[dict]:
    items = await db["scenarios"].find({"user_id": user_id}).to_list(length=100)
    if not items:
        items = deepcopy(scenarios)
        for item in items:
            item["user_id"] = user_id
        await db["scenarios"].insert_many(items)
    for item in items:
        item["_id"] = str(item.get("_id", ""))
    return items


async def sync_deductions_from_profile(profile: dict, user_deductions: list[dict], db: AsyncIOMotorDatabase) -> None:
    mapping = {
        "Standard Deduction": profile["standard"],
        "Retirement Contribution": profile["retirement"],
        "Health Savings Account": profile["hsa"],
        "Student Loan Interest": max(profile["studentLoan"], 2500 if any(d["id"] == "ded-4" and d["applied"] for d in user_deductions) else profile["studentLoan"]),
        "Charitable Contributions": max(profile["charitable"], 1200 if any(d["id"] == "ded-5" and d["applied"] for d in user_deductions) else profile["charitable"]),
    }
    changed = False
    for item in user_deductions:
        if item["type"] in mapping:
            amount = mapping[item["type"]]
            new_amount = amount if amount > 0 else item.get("amount", 0)
            if item.get("amount") != new_amount:
                item["amount"] = new_amount
                changed = True
            if item["type"] in {"Student Loan Interest", "Charitable Contributions"}:
                new_applied = amount > 0 if item["id"] in {"ded-4", "ded-5"} else item.get("applied", False)
                if item.get("applied") != new_applied:
                    item["applied"] = new_applied
                    changed = True
    if changed:
        for item in user_deductions:
            await db["deductions"].update_one({"user_id": item["user_id"], "id": item["id"]}, {"$set": {"amount": item["amount"], "applied": item["applied"]}})


def calculate_tax(income: float) -> int:
    brackets = [
        {"limit": 11000, "rate": 0.10},
        {"limit": 44725, "rate": 0.12},
        {"limit": 95375, "rate": 0.22},
        {"limit": 182100, "rate": 0.24},
        {"limit": 231250, "rate": 0.32},
        {"limit": 578125, "rate": 0.35},
        {"limit": float("inf"), "rate": 0.37},
    ]
    tax = 0.0
    previous_limit = 0.0
    for bracket in brackets:
        if income <= previous_limit:
            break
        taxable_at_this_rate = min(income, bracket["limit"]) - previous_limit
        tax += taxable_at_this_rate * bracket["rate"]
        previous_limit = bracket["limit"]
    return round(tax)


def total_income_calc(profile: dict) -> float:
    return profile.get("salary", 0) + profile.get("freelance", 0) + profile.get("business", 0) + profile.get("investment", 0)


def income_sources_calc(profile: dict) -> list[dict]:
    return [
        {"id": "inc-1", "type": "salary", "description": "Annual Salary", "amount": profile["salary"], "year": 2026},
        {"id": "inc-2", "type": "freelance", "description": "Consulting Work", "amount": profile["freelance"], "year": 2026},
        {"id": "inc-3", "type": "business", "description": "Business Revenue", "amount": profile["business"], "year": 2026},
        {"id": "inc-4", "type": "investment", "description": "Dividend Income", "amount": profile["investment"], "year": 2026},
    ]


async def calculator_result(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    profile = await get_user_calculator_profile(db, user_id)
    user_deductions = await get_user_deductions(db, user_id)
    await sync_deductions_from_profile(profile, user_deductions, db)
    
    income_total = total_income_calc(profile)
    deduction_total = sum(
        [
            profile.get("standard", 0),
            profile.get("retirement", 0),
            profile.get("hsa", 0),
            profile.get("studentLoan", 0),
            profile.get("charitable", 0),
        ]
    )
    taxable_income = max(income_total - deduction_total, 0)
    estimated_tax = calculate_tax(taxable_income)
    marginal_rate = "24%" if taxable_income > 95375 else "22%" if taxable_income > 44725 else "12%" if taxable_income > 11000 else "10%"
    return {
        "input": profile,
        "summary": {
            "totalIncome": income_total,
            "totalDeductions": deduction_total,
            "taxableIncome": taxable_income,
            "estimatedTax": estimated_tax,
            "effectiveTaxRate": round((estimated_tax / income_total) * 100, 2) if income_total else 0,
            "marginalRate": marginal_rate,
            "quarterlyPayment": round(estimated_tax / 4),
        },
        "brackets": [
            {"range": "$0 - $11,000", "rate": "10%"},
            {"range": "$11,000 - $44,725", "rate": "12%"},
            {"range": "$44,725 - $95,375", "rate": "22%"},
            {"range": "$95,375 - $182,100", "rate": "24%"},
            {"range": "$182,100+", "rate": "32%+"},
        ],
    }


def tax_health_check(profile: dict, deductions: list[dict], expenses: list[dict], documents: list[dict]) -> dict:
    issues = []
    score = 100
    
    # Check for missing income sources (common for freelancers)
    if profile.get("freelance", 0) > 0 and len([e for e in expenses if e["category"] == "business"]) == 0:
        issues.append({"type": "error", "message": "Freelance income found but no business expenses recorded. You may be overpaying tax."})
        score -= 15
        
    # Check for low document coverage
    processed_docs = len([d for d in documents if d["status"] == "processed"])
    if len(documents) > 0:
        coverage = (processed_docs / len(documents)) * 100
        if coverage < 50:
            issues.append({"type": "warning", "message": f"Low document coverage ({round(coverage)}%). Incomplete evidence increases audit risk."})
            score -= 20

    # High expense to income ratio check
    income = total_income_calc(profile)
    expense_total = sum(e["amount"] for e in expenses)
    if income > 0 and (expense_total / income) > 0.6:
        issues.append({"type": "risk", "message": "High-expense-to-income ratio detected. This is a common IRS audit trigger."})
        score -= 25

    # Check for unapplied but high-value deductions
    unapplied = [d for d in deductions if not d.get("applied", False) and d.get("amount", 0) > 5000]
    if unapplied:
        issues.append({"type": "opportunity", "message": f"High-value deduction ({unapplied[0]['type']}) is unapplied. Save up to ${round(unapplied[0]['amount'] * 0.22):,} instantly."})
        score -= 5 # Neutral but worth noting

    return {
        "score": max(score, 0),
        "status": "Healthy" if score > 80 else "Attention Required" if score > 50 else "High Risk",
        "issues": issues
    }

def get_notifications(user_id: str, deadlines: list[dict], health: dict) -> list[dict]:
    notes = []
    # Add deadline alerts
    for d in deadlines:
        days = d.get("daysLeft", 99)
        if days < 30:
            notes.append({
                "id": str(uuid4()),
                "title": f"Deadline Approaching: {d['title']}",
                "message": f"You have {days} days left until {d['date']}. Avoid late penalties.",
                "type": "deadline",
                "timestamp": datetime.utcnow().isoformat()
            })
    
    # Add health alerts
    for issue in health["issues"]:
        if issue["type"] in ["error", "risk"]:
            notes.append({
                "id": str(uuid4()),
                "title": "System Alert",
                "message": issue["message"],
                "type": issue["type"],
                "timestamp": datetime.utcnow().isoformat()
            })
            
    return notes


async def ai_response(db: AsyncIOMotorDatabase, user_id: str, message: str) -> str:
    profile = await get_user_calculator_profile(db, user_id)
    user_deductions = await get_user_deductions(db, user_id)
    user_expenses = await get_user_expenses(db, user_id)
    user_documents = await get_user_documents(db, user_id)

    income_total = total_income_calc(profile)
    deduction_total = sum(d.get("amount", 0) for d in user_deductions if d.get("applied", False))
    taxable_income = max(income_total - deduction_total, 0)
    estimated_tax = calculate_tax(taxable_income)

    # Prepare context for LLM
    context = (
        f"User Profile Info:\n"
        f"- Filing Status: {profile.get('filingStatus', 'Single')}\n"
        f"- Total Income: ${income_total:,}\n"
        f"- Total Applied Deductions: ${deduction_total:,}\n"
        f"- Estimated Tax: ${estimated_tax:,}\n"
        f"- Taxable Income: ${taxable_income:,}\n"
        f"\nDeductions List:\n"
        + "\n".join([f"- {d.get('type')}: ${d.get('amount', 0)} ({ 'Applied' if d.get('applied') else 'Available' })" for d in user_deductions])
        + f"\n\nExpenses: {len(user_expenses)} total records."
        + f"\nDocuments: {len(user_documents)} total uploaded."
    )

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a professional tax assistant for TaxGPT. "
                        "You provide concise, helpful, and accurate tax planning advice based on the user's specific profile data provided in the context. "
                        "Always reference their real numbers when answering. "
                        "If a question is not about taxes or finance, politely steer them back. "
                        "Keep responses professional and easy to read with bullet points if needed."
                    )
                },
                {
                    "role": "user",
                    "content": f"Context:\n{context}\n\nUser Question: {message}"
                }
            ],
            temperature=0.7,
            max_tokens=1024,
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Groq API Error: {e}")
        return "I'm having trouble connecting to my brain right now. Please try again later."


async def dashboard_payload(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    profile = await get_user_calculator_profile(db, user_id)
    user_deductions = await get_user_deductions(db, user_id)
    user_expenses = await get_user_expenses(db, user_id)
    user_documents = await get_user_documents(db, user_id)

    income_total = total_income_calc(profile)
    deduction_total = sum(item["amount"] for item in user_deductions if item["applied"])
    taxable_income = max(income_total - deduction_total, 0)
    estimated_tax = calculate_tax(taxable_income)
    expense_total = sum(item["amount"] for item in user_expenses)
    potential = [item for item in user_deductions if not item["applied"]]
    potential_amount = sum(item["amount"] for item in potential)

    income_breakdown = [
        {"name": item["type"], "value": item["amount"]}
        for item in income_sources_calc(profile)
        if item["amount"] > 0
    ]

    category_totals: dict[str, float] = {}
    for item in user_expenses:
        category_totals[item["category"]] = category_totals.get(item["category"], 0) + item["amount"]

    expense_breakdown = [{"category": key, "amount": value} for key, value in category_totals.items()]

    # Calculate dynamic monthly data from expenses
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    current_month_idx = datetime.now().month - 1
    # Show last 6 months
    show_months = []
    for i in range(5, -1, -1):
        idx = (current_month_idx - i) % 12
        show_months.append(months[idx])

    monthly_stats = []
    avg_monthly_income = income_total / 12
    for m_name in show_months:
        m_expenses = sum(e["amount"] for e in user_expenses if datetime.fromisoformat(e["date"]).strftime("%b") == m_name)
        monthly_stats.append({
            "month": m_name,
            "income": round(avg_monthly_income),
            "expenses": round(m_expenses),
            "tax": round(calculate_tax(max(avg_monthly_income - (deduction_total/12), 0)))
        })

    return {
        "headline": {
            "title": "Tax command center",
            "subtitle": "Real-time tax planning across income, deductions, expenses, documents, and long-range scenarios.",
            "year": 2026,
        },
        "summary": {
            "totalIncome": income_total,
            "totalDeductions": deduction_total,
            "taxableIncome": taxable_income,
            "estimatedTax": estimated_tax,
            "effectiveTaxRate": round((estimated_tax / income_total) * 100, 1) if income_total else 0,
            "deductibleExpenses": sum(item["amount"] for item in user_expenses if item["deductible"]),
            "documentCoverage": round((len([doc for doc in user_documents if doc["status"] == "processed"]) / len(user_documents)) * 100) if user_documents else 0,
        },
        "monthlyData": monthly_stats,
        "incomeBreakdown": income_breakdown,
        "expenseBreakdown": expense_breakdown,
        "upcomingDeadlines": deadlines,
        "alerts": [
            {
                "title": "Unused deductions detected",
                "description": f"{len(potential)} deductions remain inactive, representing ${potential_amount:,} in additional write-offs.",
                "tone": "warning",
            },
            {
                "title": "Document pipeline healthy",
                "description": f"{len([doc for doc in user_documents if doc['status'] == 'processed'])} of {len(user_documents)} documents have been processed successfully.",
                "tone": "success",
            },
        ],
        "actions": [
            {"title": "Review deductions", "description": f"Unlock about ${round(potential_amount * 0.22):,} in tax savings.", "path": "/app/deductions"},
            {"title": "Reconcile receipts", "description": f"Track ${expense_total:,} in expenses and confirm deductibility.", "path": "/app/expenses"},
            {"title": "Upload missing documents", "description": "Complete the file set before quarter-end filing deadlines.", "path": "/app/documents"},
        ],
        "health": tax_health_check(profile, user_deductions, user_expenses, user_documents),
        "notifications": get_notifications(user_id, deadlines, tax_health_check(profile, user_deductions, user_expenses, user_documents)),
    }


async def deductions_payload(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    user_deductions = await get_user_deductions(db, user_id)
    applied = [item for item in user_deductions if item["applied"]]
    available = [item for item in user_deductions if not item["applied"]]
    available_amount = sum(item["amount"] for item in available)
    profile = await get_user_calculator_profile(db, user_id)

    return {
        "summary": {
            "appliedTotal": sum(item["amount"] for item in applied),
            "availableTotal": available_amount,
            "potentialSavings": round(available_amount * 0.22),
        },
        "items": user_deductions,
        "categories": deduction_categories,
        "recommendations": [
            {
                "title": "Increase 401(k) Contributions",
                "currentAmount": profile["retirement"],
                "recommendedAmount": 18000,
                "potentialSavings": 2200,
                "difficulty": "Easy",
                "reason": "Retirement contributions are still well below the annual ceiling.",
            },
            {
                "title": "Activate Student Loan Interest",
                "currentAmount": profile["studentLoan"],
                "recommendedAmount": 2500,
                "potentialSavings": 550,
                "difficulty": "Easy",
                "reason": "You can claim up to $2,500 of qualified interest with documentation.",
            },
            {
                "title": "Document Charitable Giving",
                "currentAmount": profile["charitable"],
                "recommendedAmount": 1200,
                "potentialSavings": 264,
                "difficulty": "Easy",
                "reason": "Receipts would unlock a direct write-off for documented donations.",
            },
        ],
    }

async def expenses_payload(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    user_expenses = await get_user_expenses(db, user_id)
    total = sum(item["amount"] for item in user_expenses)
    deductible = sum(item["amount"] for item in user_expenses if item["deductible"])
    category_totals: dict[str, float] = {}
    for item in user_expenses:
        category_totals[item["category"]] = category_totals.get(item["category"], 0) + item["amount"]

    return {
        "summary": {
            "totalExpenses": total,
            "deductibleExpenses": deductible,
            "potentialSavings": round(deductible * 0.22),
        },
        "items": user_expenses,
        "categoryBreakdown": [{"name": key, "value": value} for key, value in category_totals.items()],
        "aiSuggestions": [
            "Home Office Equipment appears business-related and is ready for documentation review.",
            "Business Trip expenses should include itinerary notes to secure deductibility.",
            "Professional Course may qualify for education-related deductions if job-relevant.",
        ],
    }


async def documents_payload(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    user_documents = await get_user_documents(db, user_id)
    processed = len([item for item in user_documents if item["status"] == "processed"])
    return {
        "summary": {
            "totalDocuments": len(user_documents),
            "processedDocuments": processed,
            "pendingDocuments": len(user_documents) - processed,
        },
        "items": user_documents,
        "checklist": [
            {"name": "W-2 Forms", "required": True, "uploaded": True, "category": "Income"},
            {"name": "1099 Forms", "required": True, "uploaded": False, "category": "Income"},
            {"name": "Business Expense Receipts", "required": True, "uploaded": True, "category": "Business"},
            {"name": "Medical Expense Receipts", "required": False, "uploaded": True, "category": "Medical"},
            {"name": "Charitable Donation Receipts", "required": False, "uploaded": False, "category": "Charitable"},
        ],
        "categories": ["All", "Income", "Business", "Medical", "Education", "Charitable"],
    }


async def scenarios_payload(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    profile = await get_user_calculator_profile(db, user_id)
    user_deductions = await get_user_deductions(db, user_id)
    user_scenarios = await get_user_scenarios(db, user_id)
    
    income_total = total_income_calc(profile)
    deduction_total = sum(d["amount"] for d in user_deductions if d["applied"])

    quick = []
    for amount in [1000, 5000, 10000, 15000, 20000]:
        tax_now = calculate_tax(max(income_total - deduction_total, 0))
        tax_after = calculate_tax(max(income_total - deduction_total - amount, 0))
        savings = tax_now - tax_after
        quick.append({
            "name": f"${amount:,}",
            "investment": amount,
            "savings": savings,
            "effectiveReturn": round((savings / amount) * 100, 1),
        })
    return {
        "baseIncome": income_total,
        "baseDeductions": deduction_total,
        "savedScenarios": user_scenarios,
        "quickScenarios": quick,
    }


def simulate_scenario_calc(payload: ScenarioSimulationRequest) -> dict:
    base_taxable = max(payload.baseIncome - payload.baseDeductions, 0)
    base_tax = calculate_tax(base_taxable)
    new_taxable = max(payload.baseIncome - payload.baseDeductions - payload.additionalInvestment, 0)
    new_tax = calculate_tax(new_taxable)
    return {
        "baseTax": base_tax,
        "newTax": new_tax,
        "taxSavings": base_tax - new_tax,
        "savingsPercentage": round(((base_tax - new_tax) / base_tax) * 100, 1) if base_tax else 0,
        "comparison": [
            {"name": "Current", "income": payload.baseIncome, "deductions": payload.baseDeductions, "taxableIncome": base_taxable, "tax": base_tax},
            {"name": "Scenario", "income": payload.baseIncome, "deductions": payload.baseDeductions + payload.additionalInvestment, "taxableIncome": new_taxable, "tax": new_tax},
        ],
    }


async def reports_payload(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    # yearly data could also be per user, but for now we'll use demo or store it
    # let's just stick to a derived summary for now
    dash = await dashboard_payload(db, user_id)
    current_year = dash["summary"]
    # fake previous years for now or store in DB
    return {
        "summary": {
            "incomeGrowth": 15.4,
            "taxGrowth": 8.2,
            "deductionGrowth": 12.1,
            "averageEffectiveRate": 16.5,
        },
        "yearlyData": yearly_data,
        "effectiveRates": [{"year": row["year"], "rate": round((row["taxPaid"] / row["totalIncome"]) * 100, 1)} for row in yearly_data],
        "insights": [
            {
                "title": "Positive deduction trend",
                "description": "Deductions are rising year over year, which is keeping your effective rate from climbing as fast as income.",
                "tone": "success",
            },
            {
                "title": "Retirement headroom remains",
                "description": "There is still room to defer more income through retirement contributions to flatten next year’s tax increase.",
                "tone": "opportunity",
            },
            {
                "title": "Quarterly tax pressure is increasing",
                "description": "Freelance and investment income are pushing quarterly reserve needs upward, so cash-flow planning matters more now.",
                "tone": "warning",
            },
        ],
    }


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


# authentication routes
@app.post("/api/auth/register", response_model=UserOut)
async def register(user: UserCreate):
    db = get_db()
    existing = await db["users"].find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = get_password_hash(user.password)
    result = await db["users"].insert_one({"email": user.email, "full_name": user.full_name, "hashed_password": hashed})
    return {"id": str(result.inserted_id), "email": user.email, "full_name": user.full_name}


@app.post("/api/auth/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db()
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=UserOut)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {"id": str(current_user["_id"]), "email": current_user["email"], "full_name": current_user.get("full_name")}


@app.get("/api/auth/google")
async def google_login(request: "Request"):
    redirect_uri = request.url_for("google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get("/api/auth/google/callback")
async def google_callback(request: "Request"):
    token = await oauth.google.authorize_access_token(request)
    user_info = await oauth.google.parse_id_token(request, token)
    # user_info will contain email, name, etc.
    db = get_db()
    user = await db["users"].find_one({"email": user_info["email"]})
    if not user:
        result = await db["users"].insert_one({
            "email": user_info["email"],
            "full_name": user_info.get("name"),
            "hashed_password": "",
        })
        user = await db["users"].find_one({"_id": result.inserted_id})
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user["email"]}, expires_delta=access_token_expires)
    # redirect back to frontend with token in query
    from fastapi.responses import RedirectResponse
    frontend = os.getenv("FRONTEND_URL", "http://localhost:5173")
    return RedirectResponse(f"{frontend}/?token={access_token}")


# endpoint for frontend to check module availability
@app.get("/api/routes")
def get_routes():
    # simple mapping of known modules to boolean (always true since routes exist)
    modules = ["dashboard","calculator","assistant","deductions","expenses","documents","scenarios","reports"]
    return {mod: True for mod in modules}


@app.get("/api/dashboard")
async def get_dashboard(current_user: dict = Depends(get_current_user)) -> dict:
    return await dashboard_payload(get_db(), str(current_user["_id"]))


@app.get("/api/calculator")
async def get_calculator(current_user: dict = Depends(get_current_user)) -> dict:
    return await calculator_result(get_db(), str(current_user["_id"]))


@app.post("/api/calculator/calculate")
async def post_calculator(payload: CalculatorInput, current_user: dict = Depends(get_current_user)) -> dict:
    db = get_db()
    user_id = str(current_user["_id"])
    await db["calculator_profiles"].update_one(
        {"user_id": user_id},
        {"$set": payload.model_dump()},
        upsert=True
    )
    return await calculator_result(db, user_id)


@app.get("/api/assistant")
async def get_assistant(current_user: dict = Depends(get_current_user)) -> dict:
    db = get_db()
    user_id = str(current_user["_id"])
    dash = await dashboard_payload(db, user_id)
    summary = dash["summary"]
    profile = await get_user_calculator_profile(db, user_id)
    return {
        "suggestedQuestions": assistant_suggested_questions,
        "profile": {
            "totalIncome": summary["totalIncome"],
            "estimatedTax": summary["estimatedTax"],
            "effectiveTaxRate": summary["effectiveTaxRate"],
            "filingStatus": profile["filingStatus"],
        },
    }


@app.post("/api/assistant/chat")
async def post_assistant_message(payload: AssistantMessageRequest, current_user: dict = Depends(get_current_user)) -> dict:
    db = get_db()
    user_id = str(current_user["_id"])
    return {
        "message": {
            "id": str(uuid4()),
            "role": "assistant",
            "content": await ai_response(db, user_id, payload.message),
            "timestamp": datetime.utcnow().isoformat(),
        }
    }


@app.get("/api/deductions")
async def get_deductions(current_user: dict = Depends(get_current_user)) -> dict:
    return await deductions_payload(get_db(), str(current_user["_id"]))


@app.patch("/api/deductions/{deduction_id}")
async def patch_deduction(deduction_id: str, payload: DeductionToggleRequest, current_user: dict = Depends(get_current_user)) -> dict:
    db = get_db()
    user_id = str(current_user["_id"])
    await db["deductions"].update_one(
        {"user_id": user_id, "id": deduction_id},
        {"$set": {"applied": payload.applied}}
    )
    # also update calculator profile if it was one of the special ones
    if deduction_id in ["ded-4", "ded-5"]:
        profile = await get_user_calculator_profile(db, user_id)
        deduction = await db["deductions"].find_one({"user_id": user_id, "id": deduction_id})
        field = "studentLoan" if deduction_id == "ded-4" else "charitable"
        await db["calculator_profiles"].update_one(
            {"user_id": user_id},
            {"$set": {field: deduction["amount"] if payload.applied else 0}}
        )
    return await deductions_payload(db, user_id)


@app.get("/api/expenses")
async def get_expenses(current_user: dict = Depends(get_current_user)) -> dict:
    return await expenses_payload(get_db(), str(current_user["_id"]))


@app.post("/api/expenses")
async def create_expense(payload: ExpenseCreateRequest, current_user: dict = Depends(get_current_user)) -> dict:
    db = get_db()
    user_id = str(current_user["_id"])
    deductible = payload.category in {"business", "education", "medical", "insurance", "travel"}
    await db["expenses"].insert_one({
        "user_id": user_id,
        "id": str(uuid4()),
        "category": payload.category,
        "description": payload.description,
        "amount": payload.amount,
        "date": payload.date,
        "deductible": deductible,
    })
    return await expenses_payload(db, user_id)


@app.patch("/api/expenses/{expense_id}")
async def patch_expense(expense_id: str, payload: ExpenseToggleRequest, current_user: dict = Depends(get_current_user)) -> dict:
    db = get_db()
    user_id = str(current_user["_id"])
    await db["expenses"].update_one(
        {"user_id": user_id, "id": expense_id},
        {"$set": {"deductible": payload.deductible}}
    )
    return await expenses_payload(db, user_id)


@app.get("/api/documents")
async def get_documents(current_user: dict = Depends(get_current_user)) -> dict:
    return await documents_payload(get_db(), str(current_user["_id"]))


@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form("Other"),
    current_user: dict = Depends(get_current_user)
) -> dict:
    db = get_db()
    user_id = str(current_user["_id"])
    file_bytes = await file.read()
    size_kb = max(1, round(len(file_bytes) / 1024))
    inferred_amount = 500 + (size_kb % 20) * 75
    await db["documents"].insert_one({
        "user_id": user_id,
        "id": str(uuid4()),
        "name": file.filename,
        "type": "PDF" if file.filename.lower().endswith(".pdf") else "Image",
        "category": category,
        "size": f"{size_kb} KB",
        "uploadDate": date.today().isoformat(),
        "status": "processed",
        "extractedData": {
            "amount": inferred_amount,
            "date": date.today().isoformat(),
            "vendor": file.filename.rsplit(".", 1)[0].replace("_", " ").title(),
        },
    })
    return await documents_payload(db, user_id)


@app.delete("/api/documents/{document_id}")
async def delete_document(document_id: str, current_user: dict = Depends(get_current_user)) -> dict:
    db = get_db()
    user_id = str(current_user["_id"])
    await db["documents"].delete_one({"user_id": user_id, "id": document_id})
    return await documents_payload(db, user_id)


@app.get("/api/scenarios")
async def get_scenarios(current_user: dict = Depends(get_current_user)) -> dict:
    db = get_db()
    user_id = str(current_user["_id"])
    payload = await scenarios_payload(db, user_id)
    payload["simulation"] = simulate_scenario_calc(
        ScenarioSimulationRequest(
            baseIncome=payload["baseIncome"],
            baseDeductions=payload["baseDeductions"],
            additionalInvestment=0,
        )
    )
    return payload


@app.post("/api/scenarios/simulate")
async def post_scenarios_simulate(payload: ScenarioSimulationRequest, current_user: dict = Depends(get_current_user)) -> dict:
    return simulate_scenario_calc(payload)


@app.post("/api/scenarios/save")
async def post_scenarios_save(payload: ScenarioSaveRequest, current_user: dict = Depends(get_current_user)) -> dict:
    db = get_db()
    user_id = str(current_user["_id"])
    await db["scenarios"].insert_one({
        "user_id": user_id,
        "id": str(uuid4()),
        **payload.model_dump(),
    })
    return await scenarios_payload(db, user_id)


@app.get("/api/reports")
async def get_reports(current_user: dict = Depends(get_current_user)) -> dict:
    return await reports_payload(get_db(), str(current_user["_id"]))
