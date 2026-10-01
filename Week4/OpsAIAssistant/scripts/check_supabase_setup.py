import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client


ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / "backend" / ".env")
client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])

for table_name in ("clients", "documents"):
    try:
        count = client.table(table_name).select("id", count="exact").limit(1).execute().count
        print(f"{table_name}: reachable, {count or 0} rows")
    except Exception as exc:
        print(f"{table_name}: check failed ({type(exc).__name__}, code={getattr(exc, 'code', 'n/a')})")

try:
    client.rpc("match_documents", {"query_embedding": [0.0] * 384, "match_threshold": 0.0, "match_count": 1}).execute()
    print("match_documents: available")
except Exception as exc:
    print(f"match_documents: unavailable ({type(exc).__name__}, code={getattr(exc, 'code', 'n/a')})")
