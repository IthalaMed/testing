from fastapi import FastAPI
from .routers import patients
app = FastAPI(title="IthalaMed Patient Service (FastAPI)")
app.include_router(patients.router, prefix="/api/v1")
