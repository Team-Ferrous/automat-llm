from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import main  # Ensure this is the main.py above

app = FastAPI()

origins = [
    "http://localhost:8000",
    "http://localhost:5173",

]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # This runs the initialization once when the server starts
    main.initialize_system()

@app.on_event("shutdown")
def shutdown_event():
    if main.client:
        main.client.close()

@app.get("/chat")
def chat_endpoint(user_input: str):
    # This now uses the pre-initialized rag_chain
    result = main.chat_once(user_input)
    return {"response": result}