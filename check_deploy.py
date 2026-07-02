import urllib.request
import json
import ssl
import time

API_KEY = "rnd_TLc4DVabFld0qD1rEniV5fcSEvT5"
SERVICE_ID = "srv-d90f88n7f7vs73ck4qng"
DEPLOY_ID = "dep-d90m3m647okc73fa907g"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json"
}

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def get_deploy_status():
    req = urllib.request.Request(
        f"https://api.render.com/v1/services/{SERVICE_ID}/deploys/{DEPLOY_ID}",
        headers=HEADERS
    )
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            res = json.loads(response.read().decode('utf-8'))
            return res.get("status")
    except Exception as e:
        print(f"Error checking status: {e}")
        return None

print("Checking deploy status...")
for i in range(12):  # Check for 3 minutes (12 * 15s)
    status = get_deploy_status()
    print(f"Status: {status}")
    if status in ["live", "failed", "canceled"]:
        break
    time.sleep(15)
