from fastapi import APIRouter, Query
from typing import Optional
from backend.models import (
    ClickEvent, ClickRecord, ClickListResponse,
    HeatmapResponse, HeatmapData,
)
from backend import database

router = APIRouter()


@router.post("/clicks", status_code=201)
async def record_click(event: ClickEvent):
    await database.insert_click(
        user_id=event.user_id,
        button_name=event.button_name,
        page=event.page,
        x=event.x,
        y=event.y,
        timestamp=event.timestamp,
        tab_id=event.tab_id,
        session_id=event.session_id,
        viewport_width=event.viewport_width,
        viewport_height=event.viewport_height,
    )
    return {"success": True}


@router.get("/clicks", response_model=ClickListResponse)
async def list_clicks(
    user_id: Optional[str] = Query(None),
    button_name: Optional[str] = Query(None),
    page: Optional[str] = Query(None),
    limit: int = Query(2000, ge=1, le=10000),
):
    rows = await database.get_clicks(
        user_id=user_id, button_name=button_name, page=page, limit=limit
    )
    records = [ClickRecord(**r) for r in rows]
    return ClickListResponse(success=True, data=records, count=len(records))


@router.get("/heatmap", response_model=HeatmapResponse)
async def heatmap(users: Optional[str] = Query(None)):
    all_users = await database.get_distinct_users()

    if users and users != "all":
        user_list = [u.strip() for u in users.split(",") if u.strip()]
    else:
        user_list = None  # all users

    data = await database.get_heatmap(user_ids=user_list)
    return HeatmapResponse(
        success=True,
        data=[HeatmapData(**d) for d in data],
        users=all_users,
    )
