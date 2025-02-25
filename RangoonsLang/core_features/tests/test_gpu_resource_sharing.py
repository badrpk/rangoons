import unittest

# Dummy functions to test (replace these with actual functions from your project)
def allocate_gpu(requested_gpus):
    return "GPU allocated"

def deallocate_gpu(allocated_gpus):
    return "GPU deallocated"

class TestGPUResourceSharing(unittest.TestCase):

    def test_allocate_gpu(self):
        result = allocate_gpu(2)
        self.assertEqual(result, "GPU allocated")

    def test_deallocate_gpu(self):
        result = deallocate_gpu(2)
        self.assertEqual(result, "GPU deallocated")

if __name__ == '__main__':
    unittest.main()
