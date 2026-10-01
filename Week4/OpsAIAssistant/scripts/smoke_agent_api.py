import json
import urllib.request
import uuid


API = "http://127.0.0.1:8000/api"


def post(path, payload):
    request = urllib.request.Request(
        f"{API}/{path}",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        return json.loads(response.read())


def main():
    failures = []
    math = post("chat", {"message": "What is 17% of 1200?", "session_id": f"smoke-math-{uuid.uuid4()}"})
    math_ok = "204" in math["response"]
    print("calculator:", "PASS" if math_ok else f"FAIL ({math['response']})")
    if not math_ok:
        failures.append("calculator")

    session = f"smoke-memory-{uuid.uuid4()}"
    post("chat", {"message": "Remember my tracking code is OPS-417.", "session_id": session})
    memory = post("chat", {"message": "What was my tracking code?", "session_id": session})
    memory_ok = "OPS-417" in memory["response"]
    print("conversation memory:", "PASS" if memory_ok else f"FAIL ({memory['response']})")
    if not memory_ok:
        failures.append("memory")

    email_session = f"smoke-approval-{uuid.uuid4()}"
    draft = post("chat", {"message": "Draft an email to demo@example.com with subject Ops test and body Hello.", "session_id": email_session})
    draft_ok = not draft["needs_approval"] and "EMAIL DRAFT" in draft["response"]
    print("email draft:", "PASS" if draft_ok else f"FAIL ({draft})")
    if not draft_ok:
        failures.append("email draft")
    approval = post("chat", {"message": "I explicitly approve sending that exact email to demo@example.com, subject Ops test, body Hello. Send it now.", "session_id": email_session})
    approval_ok = approval["needs_approval"] and approval.get("pending_tool_call", {}).get("name") == "send_email"
    print("approval interrupt:", "PASS" if approval_ok else f"FAIL ({approval})")
    if approval_ok:
        rejected = post("approve", {"session_id": email_session, "approved": False, "feedback": "Do not send this email."})
        rejection_ok = not rejected["needs_approval"] and "simulated email sent" not in rejected["response"].lower()
        print("approval rejection:", "PASS" if rejection_ok else f"FAIL ({rejected})")
        if not rejection_ok:
            failures.append("approval rejection")

        approved_session = f"smoke-approved-send-{uuid.uuid4()}"
        post("chat", {"message": "Draft an email to demo@example.com with subject Ops test and body Hello.", "session_id": approved_session})
        approval = post("chat", {"message": "I explicitly approve sending that exact email to demo@example.com, subject Ops test, body Hello. Send it now.", "session_id": approved_session})
        if approval.get("needs_approval"):
            sent = post("approve", {"session_id": approved_session, "approved": True})
            send_ok = not sent["needs_approval"] and ("simulated" in sent["response"].lower() or "sent" in sent["response"].lower())
        else:
            sent, send_ok = approval, False
        print("approved simulated send:", "PASS" if send_ok else f"FAIL ({sent})")
        if not send_ok:
            failures.append("approved simulated send")
    else:
        failures.append("approval interrupt")

    raise SystemExit(1 if failures else 0)


if __name__ == "__main__":
    main()
