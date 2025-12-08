from fastapi import Request, HTTPException, status

async def connection_err(request: Request):
    try:
        await request.app.mongodb.command("ping")
        return False
    except:
        return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database connection failed")
    
def lang_error(lang):
    if lang in ["swedish", "norwegian", "danish"]:
        return False
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{lang} is not a recognized language.")