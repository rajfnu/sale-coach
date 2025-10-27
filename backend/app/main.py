from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import cost_calculator_v2

app = FastAPI(
    title="Sales AI Agent API",
    description="Backend API for Sales AI Agent - AI-Powered Sales Coach",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(cost_calculator_v2.router, prefix="/api/cost", tags=["Cost Calculator"])

@app.get("/")
async def root():
    return {
        "message": "Sales AI Agent API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
