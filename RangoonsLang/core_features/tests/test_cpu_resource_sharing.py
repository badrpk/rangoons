import unittest

# Dummy functions to test (replace these with actual functions from your project)
def allocate_cpu():
    return "CPU allocated"

def deallocate_cpu():
    return "CPU deallocated"

class TestCPUResourceSharing(unittest.TestCase):

    def test_allocate_cpu(self):
        result = allocate_cpu()
        self.assertEqual(result, "CPU allocated")

    def test_deallocate_cpu(self):
        result = deallocate_cpu()
        self.assertEqual(result, "CPU deallocated")

if __name__ == '__main__':
    unittest.main()


import unittest

# Dummy functions to test (replace these with actual functions from your project)
def allocate_cpu(requested_cores):
    if requested_cores > 4:  # Example condition
        raise ValueError("Insufficient CPU resources")
    return "CPU allocated"

def deallocate_cpu(allocated_cores):
    return "CPU deallocated"

class TestCPUResourceSharing(unittest.TestCase):

    def test_allocate_cpu_success(self):
        result = allocate_cpu(2)
        self.assertEqual(result, "CPU allocated")

    def test_allocate_cpu_failure(self):
        with self.assertRaises(ValueError):
            allocate_cpu(10)

    def test_deallocate_cpu(self):
        result = deallocate_cpu(2)
        self.assertEqual(result, "CPU deallocated")

if __name__ == '__main__':
    unittest.main()
