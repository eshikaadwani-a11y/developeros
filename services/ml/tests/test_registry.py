"""Tests for the in-memory model registry (pure stdlib)."""

import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.registry import ModelRegistry  # noqa: E402


class TestModelRegistry(unittest.TestCase):
    def test_put_and_get(self):
        reg = ModelRegistry()
        mid = reg.put(
            task="regression",
            algorithm="linear",
            model=object(),
            metrics={"r2": 0.9},
            feature_count=3,
        )
        self.assertTrue(reg.has(mid))
        entry = reg.get(mid)
        self.assertEqual(entry.task, "regression")
        self.assertEqual(entry.feature_count, 3)

    def test_missing_raises(self):
        reg = ModelRegistry()
        self.assertFalse(reg.has("nope"))
        with self.assertRaises(KeyError):
            reg.get("nope")

    def test_list_returns_metadata_without_model_object(self):
        reg = ModelRegistry()
        reg.put(task="anomaly", algorithm="isolation_forest", model=object(), metrics={}, feature_count=2)
        listed = reg.list()
        self.assertEqual(len(listed), 1)
        self.assertIn("id", listed[0])
        self.assertNotIn("model", listed[0])


if __name__ == "__main__":
    unittest.main()
