class HealthRecords:
    def __init__(self):
        self.records = []

    def add_record(self, patient_name, record):
        """Add a health record for a patient."""
        self.records.append({"patient_name": patient_name, "record": record})
        return f"Record added for {patient_name}"

    def get_records(self, patient_name):
        """Retrieve all records for a patient."""
        return [rec for rec in self.records if rec["patient_name"] == patient_name]

# Example usage
health = HealthRecords()
health.add_record("John Doe", {"blood_pressure": "120/80", "heart_rate": 72})
print(health.get_records("John Doe"))
