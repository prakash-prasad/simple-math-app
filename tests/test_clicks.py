import os
import tempfile
import pytest
from fastapi.testclient import TestClient

# Use a temp DB for all tests
_tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
_tmp.close()
os.environ["DB_PATH"] = _tmp.name

from backend.main import app  # noqa: E402 — must import after env var is set


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


VALID_PAYLOAD = {
    "user_id": "test_user",
    "button_name": "tab_addition",
    "page": "app.html",
    "x": 100,
    "y": 200,
    "timestamp": "2026-01-01T00:00:00.000Z",
    "tab_id": "addition",
    "session_id": "test-session-abc",
    "viewport_width": 1280,
    "viewport_height": 800,
}


def test_record_click_valid(client):
    response = client.post("/api/clicks", json=VALID_PAYLOAD)
    assert response.status_code == 201
    assert response.json()["success"] is True


def test_record_click_old_payload_no_new_fields(client):
    """Old clients omitting new optional fields should still get 201."""
    minimal = {
        "user_id": "old_client",
        "button_name": "show_subtraction",
        "page": "app.html",
        "x": 50,
        "y": 60,
        "timestamp": "2026-01-01T01:00:00.000Z",
    }
    response = client.post("/api/clicks", json=minimal)
    assert response.status_code == 201


def test_record_click_invalid_button(client):
    bad = {**VALID_PAYLOAD, "button_name": "unknown_btn"}
    response = client.post("/api/clicks", json=bad)
    assert response.status_code == 422


def test_record_click_empty_user_id(client):
    bad = {**VALID_PAYLOAD, "user_id": "   "}
    response = client.post("/api/clicks", json=bad)
    assert response.status_code == 422


def test_record_click_invalid_tab_id(client):
    bad = {**VALID_PAYLOAD, "tab_id": "unknown_tab"}
    response = client.post("/api/clicks", json=bad)
    assert response.status_code == 422


def test_record_click_negative_coords(client):
    bad = {**VALID_PAYLOAD, "x": -1}
    response = client.post("/api/clicks", json=bad)
    assert response.status_code == 422


def test_list_clicks(client):
    response = client.get("/api/clicks")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert isinstance(body["data"], list)
    assert body["count"] >= 1  # at least the click from test_record_click_valid


def test_list_clicks_filter_by_user(client):
    response = client.get("/api/clicks?user_id=test_user")
    assert response.status_code == 200
    body = response.json()
    assert all(r["user_id"] == "test_user" for r in body["data"])


def test_heatmap_all_users(client):
    response = client.get("/api/heatmap")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert isinstance(body["data"], list)
    assert isinstance(body["users"], list)
    # Should include our tracked button
    button_names = {d["button_name"] for d in body["data"]}
    assert "tab_addition" in button_names


def test_heatmap_filter_user(client):
    response = client.get("/api/heatmap?users=test_user")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True


def test_heatmap_filter_all_explicit(client):
    response = client.get("/api/heatmap?users=all")
    assert response.status_code == 200
    assert response.json()["success"] is True
