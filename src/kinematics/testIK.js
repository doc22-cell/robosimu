import { inverseKinematics } from "./inverseKinematics";

console.log("====================================");
console.log("LR Mate 200iD - POSITION IK TEST");
console.log("====================================");

const targetPose = {
  x: 300,
  y: 100,
  z: 400,
};

console.log("Target position:");
console.log(targetPose);

const result = inverseKinematics(
  targetPose,
  [0, 0, 0, 0, 0, 0]
);

console.log("====================================");
console.log("IK RESULT");
console.log("====================================");

console.log("Success:");
console.log(result.success);

console.log("Joint angles:");
console.log(result.joints);

console.log("Iterations:");
console.log(result.iterations);

console.log("Final position:");
console.log(result.position);

console.log("Position error:");
console.log(result.positionError);

if (result.message) {
  console.log("Message:");
  console.log(result.message);
}