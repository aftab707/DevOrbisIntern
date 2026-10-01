from database.supabase_client import supabase


def seed_demo_clients():
    """Idempotently insert the sample client records used by the demo."""
    demo_clients = [
        {"name": "Acme Corp", "status": "Active", "balance": 5000, "email": "contact@acmecorp.com"},
        {"name": "Globex", "status": "Pending", "balance": 1500, "email": "billing@globex.com"},
        {"name": "Soylent", "status": "Overdue", "balance": 12000, "email": "accounts@soylent.com"},
    ]
    return supabase.table("clients").upsert(demo_clients, on_conflict="name").execute()
