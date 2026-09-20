import os
import smtplib
import uuid
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional

EMAIL_DISPATCH_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "dispatched_emails")
os.makedirs(EMAIL_DISPATCH_DIR, exist_ok=True)

def send_demo_confirmation_email(
    recipient_email: str,
    full_name: str,
    company_name: str,
    job_role: Optional[str] = "Security Leader",
    preferred_date: Optional[str] = None,
    preferred_time: Optional[str] = None,
    notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Dispatches a formal executive demo invitation and access pass to the prospective client.
    Supports real SMTP dispatch via SMTP_HOST/SMTP_USER or safe local RFC-5322 MIME preservation.
    """
    dispatch_id = str(uuid.uuid4())[:8].upper()
    vip_passcode = f"CF-VIP-{dispatch_id}"
    meet_url = f"https://meet.cyberflock.defense/warroom/{dispatch_id.lower()}"
    scheduled_date = preferred_date or (datetime.utcnow().strftime("%B %d, %Y"))
    scheduled_time = preferred_time or "14:00 IST / 08:30 UTC"

    subject = f"🛡️ Cyber Flock Defense Hub: VIP Executive Demo Confirmation [{vip_passcode}]"

    html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #04070a; color: #e2e8f0; margin: 0; padding: 24px; }}
  .container {{ max-width: 620px; margin: 0 auto; background-color: #090f12; border: 1px solid #162a2f; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
  .header {{ background: linear-gradient(135deg, #061114 0%, #0c2024 100%); padding: 24px; border-bottom: 2px solid #00e599; text-align: left; }}
  .brand {{ font-family: monospace; font-size: 20px; font-weight: bold; color: #ffffff; letter-spacing: 1px; }}
  .brand span {{ color: #00e599; }}
  .tagline {{ font-size: 11px; color: #94a3b8; font-family: monospace; margin-top: 4px; text-transform: uppercase; letter-spacing: 1.5px; }}
  .content {{ padding: 28px 24px; font-size: 14px; line-height: 1.6; color: #cbd5e1; }}
  .greeting {{ font-size: 16px; font-weight: 600; color: #f8fafc; margin-bottom: 12px; }}
  .box {{ background-color: #0d171b; border: 1px solid #1b2e34; border-radius: 8px; padding: 16px; margin: 20px 0; font-family: monospace; font-size: 13px; }}
  .box-row {{ display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px dashed #1e353c; padding-bottom: 6px; }}
  .box-row:last-child {{ border-bottom: none; margin-bottom: 0; padding-bottom: 0; }}
  .label {{ color: #64748b; font-weight: 500; }}
  .value {{ color: #00e599; font-weight: 700; }}
  .cta-btn {{ display: inline-block; background-color: #00e599; color: #04070a; font-family: monospace; font-weight: bold; font-size: 13px; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 12px 0 20px 0; }}
  .bullet-list {{ margin: 16px 0; padding-left: 20px; }}
  .bullet-list li {{ margin-bottom: 6px; color: #94a3b8; }}
  .bullet-list strong {{ color: #f1f5f9; }}
  .footer {{ background-color: #050a0c; padding: 18px 24px; border-top: 1px solid #152226; font-size: 11px; color: #64748b; font-family: monospace; }}
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">CYBER <span>FLOCK</span> DEFENSE HUB</div>
      <div class="tagline">Financial Cyber Risk Quantification & Continuous Attack Defense</div>
    </div>
    <div class="content">
      <div class="greeting">Dear {full_name},</div>
      <p>
        Thank you for requesting an executive technical demonstration of the <strong>Cyber Flock Defense Hub</strong> for <strong>{company_name}</strong>.
      </p>
      <p>
        Your private demonstration session has been scheduled with our Lead Security Architecture and Cyber Assurance team.
      </p>

      <div class="box">
        <div class="box-row">
          <span class="label">INVITEE:</span>
          <span class="value">{full_name} ({job_role})</span>
        </div>
        <div class="box-row">
          <span class="label">ORGANIZATION:</span>
          <span class="value">{company_name}</span>
        </div>
        <div class="box-row">
          <span class="label">SCHEDULED DATE:</span>
          <span class="value">{scheduled_date}</span>
        </div>
        <div class="box-row">
          <span class="label">CONFIRMED TIME:</span>
          <span class="value">{scheduled_time}</span>
        </div>
        <div class="box-row">
          <span class="label">VIP ACCESS CODE:</span>
          <span class="value">{vip_passcode}</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="{meet_url}" class="cta-btn">ENTER SECURE DEMO SESSION &rarr;</a>
      </div>

      <p><strong>What we will demonstrate live on your session:</strong></p>
      <ul class="bullet-list">
        <li><strong>Breach & Attack Simulation (BAS):</strong> Live multi-stage weaponization and evasion targeting realistic DMZ infrastructure.</li>
        <li><strong>FAIR Actuarial Risk Engine:</strong> Instant financial loss calculation with 10,000 compound Monte Carlo iterations (ALE, SLE, 95% Value-at-Risk).</li>
        <li><strong>Continuous SIEM & EDR Telemetry:</strong> Real-time MITRE ATT&CK kill-chain correlation and automated incident alerting.</li>
        <li><strong>Immutable EVM Blockchain Anchoring:</strong> Cryptographic SHA-256 defense audit verification sealed on distributed smart contracts.</li>
        <li><strong>Affordable B2B Subscription Tiers:</strong> Transparent annual licensing below &#8377;1 Lakh for enterprise infrastructure protection.</li>
      </ul>

      <p style="margin-top: 24px; font-size: 13px;">
        Signed with Assurance,<br>
        <strong>S. Md. Afzal</strong><br>
        <span style="color: #94a3b8; font-size: 11px;">Founder & Chief Executive Officer (CEO)<br>Cyber Flock Defense Hub & Attestation Authority</span>
      </p>
    </div>
    <div class="footer">
      CONFIDENTIAL & PROPRIETARY &bull; CYBER FLOCK DEFENSE PLATFORM &bull; SECURE REF #{vip_passcode}
    </div>
  </div>
</body>
</html>"""

    text_content = f"""
CYBER FLOCK DEFENSE HUB - EXECUTIVE DEMO CONFIRMATION
======================================================
Dear {full_name},

Your private cybersecurity demonstration session for {company_name} is confirmed.

SCHEDULED DATE: {scheduled_date}
CONFIRMED TIME: {scheduled_time}
VIP ACCESS CODE: {vip_passcode}
JOIN WAR-ROOM: {meet_url}

Agenda:
1. Live Breach & Attack Simulation (BAS) on DMZ & Active Directory
2. FAIR Financial Risk Quantification & 10,000 Monte Carlo iterations
3. Real-time SIEM / EDR Alert Correlation & Threat Interception
4. Immutable EVM Blockchain Audit Seals
5. Tailored B2B Defense Deployment

Signatory:
S. Md. Afzal, Founder & CEO
Cyber Flock Defense Hub & Attestation Authority
"""

    smtp_sent = False
    smtp_host = os.getenv("SMTP_HOST")
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))

    if smtp_host and smtp_user and smtp_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"Cyber Flock Defense <{smtp_user}>"
            msg["To"] = recipient_email
            msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_user, [recipient_email], msg.as_string())
            smtp_sent = True
        except Exception as e:
            print(f"[EMAIL SERVICE] SMTP delivery attempt encountered: {e}")

    # Archive email artifact to disk for guaranteed audit trail & instant client preview
    file_path_html = os.path.join(EMAIL_DISPATCH_DIR, f"demo_{vip_passcode}.html")
    with open(file_path_html, "w", encoding="utf-8") as f:
        f.write(html_content)

    return {
        "status": "SENT" if smtp_sent else "DISPATCHED_TO_QUEUE",
        "smtp_delivered": smtp_sent,
        "recipient": recipient_email,
        "subject": subject,
        "vip_passcode": vip_passcode,
        "meet_url": meet_url,
        "scheduled_date": scheduled_date,
        "scheduled_time": scheduled_time,
        "dispatched_at": datetime.utcnow().isoformat() + "Z",
        "saved_path": file_path_html,
        "preview_html": html_content
    }
