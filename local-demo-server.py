import json
import os
import secrets
from datetime import date
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "assets" / "data" / "demo-applications.json"
HOST = "127.0.0.1"
PORT = int(os.environ.get("PORT", "8766"))
MAX_REQUEST_BYTES = 16_384


class DemoRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_api_error(self, status, message):
        self.send_json(status, {"error": message})

    def do_GET(self):
        if urlparse(self.path).path == "/api/demo-applications":
            try:
                data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError) as error:
                self.send_api_error(500, "Demo JSON could not be read: " + str(error))
                return
            self.send_json(200, data)
            return
        super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path != "/api/demo-applications":
            self.send_error(404)
            return
        if self.headers.get("Origin") != "http://" + self.headers.get("Host", ""):
            self.send_api_error(403, "Requests must come from this local demo site")
            return
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_api_error(400, "Invalid content length")
            return
        if content_length <= 0 or content_length > MAX_REQUEST_BYTES:
            self.send_api_error(413, "Request body is missing or too large")
            return
        try:
            payload = json.loads(self.rfile.read(content_length))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_api_error(400, "Invalid JSON request body")
            return
        if not isinstance(payload, dict):
            self.send_api_error(400, "Expected an application object")
            return

        fields = {
            "applicantName": (120, True),
            "applicationType": (120, True),
            "applicationTypeCode": (10, True),
            "referenceNumber": (20, True),
            "dateOfBirth": (50, True),
            "passportNumber": (14, True),
            "passportCountryCode": (3, True),
            "passportCountry": (100, True),
        }
        for field, (max_length, required) in fields.items():
            value = payload.get(field)
            if not isinstance(value, str) or (required and not value.strip()) or len(value) > max_length:
                self.send_api_error(400, "Invalid " + field)
                return
        if payload["applicationTypeCode"] != "1":
            self.send_api_error(400, "Unsupported application type")
            return
        try:
            application_date = date.fromisoformat(payload["dateOfBirth"].strip())
        except ValueError:
            self.send_api_error(400, "Enter a valid date of birth.")
            return

        try:
            data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
            if not isinstance(data.get("applications"), list):
                raise ValueError("the applications list is missing")

            reference = payload["referenceNumber"].strip()
            existing = next(
                (
                    item
                    for item in data["applications"]
                    if item.get("referenceNumber", "").casefold() == reference.casefold()
                    and item.get("applicationTypeCode") == payload["applicationTypeCode"]
                ),
                None,
            )
            record_id = existing["id"] if existing else "local-demo-" + secrets.token_hex(6)
            application_id = "LOCAL-DEMO-" + secrets.token_hex(4).upper()
            transaction_reference = "LOCAL-DEMO-" + secrets.token_hex(4).upper()
            formatted_birth_date = "{} {} {}".format(
                application_date.day,
                application_date.strftime("%B"),
                application_date.year,
            )
            formatted_application_date = date.today().strftime("%d %B %Y")
            applicant_name = payload["applicantName"].strip()
            passport_number = payload["passportNumber"].strip()
            passport_country = payload["passportCountry"].strip()
            record = {
                "id": record_id,
                "applicantName": applicant_name,
                "dateOfBirth": formatted_birth_date,
                "applicationType": payload["applicationType"].strip(),
                "status": "Local demo record — not submitted",
                "referenceNumber": reference,
                "applicationId": application_id,
                "transactionReference": transaction_reference,
                "dateOfApplication": formatted_application_date,
                "applicationTypeCode": payload["applicationTypeCode"],
                "passportNumber": passport_number,
                "passportCountryCode": payload["passportCountryCode"].strip(),
                "passportCountry": passport_country,
                "stream": "Fictional local demo",
                "demoRecordDetails": {
                    "applicantName": applicant_name,
                    "grantDate": "Not issued — local demo only",
                    "visaSubclass": payload["applicationType"].strip() + " — demo only",
                    "stream": "Local demo only",
                    "status": "Not granted — demo record only",
                    "mustNotArriveAfter": "Not applicable — no visa granted",
                    "lengthOfStay": "Not applicable — no visa granted",
                    "travelType": "Not applicable — no visa granted",
                    "dob": formatted_birth_date,
                    "grantNumber": "Not issued — local demo only",
                    "passportNumber": passport_number,
                    "passportCountry": passport_country,
                    "applicationId": application_id,
                    "trn": transaction_reference,
                    "officerName": "Not applicable — no official decision",
                    "positionNumber": "Not applicable — no official decision",
                    "sentToEmail": "demo@example.test",
                    "sentOnDate": "Not sent — local demo only",
                },
                "demoCorrespondenceEmail": "demo@example.test",
                "demoMessages": [
                    {
                        "date": formatted_application_date,
                        "subject": "Fictional demo record created",
                        "body": "Demo-only entry. No official application was submitted or processed.",
                    },
                ],
                "demoCorrespondence": [
                    {
                        "title": "Fictional demo record received",
                        "date": date.today().strftime("%d %B %Y"),
                        "url": "/pages/gemini-code-1793220976142.html",
                    },
                    {
                        "title": "Fictional demo details update acknowledgement",
                        "date": date.today().strftime("%d %B %Y"),
                        "url": "/pages/gemini-code-1793220976142.html",
                    },
                    {
                        "title": "Fictional demo message",
                        "date": date.today().strftime("%d %B %Y"),
                        "url": "/pages/gemini-code-1793220976142.html",
                    },
                ],
                "demoUpdates": [
                    {
                        "type": "Fictional demo update",
                        "applicant": applicant_name,
                        "status": "Demo entry only — not submitted",
                        "date": formatted_application_date,
                        "action": "No form or document generated.",
                    },
                ],
                "demoBiometrics": {
                    "status": "Not collected — fictional demo only",
                    "message": "No appointment or biometric record exists for this demo.",
                },
            }
            if existing:
                data["applications"][data["applications"].index(existing)] = record
            else:
                data["applications"].append(record)

            temporary_file = DATA_FILE.with_name(DATA_FILE.name + ".tmp")
            try:
                temporary_file.write_text(
                    json.dumps(data, ensure_ascii=False, indent=2) + "\n",
                    encoding="utf-8",
                )
                os.replace(temporary_file, DATA_FILE)
            finally:
                if temporary_file.exists():
                    temporary_file.unlink()
        except (OSError, json.JSONDecodeError, ValueError, KeyError) as error:
            self.send_json(500, {"error": "Demo JSON could not be updated: " + str(error)})
            return

        self.send_json(200, {"id": record_id, "status": "saved"})


if __name__ == "__main__":
    print("Local fictional demo server: http://{}:{}/".format(HOST, PORT))
    print("Only fictional test data should be saved in the demo JSON.")
    ThreadingHTTPServer((HOST, PORT), DemoRequestHandler).serve_forever()
