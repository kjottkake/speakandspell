from decouple import config
from emails.send_email import send_email

def forgot_pw_email(to: str, id: str, code: str):
    url = "/".join([config("FRONTEND_URL", cast=str), "resetpassword", id, code])
    content = """
    <html>
        <head></head>
        <body>
            <p>Reset your password <a href=""" + url + """>here</a>.</p>
        </body>
    </html>
    """
    send_email("Reset password", to, content)