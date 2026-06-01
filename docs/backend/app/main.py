from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import mock, proxy

app = FastAPI(title="BusyBuddy Docs API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(mock.router, prefix="/mock")
app.include_router(proxy.router, prefix="/proxy")
