from __future__ import annotations

from copy import deepcopy
from datetime import date, datetime
from typing import Literal
from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel

from typing import Optional
import os

# database
from .db import get_db, object_id
from motor.motor_asyncio import AsyncIOMotorDatabase

# auth helpers
from passlib.context import CryptContext
from jose import JWTError, jwt
from authlib.integrations.starlette_client import OAuth


app = FastAPI(title="TaxGPT API", version="1.0.0")

# auth configuration
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
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
    "How can I reduce my tax bill this quarter?",
    "What deductions am I still missing?",
    "How much should I set aside for freelance taxes?",
    "What documents are still missing?",
    "Show me a tax-saving investment strategy.",
]



# authentication helpers

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> Optional[dict]:
    return db["users"].find_one({"email": email})


def authenticate_user(db: AsyncIOMotorDatabase, email: str, password: str) -> Optional[dict]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.get("hashed_password", "")):
        return None
    return user


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
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
    user = get_user_by_email(get_db(), token_data.email)
    if user is None:
        raise credentials_exception
    return user


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


def sync_deductions_from_profile() -> None:
    mapping = {
        "Standard Deduction": calculator_profile["standard"],
        "Retirement Contribution": calculator_profile["retirement"],
        "Health Savings Account": calculator_profile["hsa"],
        "Student Loan Interest": max(calculator_profile["studentLoan"], 2500 if any(d["id"] == "ded-4" and d["applied"] for d in deductions) else calculator_profile["studentLoan"]),
        "Charitable Contributions": max(calculator_profile["charitable"], 1200 if any(d["id"] == "ded-5" and d["applied"] for d in deductions) else calculator_profile["charitable"]),
    }
    for item in deductions:
        if item["type"] in mapping:
            amount = mapping[item["type"]]
            item["amount"] = amount if amount > 0 else item["amount"]
            if item["type"] in {"Student Loan Interest", "Charitable Contributions"}:
                item["applied"] = amount > 0 if item["id"] in {"ded-4", "ded-5"} else item["applied"]


def total_income() -> float:
    return calculator_profile["salary"] + calculator_profile["freelance"] + calculator_profile["business"] + calculator_profile["investment"]


def income_sources() -> list[dict]:
    return [
        {"id": "inc-1", "type": "salary", "description": "Annual Salary", "amount": calculator_profile["salary"], "year": 2026},
        {"id": "inc-2", "type": "freelance", "description": "Consulting Work", "amount": calculator_profile["freelance"], "year": 2026},
        {"id": "inc-3", "type": "business", "description": "Business Revenue", "amount": calculator_profile["business"], "year": 2026},
        {"id": "inc-4", "type": "investment", "description": "Dividend Income", "amount": calculator_profile["investment"], "year": 2026},
    ]


def applied_deductions_total() -> float:
    return sum(item["amount"] for item in deductions if item["applied"])


def deductible_expense_total() -> float:
    return sum(item["amount"] for item in expenses if item["deductible"])


