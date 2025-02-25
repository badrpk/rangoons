from tax.tax_filing import TaxFiling

def test_calculate_tax():
    tax = TaxFiling("John Doe", 75000)
    assert tax.calculate_tax() == 7500
