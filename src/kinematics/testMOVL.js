import { parseProgramLine } from "./movjParser";

console.log("=== MOVL PARSER TEST ===");

const command = "MOVL 300,100,400,0,0,0";

const result = parseProgramLine(command);

console.log("Input:");
console.log(command);

console.log("Parsed result:");
console.log(result);