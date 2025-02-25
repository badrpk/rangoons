from fastapi import FastAPI
from tax.tax_filing import TaxFiling

app = FastAPI()
tax = TaxFiling("John Doe", 75000)

@app.get("/tax/calculate")
def calculate_tax():
    return {"tax": tax.calculate_tax()}
