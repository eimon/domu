import pytest


def _costs_url(property_id: str) -> str:
    return f"/properties/{property_id}/costs"


def _cost_payload(**overrides):
    payload = {
        "name": "Cleaning Fee",
        "category": "PER_RESERVATION",
        "calculation_type": "FIXED_AMOUNT",
        "value": "50.00",
    }
    payload.update(overrides)
    return payload


# ---------- Create ----------

async def test_create_cost(client, admin_headers, test_property):
    pid = test_property["id"]
    resp = await client.post(
        _costs_url(pid),
        json=_cost_payload(),
        headers=admin_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Cleaning Fee"
    assert data["property_id"] == pid


async def test_create_cost_percentage(client, admin_headers, test_property):
    pid = test_property["id"]
    resp = await client.post(
        _costs_url(pid),
        json=_cost_payload(
            name="Commission",
            category="PER_RESERVATION",
            calculation_type="PERCENTAGE",
            value="15.00",
        ),
        headers=admin_headers,
    )
    assert resp.status_code == 201


async def test_create_cost_percentage_over_100(client, admin_headers, test_property):
    """Percentage value cannot exceed 100."""
    pid = test_property["id"]
    resp = await client.post(
        _costs_url(pid),
        json=_cost_payload(
            calculation_type="PERCENTAGE",
            value="150.00",
        ),
        headers=admin_headers,
    )
    assert resp.status_code == 422


# ---------- List ----------

async def test_list_costs(client, admin_headers, test_property):
    pid = test_property["id"]
    await client.post(_costs_url(pid), json=_cost_payload(), headers=admin_headers)
    await client.post(_costs_url(pid), json=_cost_payload(name="Internet"), headers=admin_headers)

    resp = await client.get(_costs_url(pid), headers=admin_headers)
    assert resp.status_code == 200
    assert len(resp.json()) >= 2


# ---------- Update ----------

async def test_update_cost(client, admin_headers, test_property):
    pid = test_property["id"]
    create_resp = await client.post(_costs_url(pid), json=_cost_payload(), headers=admin_headers)
    cost_id = create_resp.json()["id"]

    resp = await client.put(
        f"/costs/{cost_id}",
        json={"name": "Updated Cost", "value": "75.00"},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Cost"


# ---------- Delete (soft) ----------

async def test_delete_cost(client, admin_headers, test_property):
    pid = test_property["id"]
    create_resp = await client.post(_costs_url(pid), json=_cost_payload(), headers=admin_headers)
    cost_id = create_resp.json()["id"]

    resp = await client.delete(f"/costs/{cost_id}", headers=admin_headers)
    assert resp.status_code == 204