def calculator_result() -> dict:
    sync_deductions_from_profile()
    income_total = total_income()
    deduction_total = sum(
        [
            calculator_profile["standard"],
            calculator_profile["retirement"],
            calculator_profile["hsa"],
            calculator_profile["studentLoan"],
            calculator_profile["charitable"],
        ]
    )
    taxable_income = max(income_total - deduction_total, 0)
    estimated_tax = calculate_tax(taxable_income)
    marginal_rate = "24%" if taxable_income > 95375 else "22%" if taxable_income > 44725 else "12%" if taxable_income > 11000 else "10%"
    return {
        "input": deepcopy(calculator_profile),
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


def ai_response(message: str) -> str:
    lowered = message.lower()
    total = total_income()
    deduction_total = applied_deductions_total()
    tax_total = calculate_tax(max(total - deduction_total, 0))
    if "reduce" in lowered and "tax" in lowered:
        return (
            "To lower your tax bill quickly, focus on three levers: max out retirement, capture every deductible expense, "
            "and document charitable giving. Based on your current profile, increasing retirement contributions by $10,000 "
            f"would likely save about $2,200, while activating your unused deductions could trim another ${round(sum(d['amount'] for d in deductions if not d['applied']) * 0.22):,}."
        )
    if "deduction" in lowered:
        available = [item for item in deductions if not item["applied"]]
        lines = [f"- {item['type']}: ${item['amount']:,}" for item in available]
        return "Here are the main deductions you still have available:\n\n" + "\n".join(lines)
    if "freelance" in lowered or "self-employed" in lowered:
        freelance_tax = round(calculator_profile["freelance"] * 0.153)
        return (
            "For freelance income, keep a separate tax reserve and make quarterly payments. "
            f"With your current freelance income, self-employment tax is roughly ${freelance_tax:,}."
        )
    if "document" in lowered or "receipt" in lowered:
        pending = [doc["name"] for doc in documents if doc["status"] != "processed"]
        return "These documents still need attention: " + ", ".join(pending)
    return (
        f"Your current estimate shows ${tax_total:,} in tax on ${total:,} of income. "
        "I can help you optimize deductions, review deadlines, or model a scenario if you want to go deeper."
    )


def dashboard_payload() -> dict:
    income_total = total_income()
    deduction_total = applied_deductions_total()
    taxable_income = max(income_total - deduction_total, 0)
    estimated_tax = calculate_tax(taxable_income)
    expense_total = sum(item["amount"] for item in expenses)
    potential = [item for item in deductions if not item["applied"]]
    potential_amount = sum(item["amount"] for item in potential)

    income_breakdown = [
        {"name": item["type"], "value": item["amount"]}
        for item in income_sources()
        if item["amount"] > 0
    ]

    category_totals: dict[str, float] = {}
    for item in expenses:
        category_totals[item["category"]] = category_totals.get(item["category"], 0) + item["amount"]

    expense_breakdown = [{"category": key, "amount": value} for key, value in category_totals.items()]

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
            "deductibleExpenses": deductible_expense_total(),
            "documentCoverage": round((len([doc for doc in documents if doc["status"] == "processed"]) / len(documents)) * 100) if documents else 0,
        },
        "monthlyData": [
            {"month": "Jan", "income": 8200, "expenses": 780, "tax": 1100},
            {"month": "Feb", "income": 7800, "expenses": 650, "tax": 1050},
            {"month": "Mar", "income": 8500, "expenses": 920, "tax": 1150},
            {"month": "Apr", "income": 9200, "expenses": 540, "tax": 1250},
            {"month": "May", "income": 7600, "expenses": 890, "tax": 1020},
            {"month": "Jun", "income": 8100, "expenses": 710, "tax": 1090},
        ],
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
                "description": f"{len([doc for doc in documents if doc['status'] == 'processed'])} of {len(documents)} documents have been processed successfully.",
                "tone": "success",
            },
        ],
        "actions": [
            {"title": "Review deductions", "description": f"Unlock about ${round(potential_amount * 0.22):,} in tax savings.", "path": "/deductions"},
            {"title": "Reconcile receipts", "description": f"Track ${expense_total:,} in expenses and confirm deductibility.", "path": "/expenses"},
            {"title": "Upload missing documents", "description": "Complete the file set before quarter-end filing deadlines.", "path": "/documents"},
        ],
    }


def deductions_payload() -> dict:
    applied = [item for item in deductions if item["applied"]]
    available = [item for item in deductions if not item["applied"]]
    available_amount = sum(item["amount"] for item in available)
    return {
        "summary": {
            "appliedTotal": sum(item["amount"] for item in applied),
            "availableTotal": available_amount,
            "potentialSavings": round(available_amount * 0.22),
        },
        "items": deepcopy(deductions),
        "categories": deduction_categories,
        "recommendations": [
            {
                "title": "Increase 401(k) Contributions",
                "currentAmount": calculator_profile["retirement"],
                "recommendedAmount": 18000,
                "potentialSavings": 2200,
                "difficulty": "Easy",
                "reason": "Retirement contributions are still well below the annual ceiling.",
            },
            {
                "title": "Activate Student Loan Interest",
                "currentAmount": calculator_profile["studentLoan"],
                "recommendedAmount": 2500,
                "potentialSavings": 550,
                "difficulty": "Easy",
                "reason": "You can claim up to $2,500 of qualified interest with documentation.",
            },
            {
                "title": "Document Charitable Giving",
                "currentAmount": calculator_profile["charitable"],
                "recommendedAmount": 1200,
                "potentialSavings": 264,
                "difficulty": "Easy",
                "reason": "Receipts would unlock a direct write-off for documented donations.",
            },
        ],
    }


