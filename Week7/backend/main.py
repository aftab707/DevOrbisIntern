
import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
import httpx

load_dotenv()

app = FastAPI(title="AI Receptionist API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Initialization
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://your-project-url.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "your-anon-key")

try:
    # Initialize only if keys are present (prevents crash on startup without env vars)
    if SUPABASE_URL != "https://your-project-url.supabase.co":
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    else:
        supabase = None
except Exception as e:
    print(f"Error initializing Supabase client: {e}")
    supabase = None

@app.get("/")
def read_root():
    return {"message": "AI Receptionist API is running"}

@app.get("/api/appointments")
def get_appointments():
    """
    Fetch all appointments from Supabase for the frontend dashboard.
    """
    if not supabase:
        # Return empty list or error if not connected
        return []
    
    try:
        # Fetching all appointments, ordered by date
        response = supabase.table("appointments").select("*").order("appointment_date", desc=False).execute()
        return response.data
    except Exception as e:
        print(f"Error fetching appointments: {e}")
        return []

@app.post("/webhook/book-appointment")
async def book_appointment(req: Request):
    """
    Webhook endpoint to receive POST requests from Vapi and Retell AI during a call.
    """
    try:
        data = await req.json()
        print("Received payload for booking:", data)
        
        # Check if it's Vapi payload
        message = data.get("message", {})
        tool_call_list = message.get("toolWithToolCallList", [])
        
        if tool_call_list and len(tool_call_list) > 0:
            # Vapi Parsing
            tool_call = tool_call_list[0].get("toolCall", {})
            arguments = tool_call.get("function", {}).get("arguments", {})
            call_id = tool_call.get("id", "unknown")
            
            name = arguments.get("name", "Unknown Caller")
            phone = arguments.get("phone", "Unknown")
            date = arguments.get("date")
            time = arguments.get("time")
        else:
            # Retell AI Parsing or Fallback
            args = data.get("args", data)
            call_id = data.get("call_id", "unknown-retell-call")
            
            name = args.get("name", "Unknown Caller")
            phone = args.get("phone", "Unknown")
            date = args.get("date")
            time = args.get("time")

        appointment_data = {
            "name": name,
            "phone_number": phone,
            "appointment_date": date,
            "appointment_time": time,
            "status": "booked"
        }
        
        if supabase:
            supabase.table("appointments").insert(appointment_data).execute()
            print("Successfully inserted into Supabase:", appointment_data)
        
        # We return a generic success message. Retell will read the "message" key, Vapi uses the "results" array.
        return {
            "message": f"Appointment successfully booked for {name} on {date} at {time}.",
            "results": [
                {
                    "toolCallId": call_id,
                    "result": f"Appointment successfully booked for {name} on {date} at {time}."
                }
            ]
        }
    except Exception as e:
        print(f"Error processing webhook: {e}")
        return {"error": str(e)}

@app.post("/webhook/vapi-events")
async def vapi_events(req: Request):
    """
    Webhook endpoint to receive post-call events from BOTH Vapi and Retell AI.
    It standardizes the data and forwards it to n8n.
    """
    try:
        data = await req.json()
        print("Received Webhook Event:", data.get("event") or data.get("message", {}).get("type"))
        
        message_type = data.get("message", {}).get("type")
        event = data.get("event")
        
        # Use the production 'webhook' URL
        n8n_url = "http://localhost:5678/webhook/421bf9c1-d65d-4580-aa02-b6135131cd17"
        
        if message_type == "end-of-call-report":
            # It's a Vapi Event (UNTouched - Works Perfectly)
            print("Received end-of-call report from Vapi, forwarding to n8n...")
            async with httpx.AsyncClient() as client:
                try:
                    response = await client.post(n8n_url, json=data, timeout=10.0)
                    print(f"Forwarded Vapi event to n8n. Status Code: {response.status_code}")
                except Exception as ex:
                    print(f"n8n not listening or error: {ex}")
                    
        elif event in ["call_analyzed", "call_ended"]:
            # It's a Retell AI Event (FIXED)
            print(f"Received {event} event from Retell, checking for transcript...")
            
            # Retell sends data inside the "call" object
            call_data = data.get("call", {})
            transcript = call_data.get("transcript")
            
            if transcript:
                print("Transcript found! Standardizing and forwarding to n8n...")
                
                # Extract summary from call_analysis
                call_analysis = call_data.get("call_analysis", {})
                summary = call_analysis.get("call_summary", "")
                
                # Map to Vapi format for n8n so n8n doesn't break
                vapi_style_payload = {
                    "message": {
                        "type": "end-of-call-report",
                        "artifact": {
                            "transcript": transcript,
                            "summary": summary
                        }
                    }
                }
                
                async with httpx.AsyncClient() as client:
                    try:
                        response = await client.post(n8n_url, json=vapi_style_payload, timeout=10.0)
                        print(f"Forwarded Retell event to n8n. Status Code: {response.status_code}")
                    except Exception as ex:
                        print(f"n8n not listening or error: {ex}")
            else:
                print("No transcript in this Retell event. Waiting for call_analyzed event.")
                
        return {"status": "success"}
    except Exception as e:
        print(f"Error forwarding event: {e}")
        return {"error": str(e)}