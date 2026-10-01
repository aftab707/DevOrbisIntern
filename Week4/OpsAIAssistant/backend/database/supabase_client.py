import os
from dotenv import load_dotenv
from supabase import create_client, Client
from supabase.lib.client_options import SyncClientOptions

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env")

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY,
    options=SyncClientOptions(postgrest_client_timeout=20),
)