def expenses_payload() -> dict:
    total = sum(item["amount"] for item in expenses)
    deductible = deductible_expense_total()
    category_totals: dict[str, float] = {}
    for item in expenses:
        category_totals[item["category"]] = category_totals.get(item["category"], 0) + item["amount"]

    return {
        "summary": {
            "totalExpenses": total,
            "deductibleExpenses": deductible,
            "potentialSavings": round(deductible * 0.22),
        },
        "items": deepcopy(expenses),
        "categoryBreakdown": [{"name": key, "value": value} for key, value in category_totals.items()],
        "aiSuggestions": [
            "Home Office Equipment appears business-related and is ready for documentation review.",
            "Business Trip expenses should include itinerary notes to secure deductibility.",
            "Professional Course may qualify for education-related deductions if job-relevant.",
        ],
    }


def documents_payload() -> dict:
    processed = len([item for item in documents if item["status"] == "processed"])
    return {
        "summary": {
            "totalDocuments": len(documents),
            "processedDocuments": processed,
            "pendingDocuments": len(documents) - processed,
        },
        "items": deepcopy(documents),
        "checklist": [
            {"name": "W-2 Forms", "required": True, "uploaded": True, "category": "Income"},
            {"name": "1099 Forms", "required": True, "uploaded": False, "category": "Income"},
            {"name": "Business Expense Receipts", "required": True, "uploaded": True, "category": "Business"},
            {"name": "Medical Expense Receipts", "required": False, "uploaded": True, "category": "Medical"},
            {"name": "Charitable Donation Receipts", "required": False, "uploaded": False, "category": "Charitable"},
        ],
        "categories": ["All", "Income", "Business", "Medical", "Education", "Charitable"],
    }


def scenarios_payload() -> dict:
    base = dashboard_payload()["summary"]
    quick = []
    for amount in [1000, 5000, 10000, 15000, 20000]:
        tax_now = calculate_tax(max(base["totalIncome"] - base["totalDeductions"], 0))
        tax_after = calculate_tax(max(base["totalIncome"] - base["totalDeductions"] - amount, 0))
        savings = tax_now - tax_after
        quick.append({
            "name": f"${amount:,}",
            "investment": amount,
            "savings": savings,
            "effectiveReturn": round((savings / amount) * 100, 1),
        })
    return {
        "baseIncome": base["totalIncome"],
        "baseDeductions": base["totalDeductions"],
        "savedScenarios": deepcopy(scenarios),
        "quickScenarios": quick,
    }


def simulate_scenario(payload: ScenarioSimulationRequest) -> dict:
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


