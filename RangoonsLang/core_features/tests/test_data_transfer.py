import unittest

# Dummy functions to test (replace these with actual functions from your project)
def send_data(device, data):
    return f"Data sent to {device}"

def receive_data(device):
    return f"Sample data from {device}"

class TestDataTransfer(unittest.TestCase):

    def test_send_data(self):
        result = send_data("Device1", "Hello")
        self.assertEqual(result, "Data sent to Device1")

    def test_receive_data(self):
        result = receive_data("Device1")
        self.assertEqual(result, "Sample data from Device1")

if __name__ == '__main__':
    unittest.main()
