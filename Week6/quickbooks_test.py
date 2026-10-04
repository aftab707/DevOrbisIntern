import requests
import json

# 1. Your Sandbox Company ID (Realm ID)
realm_id = "9341458339114201"

# 2. The QuickBooks Sandbox Base URL for queries
url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{realm_id}/query"

# 3. Paste the Access Token you generated in the OAuth 2.0 Playground
access_token = "eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwieC5vcmciOiJIMCJ9..PYimKrYEKv72dHQS4z7-qg.qf2yQjvNKgiFKSGf15xuFYVfb7FEV3C0VPBk_Kufw8JH98FL65bg8k9uNbEW7FkMNqN55mrjy92eugZiEA102hTflGckuSelGdlqiR4f4rxwVuyALuhnVrTbLvSqC82kNQ0nQ_H_5Pcm6ZsfT8bJBs-QefYZvCWioTi-iedg5A5tCs3gpNMHCeH9rRUFC6jUqHWEN21JjFz536hSnj_pylLGoAQml0lQjJaE5cEjP1k6v_1m5DCH5Tm8ZZHIj3N5kkz-BXBRJv8tVY985ekvqUr56V37h_9_8gV2yZwxTxp3yxUtx9q98bJSKlbeO79_R2F3NygeRiYNbAMPXhKoTMuAm4SVVfxwsmxSsZRq4WUa-epjs0-1_hJcWICnG8pC9QWuuHBiC35DnpctT5PbcUAqie5qWENgg26KwexfUvIc-awfVbUuUB_S4W6jlYAZxO0HO-mnVciAG-H9oaFZmLOz7N8XUyV1crmZDq88Bv0.pbbIt5sgfVuJKlbHYCyqvg"

# 4. Set up the headers for Bearer token authentication
headers = {
    "Authorization": f"Bearer {access_token}",
    "Accept": "application/json"
}

# 5. Write the SQL-like query to fetch all invoices
# Adding minorversion ensures you get the latest API schema
params = {
    "query": "SELECT * FROM Invoice",
    "minorversion": "75"
}

# 6. Send the GET request
print("Fetching invoices from QuickBooks Sandbox...")
response = requests.get(url, headers=headers, params=params)

# 7. Print the results
if response.status_code == 200:
    print("Success! Here is your invoice data:")
    data = response.json()
    print(json.dumps(data, indent=2))
else:
    print(f"Failed to fetch data. Status Code: {response.status_code}")
    print(response.text)