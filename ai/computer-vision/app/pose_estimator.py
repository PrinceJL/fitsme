"""
Thin wrapper around MediaPipe Pose.

Responsible only for: given an image (as a numpy BGR array), return the
detected pose landmarks in both normalized (0-1) and pixel coordinates.
No measurement math lives here - see measurements.py for that.
"""
from dataclasses import dataclass

import cv2
import mediapipe as mp
import numpy as np

mp_pose = mp.solutions.pose

# Landmark indices we care about, named for readability everywhere else.
LANDMARK_NAMES = {
    "nose": mp_pose.PoseLandmark.NOSE,
    "left_shoulder": mp_pose.PoseLandmark.LEFT_SHOULDER,
    "right_shoulder": mp_pose.PoseLandmark.RIGHT_SHOULDER,
    "left_elbow": mp_pose.PoseLandmark.LEFT_ELBOW,
    "right_elbow": mp_pose.PoseLandmark.RIGHT_ELBOW,
    "left_wrist": mp_pose.PoseLandmark.LEFT_WRIST,
    "right_wrist": mp_pose.PoseLandmark.RIGHT_WRIST,
    "left_hip": mp_pose.PoseLandmark.LEFT_HIP,
    "right_hip": mp_pose.PoseLandmark.RIGHT_HIP,
    "left_knee": mp_pose.PoseLandmark.LEFT_KNEE,
    "right_knee": mp_pose.PoseLandmark.RIGHT_KNEE,
    "left_ankle": mp_pose.PoseLandmark.LEFT_ANKLE,
    "right_ankle": mp_pose.PoseLandmark.RIGHT_ANKLE,
    "left_heel": mp_pose.PoseLandmark.LEFT_HEEL,
    "right_heel": mp_pose.PoseLandmark.RIGHT_HEEL,
}

MIN_VISIBILITY = 0.5


@dataclass
class PoseResult:
    success: bool
    landmarks_px: dict  # name -> (x_px, y_px, visibility)
    landmarks_norm: dict  # name -> (x_norm, y_norm, z_norm, visibility)
    image_width: int
    image_height: int
    error: str | None = None


def decode_image(image_bytes: bytes) -> np.ndarray | None:
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    return image


def estimate_pose(image_bytes: bytes) -> PoseResult:
    image = decode_image(image_bytes)
    if image is None:
        return PoseResult(False, {}, {}, 0, 0, error="Could not decode image.")

    height, width = image.shape[:2]
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    with mp_pose.Pose(
        static_image_mode=True,
        model_complexity=2,
        enable_segmentation=False,
        min_detection_confidence=0.5,
    ) as pose:
        results = pose.process(image_rgb)

    if not results.pose_landmarks:
        return PoseResult(
            False, {}, {}, width, height, error="No person detected in image."
        )

    landmarks_px = {}
    landmarks_norm = {}
    low_confidence_points = []

    for name, idx in LANDMARK_NAMES.items():
        lm = results.pose_landmarks.landmark[idx]
        landmarks_norm[name] = (lm.x, lm.y, lm.z, lm.visibility)
        landmarks_px[name] = (lm.x * width, lm.y * height, lm.visibility)
        if lm.visibility < MIN_VISIBILITY:
            low_confidence_points.append(name)

    return PoseResult(
        success=True,
        landmarks_px=landmarks_px,
        landmarks_norm=landmarks_norm,
        image_width=width,
        image_height=height,
        error=(
            f"Low confidence on: {', '.join(low_confidence_points)}"
            if low_confidence_points
            else None
        ),
    )
