"""
Converts MediaPipe pose landmarks into estimated real-world body
measurements, using the user's self-reported height as the scale
reference (pixels -> centimeters).

IMPORTANT: these are geometric estimates from 2D images, not medical-grade
measurements. Circumferences (chest/waist/hip) are approximated using an
ellipse model that combines front-view width and side-view depth, which
is the standard low-cost approach when no depth sensor or 3D mesh model
(e.g. PARE/ROMP) is available.
"""
import math

# A person's actual height is measured head-to-heel, but the nose landmark
# sits below the top of the skull. This factor compensates for that gap
# based on average human head proportions (~12-13% of total height).
HEAD_TOP_OFFSET_FACTOR = 1.13


def _distance(p1, p2):
    return math.hypot(p1[0] - p2[0], p1[1] - p2[1])


def _midpoint(p1, p2):
    return ((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2)


def _ellipse_circumference(half_width, half_depth):
    """Ramanujan's approximation for ellipse circumference."""
    a, b = half_width, half_depth
    if a <= 0 or b <= 0:
        return None
    h = ((a - b) ** 2) / ((a + b) ** 2)
    return math.pi * (a + b) * (1 + (3 * h) / (10 + math.sqrt(4 - 3 * h)))


def compute_scale_cm_per_px(front_landmarks_px: dict, height_cm: float) -> float | None:
    """Derive a cm-per-pixel scale using nose-to-heel pixel distance."""
    try:
        nose = front_landmarks_px["nose"]
        left_heel = front_landmarks_px["left_heel"]
        right_heel = front_landmarks_px["right_heel"]
    except KeyError:
        return None

    heel_y = (left_heel[1] + right_heel[1]) / 2
    pixel_height = abs(heel_y - nose[1]) * HEAD_TOP_OFFSET_FACTOR

    if pixel_height <= 0:
        return None

    return height_cm / pixel_height


def classify_body_shape(shoulder_cm: float, waist_cm: float, hip_cm: float) -> str:
    """Simple ratio-based classification. Thresholds are heuristic starting
    points and should be tuned against real labeled data over time."""
    shoulder_hip_diff = abs(shoulder_cm - hip_cm) / max(shoulder_cm, hip_cm)
    waist_to_hip = waist_cm / hip_cm if hip_cm else 1
    waist_to_shoulder = waist_cm / shoulder_cm if shoulder_cm else 1
    shoulder_hip_ratio = shoulder_cm / hip_cm if hip_cm else 1

    # Hourglass: shoulders and hips are balanced, waist is slim.
    if shoulder_hip_diff < 0.05 and waist_to_hip < 0.80 and waist_to_shoulder < 0.80:
        return "hourglass"

    # Square: shoulders and hips are balanced, waist is also balanced.
    if shoulder_hip_diff < 0.05 and 0.85 <= waist_to_hip <= 1.05 and 0.85 <= waist_to_shoulder <= 1.05:
        return "square"

    # Inverted triangle: shoulders noticeably wider than hips.
    if shoulder_hip_ratio > 1.05 and waist_to_hip < 0.95:
        return "inverted_triangle"

    # Triangle: hips noticeably wider than shoulders.
    if shoulder_hip_ratio < 0.95 and waist_to_shoulder < 0.95:
        return "triangle"

    # Oval: waist is proportionally larger than both hips and shoulders.
    if waist_to_hip > 1.05 and waist_to_shoulder > 1.05:
        return "oval"

    # Rectangle: limbs may be balanced, but waist is neither narrow enough for
    # hourglass nor wide enough for oval; shoulders and hips are not strongly
    # skewed.
    return "rectangle"


def estimate_measurements(
    front_landmarks_px: dict,
    side_landmarks_px: dict | None,
    height_cm: float,
) -> tuple[dict, list[str]]:
    warnings: list[str] = []

    scale = compute_scale_cm_per_px(front_landmarks_px, height_cm)
    if scale is None:
        return {}, ["Could not determine scale from front image; measurements unavailable."]

    result = {}

    # Shoulder width
    l_shoulder = front_landmarks_px["left_shoulder"]
    r_shoulder = front_landmarks_px["right_shoulder"]
    shoulder_width_px = _distance(l_shoulder, r_shoulder)
    result["shoulder_width_cm"] = round(shoulder_width_px * scale, 1)

    # Hip width
    l_hip = front_landmarks_px["left_hip"]
    r_hip = front_landmarks_px["right_hip"]
    hip_width_px = _distance(l_hip, r_hip)
    result["hip_width_cm"] = round(hip_width_px * scale, 1)

    # Arm length: shoulder -> elbow -> wrist (average of both sides)
    arm_lengths = []
    for side in ("left", "right"):
        shoulder = front_landmarks_px[f"{side}_shoulder"]
        elbow = front_landmarks_px[f"{side}_elbow"]
        wrist = front_landmarks_px[f"{side}_wrist"]
        arm_lengths.append(_distance(shoulder, elbow) + _distance(elbow, wrist))
    result["arm_length_cm"] = round((sum(arm_lengths) / len(arm_lengths)) * scale, 1)

    # Leg length: hip -> knee -> ankle (average of both sides)
    leg_lengths = []
    for side in ("left", "right"):
        hip = front_landmarks_px[f"{side}_hip"]
        knee = front_landmarks_px[f"{side}_knee"]
        ankle = front_landmarks_px[f"{side}_ankle"]
        leg_lengths.append(_distance(hip, knee) + _distance(knee, ankle))
    result["leg_length_cm"] = round((sum(leg_lengths) / len(leg_lengths)) * scale, 1)

    # Chest/waist circumference need a depth measurement from the side photo.
    # Without it, fall back to a width-only cylindrical approximation and
    # flag lower confidence.
    if side_landmarks_px:
        side_scale = compute_scale_cm_per_px(side_landmarks_px, height_cm)
        if side_scale:
            side_shoulder = side_landmarks_px.get("left_shoulder") or side_landmarks_px.get(
                "right_shoulder"
            )
            side_hip = side_landmarks_px.get("left_hip") or side_landmarks_px.get("right_hip")
            # Approximate torso depth as a fraction of the shoulder-to-hip
            # pixel span in the side profile; a rough but standard proxy
            # when true depth sensing isn't available.
            torso_span_px = _distance(side_shoulder, side_hip) if side_shoulder and side_hip else None

            if torso_span_px:
                chest_depth_cm = torso_span_px * side_scale * 0.35
                waist_depth_cm = torso_span_px * side_scale * 0.30

                chest_half_width = result["shoulder_width_cm"] / 2 * 0.9
                waist_half_width = (result["shoulder_width_cm"] + result["hip_width_cm"]) / 4 * 0.85

                chest_circ = _ellipse_circumference(chest_half_width, chest_depth_cm / 2)
                waist_circ = _ellipse_circumference(waist_half_width, waist_depth_cm / 2)

                result["chest_cm"] = round(chest_circ, 1) if chest_circ else None
                result["waist_cm"] = round(waist_circ, 1) if waist_circ else None
            else:
                warnings.append("Side image landmarks incomplete; chest/waist skipped.")
        else:
            warnings.append("Could not scale side image; chest/waist skipped.")
    else:
        warnings.append("No side image provided; chest/waist circumference not estimated.")

    # Hip circumference approximated from front hip width alone (lower confidence)
    hip_circ = _ellipse_circumference(result["hip_width_cm"] / 2, result["hip_width_cm"] / 2 * 0.75)
    result["hip_cm"] = round(hip_circ, 1) if hip_circ else None

    if result.get("chest_cm") and result.get("waist_cm") and result.get("hip_cm"):
        result["body_shape"] = classify_body_shape(
            result["shoulder_width_cm"], result["waist_cm"], result["hip_cm"]
        )
    else:
        result["body_shape"] = None
        warnings.append("Insufficient data for body shape classification.")

    return result, warnings
