import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from decouple import config

MAIL_FROM = config("MAIL_FROM", cast=str)
MAIL_SERVER = config("MAIL_SERVER", cast=str)
MAIL_PORT = config("MAIL_PORT", cast=int)

# To be used when writing an email in emails/emails.py
def send_email(subject: str, to: str, content: str):
    msg = MIMEMultipart()
    msg["Subject"] = subject
    msg["From"] = MAIL_FROM
    msg["To"] = to
    msg.attach(MIMEText(content, "html"))
    with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as s:
        s.send_message(msg)