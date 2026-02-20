import copy

import pytest
from fastapi.testclient import TestClient

from src import app as src_app


# Snapshot of initial activities so tests can reset state between runs
_initial_activities = copy.deepcopy(src_app.activities)


@pytest.fixture
def client():
    return TestClient(src_app.app)


@pytest.fixture(autouse=True)
def reset_activities():
    """Reset the in-memory activities dict before each test."""
    src_app.activities.clear()
    src_app.activities.update(copy.deepcopy(_initial_activities))
    yield
