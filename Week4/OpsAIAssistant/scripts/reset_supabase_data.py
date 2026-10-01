import argparse
import os
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv
from supabase import create_client


ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / "backend" / ".env")


def main():
    parser = argparse.ArgumentParser(description="Delete rows from this app's clients and documents tables.")
    parser.add_argument("--confirm-project-ref", required=True, help="Must exactly match the Supabase project ref in the configured URL.")
    args = parser.parse_args()

    url = os.environ.get("SUPABASE_URL", "")
    project_ref = urlparse(url).hostname.split(".")[0] if urlparse(url).hostname else ""
    if not project_ref or args.confirm_project_ref != project_ref:
        raise SystemExit("Project ref did not match SUPABASE_URL; no rows were deleted.")

    client = create_client(url, os.environ["SUPABASE_KEY"])
    for table_name in ("documents", "clients"):
        before = client.table(table_name).select("id", count="exact").limit(1).execute().count or 0
        if before:
            client.table(table_name).delete().not_.is_("id", "null").execute()
        after = client.table(table_name).select("id", count="exact").limit(1).execute().count or 0
        print(f"{table_name}: {before} rows before, {after} after")
        if after:
            raise SystemExit(f"Could not empty {table_name}; check the backend service-role key and table policies.")


if __name__ == "__main__":
    main()
