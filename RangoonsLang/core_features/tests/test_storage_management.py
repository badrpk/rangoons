import unittest

# Dummy functions to test (replace these with actual functions from your project)
def allocate_storage(requested_storage):
    return "Storage allocated"

def deallocate_storage(allocated_storage):
    return "Storage deallocated"

class TestStorageManagement(unittest.TestCase):

    def test_allocate_storage(self):
        result = allocate_storage(100)
        self.assertEqual(result, "Storage allocated")

    def test_deallocate_storage(self):
        result = deallocate_storage(100)
        self.assertEqual(result, "Storage deallocated")

if __name__ == '__main__':
    unittest.main()
