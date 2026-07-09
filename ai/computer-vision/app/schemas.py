from typing import Optional
from pydantic import BaseModel, Field


class MeasurementResult(BaseModel):
    shoulder_width_cm: Optional[float] = None
    chest_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    hip_cm: Optional[float] = None
    arm_length_cm: Optional[float] = None
    leg_length_cm: Optional[float] = None
    body_shape: Optional[str] = None
    confidence_score: float = Field(ge=0.0, le=1.0)
    warnings: list[str] = []


class EstimateResponse(BaseModel):
    success: bool
    measurements: Optional[MeasurementResult] = None
    raw_landmarks: Optional[dict] = None
    error: Optional[str] = None
