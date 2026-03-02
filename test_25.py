import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# The list showed "models/gemini-2.5-flash"
model = "gemini-2.5-flash"
url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

payload = {
    "contents": [{"parts": [{"text": "Hello, are you working?"}]}]
}

try:
    print(f"Testing URL: {url}")
    response = requests.post(url, json=payload, timeout=15)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Response:", response.json().get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text"))
    else:
        print("Error:", response.text)
except Exception as e:
    print("Exception:", e)
