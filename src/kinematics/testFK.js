import { calculateFK } from "./forwardKinematics";

const home = calculateFK([0, 0, 0, 0, 0, 0]);

console.log("=== LR Mate 200iD Forward Kinematics ===");

console.log("Joint angles:");
console.log(home.jointAngles);

console.log("Transformation matrix:");
console.table(home.transformation);

console.log("End effector position:");
console.log(home.position);