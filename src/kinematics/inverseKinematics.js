// ============================================================
// FANUC LR Mate 200iD - Inverse Kinematics
// Position-only IK: X, Y, Z
// ============================================================

import { forwardKinematics } from "./forwardKinematics";

// FANUC LR Mate 200iD joint limits
const JOINT_LIMITS = [
  [-170, 170],
  [-122.5, 122.5],
  [-210, 210],
  [-190, 190],
  [-125, 125],
  [-360, 360],
];

function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function radToDeg(radians) {
  return (radians * 180) / Math.PI;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ============================================================
// 3x3 linear solver
// ============================================================

function solve3x3(A, b) {
  const m = A.map((row, i) => [
    row[0],
    row[1],
    row[2],
    b[i],
  ]);

  for (let i = 0; i < 3; i++) {
    let pivot = i;

    for (let r = i + 1; r < 3; r++) {
      if (
        Math.abs(m[r][i]) >
        Math.abs(m[pivot][i])
      ) {
        pivot = r;
      }
    }

    if (Math.abs(m[pivot][i]) < 1e-12) {
      return null;
    }

    [m[i], m[pivot]] = [
      m[pivot],
      m[i],
    ];

    for (let r = i + 1; r < 3; r++) {
      const factor =
        m[r][i] / m[i][i];

      for (let c = i; c < 4; c++) {
        m[r][c] -=
          factor * m[i][c];
      }
    }
  }

  const x = [0, 0, 0];

  for (let i = 2; i >= 0; i--) {
    let value = m[i][3];

    for (let j = i + 1; j < 3; j++) {
      value -=
        m[i][j] * x[j];
    }

    x[i] =
      value / m[i][i];
  }

  return x;
}

// ============================================================
// Get XYZ position from FK
// ============================================================

function getPosition(jointAngles) {
  // IK stores angles in radians.
  // FK expects angles in degrees.
  const anglesInDegrees = jointAngles.map(
    (angle) => radToDeg(angle)
  );

  const T =
    forwardKinematics(
      anglesInDegrees
    );

  return [
    T[0][3],
    T[1][3],
    T[2][3],
  ];
}

// ============================================================
// Numerical position Jacobian
// ============================================================

function calculateJacobian(jointAngles) {
  // Use a slightly larger numerical step
  // for stable millimetre calculations.
  const delta = 0.001;

  const base =
    getPosition(jointAngles);

  const J = Array.from(
    { length: 3 },
    () => Array(6).fill(0)
  );

  for (let j = 0; j < 6; j++) {
    const changed = [
      ...jointAngles,
    ];

    changed[j] += delta;

    const position =
      getPosition(changed);

    J[0][j] =
      (position[0] - base[0]) /
      delta;

    J[1][j] =
      (position[1] - base[1]) /
      delta;

    J[2][j] =
      (position[2] - base[2]) /
      delta;
  }

  return J;
}

// ============================================================
// Position-only IK
// ============================================================

export function inverseKinematics(
  targetPose,
  initialAngles = [
    0,
    0,
    0,
    0,
    0,
    0,
  ]
) {
  const target = [
    Number(targetPose.x),
    Number(targetPose.y),
    Number(targetPose.z),
  ];

  if (
    target.some(
      (value) =>
        !Number.isFinite(value)
    )
  ) {
    throw new Error(
      "Invalid IK target position."
    );
  }

  // Start from supplied joint configuration.
  let q = initialAngles.map(
    (angle) =>
      degToRad(Number(angle))
  );

  const maxIterations = 1000;

  // Small damping.
  const damping = 0.01;

  const tolerance = 0.5;

  for (
    let iteration = 0;
    iteration < maxIterations;
    iteration++
  ) {
    const current =
      getPosition(q);

    const error = [
      target[0] - current[0],
      target[1] - current[1],
      target[2] - current[2],
    ];

    const errorMagnitude =
      Math.sqrt(
        error[0] ** 2 +
        error[1] ** 2 +
        error[2] ** 2
      );

    // ========================================================
    // Target reached
    // ========================================================

    if (
      errorMagnitude <
      tolerance
    ) {
      return {
        success: true,

        joints: q.map(
          (angle) =>
            radToDeg(angle)
        ),

        iterations: iteration,

        position: {
          x: current[0],
          y: current[1],
          z: current[2],
        },

        positionError:
          errorMagnitude,
      };
    }

    // ========================================================
    // Jacobian
    // ========================================================

    const J =
      calculateJacobian(q);

    // J transpose
    const JT = Array.from(
      { length: 6 },
      (_, i) => [
        J[0][i],
        J[1][i],
        J[2][i],
      ]
    );

    // J * J^T
    const JJT = Array.from(
      { length: 3 },
      () => [0, 0, 0]
    );

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        for (let k = 0; k < 6; k++) {
          JJT[r][c] +=
            J[r][k] *
            J[c][k];
        }
      }
    }

    // Damped least squares
    for (let i = 0; i < 3; i++) {
      JJT[i][i] +=
        damping * damping;
    }

    const y =
      solve3x3(
        JJT,
        error
      );

    if (!y) {
      break;
    }

    // ========================================================
    // Calculate joint changes
    // ========================================================

    const dq =
      JT.map(
        (row) =>
          row[0] * y[0] +
          row[1] * y[1] +
          row[2] * y[2]
      );

    // Maximum change per iteration
    const maxStep =
      degToRad(2);

    for (let i = 0; i < 6; i++) {
      const step =
        clamp(
          dq[i],
          -maxStep,
          maxStep
        );

      q[i] += step;

      // Apply joint limits
      q[i] = clamp(
        q[i],

        degToRad(
          JOINT_LIMITS[i][0]
        ),

        degToRad(
          JOINT_LIMITS[i][1]
        )
      );
    }
  }

  // ============================================================
  // Failed
  // ============================================================

  const finalPosition =
    getPosition(q);

  const finalError =
    Math.sqrt(
      (target[0] -
        finalPosition[0]) ** 2 +

      (target[1] -
        finalPosition[1]) ** 2 +

      (target[2] -
        finalPosition[2]) ** 2
    );

  return {
    success: false,

    joints: q.map(
      (angle) =>
        radToDeg(angle)
    ),

    iterations: maxIterations,

    position: {
      x: finalPosition[0],
      y: finalPosition[1],
      z: finalPosition[2],
    },

    positionError: finalError,

    message:
      "IK could not reach the requested XYZ position.",
  };
}