import urllib.parse


def test_root_redirect_and_activities(client):
    # Check redirect from root to static index
    res = client.get("/", follow_redirects=False)
    assert res.status_code == 307
    assert res.headers.get("location", "").endswith("/static/index.html")

    # Check GET /activities
    res2 = client.get("/activities")
    assert res2.status_code == 200
    data = res2.json()
    assert isinstance(data, dict)

    # Known activity should exist with expected keys
    assert "Chess Club" in data
    chess = data["Chess Club"]
    for key in ("description", "schedule", "participants", "max_participants"):
        assert key in chess
