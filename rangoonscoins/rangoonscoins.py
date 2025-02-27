# ✅ Store user balances
balances = {}

# ✅ Get User Earnings
def get_user_balance(user_id: str):
    return {"user": user_id, "balance": balances.get(user_id, 0)}

# ✅ Reward Users for CPU/GPU/Storage Contribution
def reward_user(user_id: str, contribution: dict):
    earnings = (contribution["CPU"] * 10) + (contribution["GPU"] * 50) + (contribution["Storage"] * 5)
    balances[user_id] = balances.get(user_id, 0) + earnings
    return {"user": user_id, "new_balance": balances[user_id]}
