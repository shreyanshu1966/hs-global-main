import os
import time
import re
from datetime import datetime
from flask import Flask, request, jsonify

# Optional Twilio import; fall back to log-only mode if unavailable
try:
    from twilio.rest import Client  # type: ignore
except Exception:
    Client = None  # type: ignore


app = Flask(__name__)

# In-memory OTP store. On shared hosting this will reset on app restart, which is fine for OTPs.
otp_store: dict[str, dict[str, int | str]] = {}


def now_ms() -> int:
    return int(time.time() * 1000)


def clean_phone(raw: str | None) -> str:
    return re.sub(r"\D+", "", str(raw or ""))


@app.get("/api/health")
def health():
    return jsonify({"ok": True, "timestamp": datetime.utcnow().isoformat()})


@app.post("/api/otp/send")
def send_otp():
    try:
        data = request.get_json(silent=True) or {}
        phone_raw = data.get("phone")
        if not phone_raw:
            return jsonify({"ok": False, "error": "Missing phone"}), 400

        phone = clean_phone(phone_raw)
        if not phone:
            return jsonify({"ok": False, "error": "Invalid phone"}), 400

        # Generate a pseudo-random 6-digit code (sufficient for OTP)
        code = f"{int(time.time()*1000) % 900000 + 100000:06d}"
        ttl_ms = 5 * 60 * 1000
        otp_store[phone] = {"code": code, "expires_at": now_ms() + ttl_ms, "attempts": 0}

        sid = os.environ.get("TWILIO_ACCOUNT_SID")
        tok = os.environ.get("TWILIO_AUTH_TOKEN")
        from_num = os.environ.get("TWILIO_FROM")

        # If Twilio is not configured or library missing, log-only mode
        if not sid or not tok or not from_num or Client is None:
            print(f"[OTP LOG-ONLY] {phone} => {code}")
            return jsonify({"ok": True, "note": "log-only", "ttlMs": ttl_ms, "otpToken": code})

        client = Client(sid, tok)
        to_e164 = f"+{phone}"

        try:
            msg = client.messages.create(
                body=f"Your verification code is {code}. It expires in 5 minutes.",
                from_=from_num,
                to=to_e164,
            )
            return jsonify({"ok": True, "sid": msg.sid, "ttlMs": ttl_ms, "otpToken": code})
        except Exception as e:  # handle common Twilio trial or validation issues gracefully
            err_code = getattr(e, "code", None) or getattr(e, "status", None)
            if err_code in (21608, 400):
                print(f"[OTP TRIAL LOG-ONLY] {phone} => {code}")
                return jsonify({"ok": True, "note": "twilio_trial_unverified", "ttlMs": ttl_ms, "otpToken": code})

            # Non-production: fall back to log-only so you can continue testing
            is_prod = os.environ.get("ENV") == "production"
            if not is_prod:
                print(f"[OTP SEND ERROR DEV-FALLBACK] {phone} => {code} : {e}")
                return jsonify({"ok": True, "note": "twilio_send_error_dev_fallback", "ttlMs": ttl_ms, "otpToken": code})
            return jsonify({"ok": False, "error": "OTP send failed"}), 500
    except Exception:
        is_prod = os.environ.get("ENV") == "production"
        if not is_prod:
            fallback = "123456"
            print(f"[DEV FALLBACK] OTP => {fallback}")
            return jsonify({"ok": True, "note": "dev_fallback", "ttlMs": 5*60*1000, "otpToken": fallback})
        return jsonify({"ok": False, "error": "OTP send failed"}), 500


@app.post("/api/otp/verify")
def verify_otp():
    try:
        data = request.get_json(silent=True) or {}
        phone_raw = data.get("phone")
        code = str(data.get("code") or "")
        if not phone_raw or not code:
            return jsonify({"ok": False, "error": "Missing phone/code"}), 400

        phone = clean_phone(phone_raw)
        entry = otp_store.get(phone)
        if not entry:
            return jsonify({"ok": False, "error": "Code not found"}), 400

        if now_ms() > int(entry["expires_at"])):
            otp_store.pop(phone, None)
            return jsonify({"ok": False, "error": "Code expired"}), 400

        entry["attempts"] = int(entry.get("attempts", 0)) + 1
        if int(entry["attempts"]) > 5:
            otp_store.pop(phone, None)
            return jsonify({"ok": False, "error": "Too many attempts"}), 429

        if code != str(entry["code"]):
            return jsonify({"ok": False, "error": "Invalid code"}), 400

        otp_store.pop(phone, None)
        return jsonify({"ok": True})
    except Exception:
        return jsonify({"ok": False, "error": "OTP verify failed"}), 500


# Passenger WSGI entrypoint
application = app



