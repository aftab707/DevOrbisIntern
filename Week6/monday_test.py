import requests
import json

# 1. Define the Monday.com API endpoint
url = "https://api.monday.com/v2"

# 2. Replace 'YOUR_TOKEN_HERE' with the token you copied from the Developer Center
headers = {
    "Authorization": "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjcwOTYyODA0NiwiYWFpIjoxMSwidWlkIjoxMTgyNjgyMjUsImlhZCI6IjIwMjYtMTAtMDFUMDk6MjY6MjIuMDAwWiIsInBlciI6Im1lOndyaXRlIiwiYWN0aWQiOjM3MTQ2OTk4LCJyZ24iOiJhcHNlMiJ9.q9vUGoNZ3nrIZP7GdG-Jd9tK-lgYuEZsmQbxmGO6B6o",
    "Content-Type": "application/json"
}

# 3. Define the GraphQL mutation to create a new row
# We are using the Board ID 5031666668 from your "Hiring Pipeline" board
# for creating new item
query = """
mutation {
  create_item(board_id: 5031666668, item_name: "Salar Khan - Score:7") {
    id
  }
}
"""

# Query for update any exsisting item
# query = """
# mutation {
#   change_simple_column_value(
#     board_id: 5031666668, 
#     item_id: 2872344975, 
#     column_id: "name", 
#     value: "Salar Khan - Score: 8"
#   ) {
#     id
#   }
# }
# """

# 4. Package the query into a JSON payload
data = {
    "query": query
}

# 5. Send the POST request to Monday.com
print("Sending request to Monday.com...")
response = requests.post(url, headers=headers, json=data)

# 6. Check the result and print the response
if response.status_code == 200:
    print("Success! Here is the response from the server:")
    # json.dumps with indent=2 makes the output easy to read
    print(json.dumps(response.json(), indent=2))
else:
    print(f"Request failed with status code {response.status_code}")
    print(response.text)