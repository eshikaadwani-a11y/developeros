"""Pure tests for the explanation output-shaping helpers."""

import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.explain import mean_abs, rank_features  # noqa: E402


class TestExplainHelpers(unittest.TestCase):
    def test_mean_abs_columnwise(self):
        rows = [[1.0, -2.0], [-3.0, 4.0]]
        self.assertEqual(mean_abs(rows), [2.0, 3.0])

    def test_mean_abs_empty(self):
        self.assertEqual(mean_abs([]), [])

    def test_rank_features_sorts_desc(self):
        ranked = rank_features([0.1, 0.9, 0.5], ["a", "b", "c"])
        self.assertEqual([r["feature"] for r in ranked], ["b", "c", "a"])

    def test_rank_features_default_names(self):
        ranked = rank_features([0.2, 0.8])
        self.assertEqual(ranked[0]["feature"], "f1")
        self.assertEqual(ranked[0]["importance"], 0.8)


if __name__ == "__main__":
    unittest.main()
