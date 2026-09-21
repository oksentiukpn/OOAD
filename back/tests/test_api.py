import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_create_participant(client: AsyncClient):
    payload = {
        "name": "Sarah Connor",
        "email": "sarah.connor@test.com",
    }
    response = await client.post("/api/v1/participants", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == payload["name"]
    assert data["email"] == payload["email"]
    assert "id" in data


@pytest.mark.asyncio
async def test_list_participants(client: AsyncClient):
    response = await client.get("/api/v1/participants")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_create_meeting_with_participants(client: AsyncClient):
    # 1. Create a participant
    part_resp = await client.post(
        "/api/v1/participants",
        json={"name": "John Doe", "email": "john.doe@test.com"},
    )
    assert part_resp.status_code == 201
    participant_id = part_resp.json()["id"]

    # 2. Create meeting attaching existing participant and an inline new one
    meeting_payload = {
        "title": "Roadmap Alignment",
        "description": "Discuss quarterly milestones and feature releases.",
        "place": "Conference Room 101",
        "link_to_call": "https://meet.google.com/test-meet",
        "participant_ids": [participant_id],
        "new_participants": [{"name": "Jane Miller", "email": "jane.miller@test.com"}],
    }
    meeting_resp = await client.post("/api/v1/meetings", json=meeting_payload)
    assert meeting_resp.status_code == 201
    data = meeting_resp.json()
    assert data["title"] == "Roadmap Alignment"
    assert data["place"] == "Conference Room 101"
    assert len(data["participants"]) == 2

    # Verify participant emails
    emails = [p["email"] for p in data["participants"]]
    assert "john.doe@test.com" in emails
    assert "jane.miller@test.com" in emails


@pytest.mark.asyncio
async def test_delete_meeting(client: AsyncClient):
    # 1. Create a meeting to delete
    create_resp = await client.post(
        "/api/v1/meetings",
        json={
            "title": "Meeting to be removed",
            "description": "Temporary meeting",
        },
    )
    assert create_resp.status_code == 201
    meeting_id = create_resp.json()["id"]

    # 2. Delete it
    del_resp = await client.delete(f"/api/v1/meetings/{meeting_id}")
    assert del_resp.status_code == 204

    # 3. Confirm 404
    get_resp = await client.get(f"/api/v1/meetings/{meeting_id}")
    assert get_resp.status_code == 404
