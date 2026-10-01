import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client


ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / "backend" / ".env")
client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])

for columns in ("id,content,metadata,embedding", "id,source,page,chunk_index,content_hash"):
    try:
        client.table("documents").select(columns).limit(1).execute()
        print(f"{columns}: available")
    except Exception as exc:
        print(f"{columns}: unavailable ({type(exc).__name__}: {exc})")
