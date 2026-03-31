from pydantic import BaseModel, field_validator
from typing import Optional, List

VALID_BUTTONS = {
    "tab_addition", "tab_subtraction", "tab_multiplication",
    "show_addition", "show_subtraction", "show_multiplication",
}
VALID_PAGES = {"app.html", "analytics.html"}


class ClickEvent(BaseModel):
    user_id: str
    button_name: str
    page: str
    x: int
    y: int
    timestamp: str

    @field_validator("user_id")
    @classmethod
    def user_id_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("user_id must not be empty")
        return v

    @field_validator("button_name")
    @classmethod
    def valid_button(cls, v: str) -> str:
        if v not in VALID_BUTTONS:
            raise ValueError(f"button_name must be one of {VALID_BUTTONS}")
        return v

    @field_validator("page")
    @classmethod
    def valid_page(cls, v: str) -> str:
        if v not in VALID_PAGES:
            raise ValueError(f"page must be one of {VALID_PAGES}")
        return v

    @field_validator("x", "y")
    @classmethod
    def non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("x and y must be non-negative")
        return v


class ClickRecord(BaseModel):
    id: int
    user_id: str
    button_name: str
    page: str
    x: int
    y: int
    timestamp: str
    created_at: str


class ClickListResponse(BaseModel):
    success: bool
    data: List[ClickRecord]
    count: int


class HeatmapData(BaseModel):
    button_name: str
    count: int


class HeatmapResponse(BaseModel):
    success: bool
    data: List[HeatmapData]
    users: List[str]
