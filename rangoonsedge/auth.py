from fastapi import HTTPException, Security
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ✅ Fake User Database (Replace with RangoonsID in future)
users_db = {
    "admin": {"id": "1", "username": "admin", "role": "admin"},
    "user1": {"id": "2", "username": "user1", "role": "user"},
}

# ✅ Authenticate User
def authenticate_user(username: str):
    if username in users_db:
        return users_db[username]
    return None

# ✅ Get Current User
def get_current_user(token: str = Security(oauth2_scheme)):
    user = authenticate_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    return user
