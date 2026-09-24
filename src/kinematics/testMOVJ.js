// ============================================================
// FANUC LR Mate 200iD - Program Parser
// Supports:
// HOME
// MOVJ J1,J2,J3,J4,J5,J6
// MOVL X,Y,Z,Rx,Ry,Rz
// ============================================================

export function parseProgramLine(line) {
  const trimmedLine = line.trim();

  // Ignore empty lines
  if (!trimmedLine) {
    return null;
  }

  // Ignore comments
  if (trimmedLine.startsWith("#")) {
    return null;
  }

  // ==========================================================
  // HOME COMMAND
  // ==========================================================

  if (trimmedLine.toUpperCase() === "HOME") {
    return {
      command: "HOME",
      joints: [0, 0, 0, 0, 0, 0],
    };
  }

  // ==========================================================
  // MOVJ COMMAND
  // ==========================================================

  if (trimmedLine.toUpperCase().startsWith("MOVJ")) {
    const valuesPart = trimmedLine.slice(4).trim();

    const values = valuesPart
      .split(",")
      .map((value) => Number(value.trim()));

    if (values.length !== 6) {
      throw new Error(
        "MOVJ requires exactly 6 joint angles."
      );
    }

    if (
      values.some(
        (value) => !Number.isFinite(value)
      )
    ) {
      throw new Error(
        "MOVJ contains an invalid joint angle."
      );
    }

    return {
      command: "MOVJ",
      joints: values,
    };
  }

  // ==========================================================
  // MOVL COMMAND
  // ==========================================================

  if (trimmedLine.toUpperCase().startsWith("MOVL")) {
    const valuesPart = trimmedLine.slice(4).trim();

    const values = valuesPart
      .split(",")
      .map((value) => Number(value.trim()));

    if (values.length !== 6) {
      throw new Error(
        "MOVL requires exactly 6 values: X,Y,Z,Rx,Ry,Rz."
      );
    }

    if (
      values.some(
        (value) => !Number.isFinite(value)
      )
    ) {
      throw new Error(
        "MOVL contains an invalid value."
      );
    }

    return {
      command: "MOVL",

      position: {
        x: values[0],
        y: values[1],
        z: values[2],
      },

      orientation: {
        rx: values[3],
        ry: values[4],
        rz: values[5],
      },
    };
  }

  // ==========================================================
  // UNKNOWN COMMAND
  // ==========================================================

  throw new Error(
    `Unsupported command: ${trimmedLine}`
  );
}


// ============================================================
// BACKWARD COMPATIBILITY
// ============================================================

export function parseMOVJ(line) {
  const result = parseProgramLine(line);

  if (!result) {
    return null;
  }

  if (result.command !== "MOVJ") {
    return null;
  }

  return result;
}