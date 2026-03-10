import asyncio
from backend.main import register, UserCreate, get_db

async def run():
    try:
        result = await register(UserCreate(email="test@example.com", full_name="Test User", password="secret"))
        print("result", result)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(run())
