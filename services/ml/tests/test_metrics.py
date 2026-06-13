"""Pure-stdlib tests for the metric functions (no numpy/sklearn needed)."""

import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import metrics  # noqa: E402


class TestRegressionMetrics(unittest.TestCase):
    def test_perfect_fit(self):
        y = [1.0, 2.0, 3.0]
        self.assertEqual(metrics.rmse(y, y), 0.0)
        self.assertEqual(metrics.r2_score(y, y), 1.0)

    def test_rmse_and_mae(self):
        self.assertAlmostEqual(metrics.rmse([0, 0], [1, 1]), 1.0)
        self.assertAlmostEqual(metrics.mae([0, 0], [2, 4]), 3.0)

    def test_r2_zero_variance(self):
        self.assertEqual(metrics.r2_score([5, 5, 5], [4, 5, 6]), 0.0)


class TestClassificationMetrics(unittest.TestCase):
    def test_accuracy(self):
        self.assertEqual(metrics.accuracy([1, 0, 1, 1], [1, 0, 0, 1]), 0.75)

    def test_f1_macro_perfect(self):
        self.assertEqual(metrics.f1_macro([0, 1, 1], [0, 1, 1]), 1.0)

    def test_f1_macro_partial(self):
        score = metrics.f1_macro([0, 1, 0, 1], [0, 1, 1, 1])
        self.assertGreater(score, 0.0)
        self.assertLess(score, 1.0)


if __name__ == "__main__":
    unittest.main()
