import urllib.parse


def test_signup_and_unregister(client):
    activity = "Chess Club"
    email = "teststudent@example.com"

    # URL-encode activity name for the path
    activity_path = f"/activities/{urllib.parse.quote(activity)}/signup"

    # Successful signup
    res = client.post(activity_path, params={"email": email})
    assert res.status_code == 200
    assert "Signed up" in res.json().get("message", "")

    # Verify participant appears in GET /activities
    activities = client.get("/activities").json()
    assert email in activities[activity]["participants"]

    # Duplicate signup should return 400
    res2 = client.post(activity_path, params={"email": email})
    assert res2.status_code == 400

    # Unregister the participant
    res3 = client.delete(activity_path, params={"email": email})
    assert res3.status_code == 200
    assert "Removed" in res3.json().get("message", "")

    # Participant no longer present
    activities_after = client.get("/activities").json()
    assert email not in activities_after[activity]["participants"]

    # Deleting again should return 404
    res4 = client.delete(activity_path, params={"email": email})
    assert res4.status_code == 404

    # Signing up for a non-existent activity should 404
    res5 = client.post("/activities/NoSuchActivity/signup", params={"email": "a@b.c"})
    assert res5.status_code == 404
