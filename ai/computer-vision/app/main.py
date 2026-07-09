from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from app.pose_estimator import estimate_pose
from app.measurements import estimate_measurements
from app.schemas import EstimateResponse, MeasurementResult

app = FastAPI(title="FitsMe Computer Vision Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # internal service, called only by fitsme-server
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "fitsme-cv"}


@app.post("/estimate", response_model=EstimateResponse)
async def estimate(
    height_cm: float = Form(..., gt=50, lt=250),
    front_image: UploadFile = File(...),
    side_image: UploadFile | None = File(None),
):
    front_bytes = await front_image.read()
    front_pose = estimate_pose(front_bytes)

    if not front_pose.success:
        return EstimateResponse(
            success=False,
            error=front_pose.error or "Pose estimation failed on front image.",
        )

    side_landmarks_px = None
    warnings: list[str] = []
    if front_pose.error:
        warnings.append(front_pose.error)

    if side_image is not None:
        side_bytes = await side_image.read()
        side_pose = estimate_pose(side_bytes)
        if side_pose.success:
            side_landmarks_px = side_pose.landmarks_px
        else:
            warnings.append(
                f"Side image pose estimation failed: {side_pose.error}"
            )

    measurements, m_warnings = estimate_measurements(
        front_landmarks_px=front_pose.landmarks_px,
        side_landmarks_px=side_landmarks_px,
        height_cm=height_cm,
    )
    warnings.extend(m_warnings)

    # Confidence starts high and is docked for missing side image / low
    # visibility landmarks / fallback approximations. Simple heuristic,
    # meant to be replaced with a calibrated model once labeled data exists.
    confidence = 0.85
    if side_landmarks_px is None:
        confidence -= 0.25
    confidence -= 0.05 * len(warnings)
    confidence = max(0.1, min(confidence, 0.95))

    result = MeasurementResult(
        shoulder_width_cm=measurements.get("shoulder_width_cm"),
        chest_cm=measurements.get("chest_cm"),
        waist_cm=measurements.get("waist_cm"),
        hip_cm=measurements.get("hip_cm"),
        arm_length_cm=measurements.get("arm_length_cm"),
        leg_length_cm=measurements.get("leg_length_cm"),
        body_shape=measurements.get("body_shape"),
        confidence_score=round(confidence, 3),
        warnings=warnings,
    )

    raw_landmarks = {
        "front": front_pose.landmarks_norm,
        "side": side_pose.landmarks_norm if side_landmarks_px is not None else None,
    }

    return EstimateResponse(success=True, measurements=result, raw_landmarks=raw_landmarks)
