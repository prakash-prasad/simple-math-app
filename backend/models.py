from pydantic import BaseModel, field_validator
from typing import Optional, List

VALID_BUTTONS = {
    "tab_addition", "tab_subtraction", "tab_multiplication",
    "show_addition", "show_subtraction", "show_multiplication",
}
VALID_PAGES = {"app.html", "analytics.html"}
VALID_TABS = {"addition", "subtraction", "multiplication"}


class ClickEvent(BaseModel):
    user_id: str
    button_name: str
    page: str
    x: int
    y: int
    timestamp: str
    tab_id: Optional[str] = None
    session_id: Optional[str] = None
    viewport_width: Optional[int] = None
    viewport_height: Optional[int] = None

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

    @field_validator("tab_id")
    @classmethod
    def valid_tab_id(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_TABS:
            raise ValueError(f"tab_id must be one of {VALID_TABS} or null")
        return v

    @field_validator("viewport_width", "viewport_height")
    @classmethod
    def positive_viewport(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 0:
            raise ValueError("viewport dimensions must be non-negative")
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
    tab_id: Optional[str] = None
    session_id: Optional[str] = None
    viewport_width: Optional[int] = None
    viewport_height: Optional[int] = None


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