def reports_payload() -> dict:
    current = yearly_data[-1]
    previous = yearly_data[-2]
    effective_rates = [{"year": row["year"], "rate": round((row["taxPaid"] / row["totalIncome"]) * 100, 1)} for row in yearly_data]
    return {
        "summary": {
            "incomeGrowth": round(((current["totalIncome"] - previous["totalIncome"]) / previous["totalIncome"]) * 100, 1),
            "taxGrowth": round(((current["taxPaid"] - previous["taxPaid"]) / previous["taxPaid"]) * 100, 1),
            "deductionGrowth": round(((current["totalDeductions"] - previous["totalDeductions"]) / previous["totalDeductions"]) * 100, 1),
            "averageEffectiveRate": round(sum(item["rate"] for item in effective_rates) / len(effective_rates), 1),
        },
        "yearlyData": deepcopy(yearly_data),
        "effectiveRates": effective_rates,
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
    user = authenticate_user(db, form_data.username, form_data.password)
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
def google_login(request: "Request"):
    redirect_uri = request.url_for("google_callback")
    return oauth.google.authorize_redirect(request, redirect_uri)


@app.route("/api/auth/google/callback")
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
    return {"access_token": access_token, "token_type": "bearer"}


# endpoint for frontend to check module availability
@app.get("/api/routes")
def get_routes():
    # simple mapping of known modules to boolean (always true since routes exist)
    modules = ["dashboard","calculator","assistant","deductions","expenses","documents","scenarios","reports"]
    return {mod: True for mod in modules}


@app.get("/api/dashboard")
def get_dashboard() -> dict:
    return dashboard_payload()


@app.get("/api/calculator")
def get_calculator() -> dict:
    return calculator_result()


@app.post("/api/calculator/calculate")
def post_calculator(payload: CalculatorInput) -> dict:
    calculator_profile.update(payload.model_dump())
    sync_deductions_from_profile()
    return calculator_result()


@app.get("/api/assistant")
def get_assistant() -> dict:
    summary = dashboard_payload()["summary"]
    return {
        "suggestedQuestions": assistant_suggested_questions,
        "profile": {
            "totalIncome": summary["totalIncome"],
            "estimatedTax": summary["estimatedTax"],
            "effectiveTaxRate": summary["effectiveTaxRate"],
            "filingStatus": calculator_profile["filingStatus"],
        },
    }


@app.post("/api/assistant/chat")
def post_assistant_message(payload: AssistantMessageRequest) -> dict:
    return {
        "message": {
            "id": str(uuid4()),
            "role": "assistant",
            "content": ai_response(payload.message),
            "timestamp": datetime.utcnow().isoformat(),
        }
    }


@app.get("/api/deductions")
def get_deductions() -> dict:
    return deductions_payload()


@app.patch("/api/deductions/{deduction_id}")
def patch_deduction(deduction_id: str, payload: DeductionToggleRequest) -> dict:
    for item in deductions:
        if item["id"] == deduction_id:
            item["applied"] = payload.applied
            if deduction_id == "ded-4":
                calculator_profile["studentLoan"] = item["amount"] if payload.applied else 0
            if deduction_id == "ded-5":
                calculator_profile["charitable"] = item["amount"] if payload.applied else 0
            return deductions_payload()
    raise HTTPException(status_code=404, detail="Deduction not found")


@app.get("/api/expenses")
def get_expenses() -> dict:
    return expenses_payload()


@app.post("/api/expenses")
def create_expense(payload: ExpenseCreateRequest) -> dict:
    deductible = payload.category in {"business", "education", "medical", "insurance", "travel"}
    expenses.insert(
        0,
        {
            "id": str(uuid4()),
            "category": payload.category,
            "description": payload.description,
            "amount": payload.amount,
            "date": payload.date,
            "deductible": deductible,
        },
    )
    return expenses_payload()


@app.patch("/api/expenses/{expense_id}")
def patch_expense(expense_id: str, payload: ExpenseToggleRequest) -> dict:
    for item in expenses:
        if item["id"] == expense_id:
            item["deductible"] = payload.deductible
            return expenses_payload()
    raise HTTPException(status_code=404, detail="Expense not found")


@app.get("/api/documents")
def get_documents() -> dict:
    return documents_payload()


@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form("Other"),
) -> dict:
    file_bytes = await file.read()
    size_kb = max(1, round(len(file_bytes) / 1024))
    inferred_amount = 500 + (size_kb % 20) * 75
    documents.insert(
        0,
        {
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
        },
    )
    return documents_payload()


@app.delete("/api/documents/{document_id}")
def delete_document(document_id: str) -> dict:
    global documents
    documents = [item for item in documents if item["id"] != document_id]
    return documents_payload()


@app.get("/api/scenarios")
def get_scenarios() -> dict:
    payload = scenarios_payload()
    payload["simulation"] = simulate_scenario(
        ScenarioSimulationRequest(
            baseIncome=payload["baseIncome"],
            baseDeductions=payload["baseDeductions"],
            additionalInvestment=0,
        )
    )
    return payload


@app.post("/api/scenarios/simulate")
def post_scenarios_simulate(payload: ScenarioSimulationRequest) -> dict:
    return simulate_scenario(payload)


@app.post("/api/scenarios/save")
def post_scenarios_save(payload: ScenarioSaveRequest) -> dict:
    scenarios.insert(
        0,
        {
            "id": str(uuid4()),
            **payload.model_dump(),
        },
    )
    return scenarios_payload()


@app.get("/api/reports")
def get_reports() -> dict:
    return reports_payload()