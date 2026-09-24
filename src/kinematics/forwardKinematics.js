import { DH_PARAMETERS } from "./dhParameters";

/**
 * Convert degrees to radians.
 */
function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Create a standard DH transformation matrix.
 *
 * Parameters:
 * theta = joint angle
 * d     = link offset
 * a     = link length
 * alpha = link twist
 */
function dhMatrix(theta, d, a, alpha) {
  const t = degToRad(theta);
  const al = degToRad(alpha);

  const ct = Math.cos(t);
  const st = Math.sin(t);
  const ca = Math.cos(al);
  const sa = Math.sin(al);

  return [
    [ct, -st * ca, st * sa, a * ct],
    [st, ct * ca, -ct * sa, a * st],
    [0, sa, ca, d],
    [0, 0, 0, 1],
  ];
}

/**
 * Multiply two 4x4 matrices.
 */
function multiplyMatrices(A, B) {
  const result = Array.from({ length: 4 }, () => Array(4).fill(0));

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  return result;
}

/**
 * Forward Kinematics for FANUC LR Mate 200iD.
 *
 * Input:
 * [J1, J2, J3, J4, J5, J6] in degrees
 *
 * Output:
 * 4x4 homogeneous transformation matrix.
 */
export function forwardKinematics(jointAngles) {
  if (!Array.isArray(jointAngles) || jointAngles.length !== 6) {
    throw new Error("forwardKinematics requires 6 joint angles.");
  }

  let T = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];

  for (let i = 0; i < 6; i++) {
    const joint = DH_PARAMETERS[i];

    const theta =
      jointAngles[i] + joint.thetaOffset;

    const currentTransform = dhMatrix(
      theta,
      joint.d,
      joint.a,
      joint.alpha
    );

    T = multiplyMatrices(T, currentTransform);
  }

  return T;
}

/**
 * Extract XYZ position from a transformation matrix.
 *
 * Returns millimetres.
 */
export function getPosition(T) {
  return {
    x: T[0][3],
    y: T[1][3],
    z: T[2][3],
  };
}

/**
 * Return the complete FK result.
 */
export function calculateFK(jointAngles) {
  const transformation = forwardKinematics(jointAngles);

  const position = getPosition(transformation);

  return {
    jointAngles,
    transformation,
    position,
  };
}