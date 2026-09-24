import { calculateFK } from "./kinematics/forwardKinematics";
import { parseProgramLine } from "./kinematics/movjParser";
import { inverseKinematics } from "./kinematics/inverseKinematics";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import URDFLoader from "urdf-loader";
import "./App.css";






// ============================================================
// 3D ENVIRONMENT
// ============================================================

function Environment({ position, rotation, jointAngles }) {
  return (
    <Canvas camera={{ position: [1.9, 1.4, 2.3], fov: 45 }}>
      <ambientLight intensity={1} />

      <directionalLight
        position={[5, 8, 5]}
        intensity={2}
      />

      <Grid
        args={[10, 10]}
        cellSize={0.25}
        cellThickness={0.5}
        sectionSize={1}
        sectionThickness={1}
        fadeDistance={20}
        infiniteGrid
      />

      <RobotModel
        position={position}
        rotation={rotation}
        jointAngles={jointAngles}
      />

      <OrbitControls />
    </Canvas>
  );
}

// ============================================================
// FANUC LR MATE 200iD URDF ROBOT
// ============================================================

function RobotModel({ position, rotation, jointAngles }) {
  const [robot, setRobot] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const BASE_URL = import.meta.env.BASE_URL;

    const manager = new THREE.LoadingManager();

    manager.onError = (url) => {
      console.error("Failed to load:", url);
    };

    const loader = new URDFLoader(manager);

    // ========================================================
    // FANUC PACKAGE PATH
    // ========================================================
    //
    // package://LRMate-200iD/meshes/...
    //
    // resolves to:
    //
    // /robosimu/fanuc/meshes/...
    //
    // when deployed on GitHub Pages.
    //
    loader.packages = {
      "LRMate-200iD": `${BASE_URL}fanuc/`,
    };

    // ========================================================
    // STL MESH LOADER
    // ========================================================

    loader.loadMeshCb = (path, manager, material, onComplete) => {
      const extension = path
        .split("?")[0]
        .split(".")
        .pop()
        .toLowerCase();

      if (extension !== "stl") {
        console.warn("Unsupported mesh format:", path);
        onComplete(null);
        return;
      }

      const stlLoader = new STLLoader(manager);

      stlLoader.load(
        path,
        (geometry) => {
          const fileName = path
            .split("/")
            .pop()
            .toLowerCase();

          let meshMaterial;

          // FANUC base
          if (fileName === "base.stl") {
            meshMaterial = new THREE.MeshStandardMaterial({
              color: 0x222222,
              metalness: 0.4,
              roughness: 0.55,
            });
          }

          // FANUC J4 / wrist section
          else if (fileName === "j4.stl") {
            meshMaterial = new THREE.MeshStandardMaterial({
              color: 0x888888,
              metalness: 0.4,
              roughness: 0.55,
            });
          }

          // Remaining FANUC links
          else {
            meshMaterial = new THREE.MeshStandardMaterial({
              color: 0xffd500,
              metalness: 0.25,
              roughness: 0.65,
            });
          }

          const mesh = new THREE.Mesh(
            geometry,
            meshMaterial
          );

          mesh.castShadow = true;
          mesh.receiveShadow = true;

          onComplete(mesh);
        },

        undefined,

        (error) => {
          console.error(
            "FANUC STL mesh error:",
            path,
            error
          );

          onComplete(null, error);
        }
      );
    };

    // ========================================================
    // LOAD FANUC URDF
    // ========================================================

    const urdfPath =
      `${BASE_URL}fanuc/urdf/urdf/LRMate-200iD.urdf`;

    console.log(
      "Loading FANUC LR Mate 200iD URDF:",
      urdfPath
    );

    loader.load(
      urdfPath,

      (loadedRobot) => {
        if (cancelled) return;

        console.log(
          "===================================="
        );

        console.log(
          "FANUC LR MATE 200iD LOADED"
        );

        console.log(
          "===================================="
        );

        console.log("Robot joints:");

        Object.keys(loadedRobot.joints).forEach(
          (jointName) => {
            console.log(jointName);
          }
        );

        console.log(
          "===================================="
        );

        setRobot(loadedRobot);
      },

      undefined,

      (error) => {
        console.error(
          "FANUC URDF loading error:",
          error
        );
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // APPLY J1-J6 ANGLES
  // ============================================================

  useEffect(() => {
    if (!robot) return;

    const jointNames = [
      "J1",
      "J2",
      "J3",
      "J4",
      "J5",
      "J6",
    ];

    jointNames.forEach(
      (jointName, index) => {
        const joint =
          robot.joints[jointName];

        if (joint) {
          joint.setJointValue(
            jointAngles[index]
          );
        } else {
          console.warn(
            `FANUC joint not found: ${jointName}`
          );
        }
      }
    );
  }, [robot, jointAngles]);

  if (!robot) {
    return null;
  }

  // ==========================================================
  // ROBOT TRANSFORMATION
  // ==========================================================
  //
  // FANUC URDF uses Z as the vertical axis.
  // Three.js scene uses Y as the vertical axis.
  //
  // Rotating -90 degrees around X converts:
  //
  // Z-up  ->  Y-up
  //
  // This makes the robot stand on the floor.
  //
  return (
    <group
      position={position}
      rotation={rotation}
    >
      <primitive
        object={robot}
        scale={1.5}
      />
    </group>
  );
}

// ============================================================
// MAIN APP
// ============================================================

function App() {
  // ==========================================================
  // ROBOT STATE
  // ==========================================================

  const [position, setPosition] = useState([
    0,
    0,
    0,
  ]);

  // IMPORTANT:
  // Start with the FANUC model rotated from Z-up to Y-up.
  //
  // -Math.PI / 2 = -90 degrees around X.
  //
  const [rotation, setRotation] = useState([
    -Math.PI / 2,
    0,
    0,
  ]);

  const [pose, setPose] = useState({
    x: 350.25,
    y: 125.8,
    z: 420.1,
    rx: -2.45,
    ry: 15.3,
    rz: 90.0,
  });

  const [stepSize, setStepSize] =
    useState(10);

  const [speed, setSpeed] =
    useState(50);

  // J1-J6 angles in radians
  const [jointAngles, setJointAngles] =
    useState([
      0,
      0,
      0,
      0,
      0,
      0,
    ]);

  // Program Editor text
  const [programCode, setProgramCode] =
    useState(`# Robot program
# Add your code here...









`);

  // ==========================================================
  // CARTESIAN / ROTATIONAL JOG
  // ==========================================================

  const jog = (axis, direction) => {
    const amount =
      stepSize * direction;

    // --------------------------------------------------------
    // Update pose display
    // --------------------------------------------------------

    setPose((prev) => ({
      ...prev,
      [axis]:
        prev[axis] + amount,
    }));

    // --------------------------------------------------------
    // CARTESIAN MOVEMENT
    // --------------------------------------------------------

    if (axis === "x") {
      setPosition((prev) => [
        prev[0] + amount * 0.01,
        prev[1],
        prev[2],
      ]);
    }

    if (axis === "y") {
      setPosition((prev) => [
        prev[0],
        prev[1] + amount * 0.01,
        prev[2],
      ]);
    }

    if (axis === "z") {
      setPosition((prev) => [
        prev[0],
        prev[1],
        prev[2] + amount * 0.01,
      ]);
    }

    // --------------------------------------------------------
    // ROTATIONAL MOVEMENT
    // --------------------------------------------------------

    if (axis === "rx") {
      setRotation((prev) => [
        prev[0] +
          THREE.MathUtils.degToRad(
            amount
          ),
        prev[1],
        prev[2],
      ]);
    }

    if (axis === "ry") {
      setRotation((prev) => [
        prev[0],
        prev[1] +
          THREE.MathUtils.degToRad(
            amount
          ),
        prev[2],
      ]);
    }

    if (axis === "rz") {
      setRotation((prev) => [
        prev[0],
        prev[1],
        prev[2] +
          THREE.MathUtils.degToRad(
            amount
          ),
      ]);
    }
  };

  // ============================================================
  // FANUC JOINT LIMITS
  // ============================================================
  //
  // These are simulator limits based on the published total
  // motion ranges of the LR Mate 200iD.
  //
  // They are represented symmetrically around zero for this
  // simulator.
  //
  // J1 = 340°
  // J2 = 245°
  // J3 = 420°
  // J4 = 380°
  // J5 = 250°
  // J6 = 720°
  //
  const jointLimits = [
    [-170, 170],
    [-122.5, 122.5],
    [-210, 210],
    [-190, 190],
    [-125, 125],
    [-360, 360],
  ];

  // ============================================================
  // JOINT JOG
  // ============================================================

  // ============================================================
// SMOOTH JOINT JOG
// ============================================================
// The requested movement is divided into 1-degree steps.
//
// Example:
// 0° → 1° → 2° → 3° → ... → 30°
//
// Speed controls the delay between each 1-degree step.
// ============================================================

const jointAnimations = useRef(
  Array(6).fill(null)
);

const jogJoint = (
  jointIndex,
  direction
) => {
  const [minDeg, maxDeg] =
    jointLimits[jointIndex];

  // Current joint angle in degrees
  const currentAngleDeg =
    THREE.MathUtils.radToDeg(
      jointAngles[jointIndex]
    );

  // Target is one Step Size away
  const targetAngleDeg =
    THREE.MathUtils.clamp(
      currentAngleDeg +
        stepSize * direction,
      minDeg,
      maxDeg
    );

  // If already at the limit, do nothing.
  if (
    targetAngleDeg ===
    currentAngleDeg
  ) {
    console.log(
      `J${jointIndex + 1}: joint limit reached`
    );
    return;
  }

  // Cancel an existing animation on this joint.
  if (
    jointAnimations.current[
      jointIndex
    ]
  ) {
    clearInterval(
      jointAnimations.current[
        jointIndex
      ]
    );
  }

  // Direction of each 1-degree movement.
  const stepDirection =
    targetAngleDeg >
    currentAngleDeg
      ? 1
      : -1;

  // Slower, smoother movement.
  //
  // Speed 0   → 140 ms per degree
  // Speed 50  → 90 ms per degree
  // Speed 100 → 40 ms per degree
  //
  const stepDelay =
    Math.max(
      40,
      140 - speed
    );

  let nextAngle =
    currentAngleDeg;

  console.log(
    `J${jointIndex + 1} moving:`,
    `${currentAngleDeg.toFixed(0)}° → ${targetAngleDeg.toFixed(0)}°`
  );

  const timer =
    setInterval(() => {
      nextAngle +=
        stepDirection;

      // Do not go beyond the requested target.
      if (
        stepDirection > 0 &&
        nextAngle >
          targetAngleDeg
      ) {
        nextAngle =
          targetAngleDeg;
      }

      if (
        stepDirection < 0 &&
        nextAngle <
          targetAngleDeg
      ) {
        nextAngle =
          targetAngleDeg;
      }

      const nextAngleRadians =
        THREE.MathUtils.degToRad(
          nextAngle
        );

      setJointAngles(
        (previous) => {
          const updated = [
            ...previous,
          ];

          updated[jointIndex] =
            nextAngleRadians;

          jointAnglesRef.current = [...updated];

          return updated;
        }
      );

      console.log(
        `J${jointIndex + 1}: ${nextAngle.toFixed(0)}°`
      );

      // Target reached.
      if (
        nextAngle ===
        targetAngleDeg
      ) {
        clearInterval(timer);

        jointAnimations.current[
          jointIndex
        ] = null;

        console.log(
          `J${jointIndex + 1} reached ${targetAngleDeg.toFixed(0)}°`
        );
      }
    }, stepDelay);

  jointAnimations.current[
    jointIndex
  ] = timer;
};

  // ============================================================
  // SMOOTH MOVJ + SEQUENTIAL PROGRAM RUNNER
  // ============================================================

  const jointAnglesRef = useRef([0, 0, 0, 0, 0, 0]);
  const programRunningRef = useRef(false);

  const updateJointAngles = (angles) => {
    jointAnglesRef.current = [...angles];
    setJointAngles([...angles]);
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const animateMOVJ = async (targetDegrees) => {
    const currentDegrees = jointAnglesRef.current.map((angle) =>
      THREE.MathUtils.radToDeg(angle)
    );
    const nextDegrees = [...currentDegrees];
    const stepDelay = Math.max(40, 140 - speed);

    console.log('MOVJ:', currentDegrees, '→', targetDegrees);

    while (true) {
      let finished = true;

      for (let i = 0; i < 6; i++) {
        const difference = targetDegrees[i] - nextDegrees[i];
        if (Math.abs(difference) > 0.001) {
          finished = false;
          nextDegrees[i] += Math.sign(difference) * Math.min(1, Math.abs(difference));
        }
      }

      updateJointAngles(
        nextDegrees.map((angle) => THREE.MathUtils.degToRad(angle))
      );

      if (finished) break;
      await sleep(stepDelay);
    }

    updateJointAngles(
      targetDegrees.map((angle) => THREE.MathUtils.degToRad(angle))
    );
    console.log('MOVJ completed:', targetDegrees);
  };

  const runProgram = async () => {
    if (programRunningRef.current) {
      console.warn('Program is already running.');
      return;
    }

    const commands = [];
    const lines = programCode.split('\n');
    let insideBlockComment = false;

    lines.forEach((line, lineIndex) => {
      let cleanedLine = line.trim();

      if (insideBlockComment) {
        if (cleanedLine.includes('*/')) {
          insideBlockComment = false;
          cleanedLine = cleanedLine.split('*/')[1].trim();
        } else return;
      }

      if (cleanedLine.includes('/*')) {
        const beforeComment = cleanedLine.split('/*')[0].trim();
        const afterComment = cleanedLine.split('/*').slice(1).join('/*');
        if (afterComment.includes('*/')) {
          cleanedLine = beforeComment + ' ' + afterComment.split('*/').slice(1).join('*/').trim();
        } else {
          insideBlockComment = true;
          cleanedLine = beforeComment;
        }
      }

      cleanedLine = cleanedLine.split('#')[0].trim();
      if (!cleanedLine) return;

      try {
        const command = parseProgramLine(cleanedLine);
        if (command) commands.push({ command, lineIndex });
      } catch (error) {
        console.error(`Line ${lineIndex + 1}: ${error.message}`);
      }
    });

    if (insideBlockComment) {
      console.warn('Program contains an unclosed /* multi-line comment.');
    }

    if (commands.length === 0) {
      console.warn('No valid HOME, MOVJ, or MOVL command found.');
      return;
    }

    programRunningRef.current = true;
    console.log('PROGRAM STARTED');

    try {
      for (const { command, lineIndex } of commands) {
        console.log(`Executing line ${lineIndex + 1}:`, command.command);

        if (command.command === 'HOME' || command.command === 'MOVJ') {
          await animateMOVJ(command.joints);

          const fk = calculateFK(command.joints);
          console.log(`${command.command} completed from line ${lineIndex + 1}`);
          console.log('FK transformation:');
          console.table(fk.transformation);
          console.log('FK end-effector position (mm):');
          console.log(fk.position);
        } else if (command.command === 'MOVL') {
          console.log('Target position:', command.position);
          console.log('Target orientation:', command.orientation);

          const currentAngles = jointAnglesRef.current.map((angle) =>
            THREE.MathUtils.radToDeg(angle)
          );

          const ikResult = inverseKinematics(
            { x: command.position.x, y: command.position.y, z: command.position.z },
            currentAngles
          );

          console.log('IK result:', ikResult);

          if (ikResult.success) {
            console.log('IK SUCCESS - Moving robot');
            await animateMOVJ(ikResult.joints);
            console.log('MOVL completed.');
            console.log('Final IK position:', ikResult.position);
            console.log('Position error:', ikResult.positionError, 'mm');
          } else {
            console.error('IK FAILED:', ikResult.message);
            console.error('IK result:', ikResult);
          }
        }

        console.log(`Line ${lineIndex + 1} completed.`);
      }

      console.log('PROGRAM COMPLETED');
    } finally {
      programRunningRef.current = false;
    }
  };

  useEffect(() => {
    return () => {


      // The program runner uses async/await + sleep(),
      // The program runner uses async/await + sleep(), so no program timer is stored here.
      programRunningRef.current = false;

      // Clean up any active manual joint jog timers.

      jointAnimations.current.forEach((timer, index) => {
        if (timer) {
          clearInterval(timer);
          jointAnimations.current[index] = null;
        }
      });
    };
  }, []);

  // ============================================================
  // JSX
  // ============================================================

  return (
    <div className="app">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        <div className="logo">
          🤖

          <div>
            <strong>
              Robot Jog Control
            </strong>

            <span>
              6-Axis Robot Simulation
            </span>
          </div>
        </div>

        <nav>

          <button>
            ▦
            <span>
              Dashboard
            </span>
          </button>

          <button className="active">
            ⌘
            <span>
              Jog Control
            </span>
          </button>

          <button>
            ◎
            <span>
              Position
            </span>
          </button>

          <button>
            ◈
            <span>
              I/O Monitor
            </span>
          </button>

          <button>
            ⚙
            <span>
              Settings
            </span>
          </button>

          <button>
            ⓘ
            <span>
              About
            </span>
          </button>

        </nav>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="main">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="header">

          <div>

            <h1>
              Jog Control
            </h1>

            <p>
              Manually control the robot position
            </p>

          </div>

          <div className="connection">

            <span className="dot"></span>

            Connected

          </div>

        </header>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <section className="content">

          {/* =================================================
              3D ENVIRONMENT
          ================================================= */}

          <div className="environment card">

            <div className="card-header">

              <h2>
                3D Environment
              </h2>

              <button>
                ⛶
              </button>

            </div>

            <div className="canvas-container">

              <Environment
                position={position}
                rotation={rotation}
                jointAngles={
                  jointAngles
                }
              />

            </div>

          </div>

          {/* =================================================
              CONTROLS
          ================================================= */}

          <div className="controls card">
            {/* PROGRAM EDITOR */}
<div className="program-editor">
  <div className="program-editor-header">
    <h2>Program Editor</h2>

    <div className="program-editor-actions">
      <button type="button">📄 New</button>
      <button type="button">📂 Open</button>
      <button type="button">💾 Save</button>
      <button
        type="button"
        className="run-button"
        onClick={runProgram}
      >
        ▶ Run
      </button>
    </div>
  </div>

  <div className="code-editor">
    <div className="line-numbers">
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i}>{i + 1}</span>
      ))}
    </div>

    <textarea
      className="program-code"
      value={programCode}
      onChange={(e) => setProgramCode(e.target.value)}
      spellCheck="false"
    />
  </div>
</div>

            <div className="card-header">

              <h2>
                Manual Jog Control
              </h2>

              <select>

                <option>
                  Manual Mode
                </option>

                <option>
                  Auto Mode
                </option>

              </select>

            </div>

            {/* ===============================================
                CARTESIAN JOG
            =============================================== */}

            <div className="control-section">

              <h3>
                Cartesian Jog
              </h3>

              <div className="button-grid">

                <button
                  className="x"
                  onClick={() =>
                    jog("x", -1)
                  }
                >
                  X−
                </button>

                <button
                  className="x"
                  onClick={() =>
                    jog("x", 1)
                  }
                >
                  X+
                </button>

                <button
                  className="y"
                  onClick={() =>
                    jog("y", -1)
                  }
                >
                  Y−
                </button>

                <button
                  className="y"
                  onClick={() =>
                    jog("y", 1)
                  }
                >
                  Y+
                </button>

                <button
                  className="z"
                  onClick={() =>
                    jog("z", -1)
                  }
                >
                  Z−
                </button>

                <button
                  className="z"
                  onClick={() =>
                    jog("z", 1)
                  }
                >
                  Z+
                </button>

              </div>

            </div>

        

        

            {/* ===============================================
                JOINT JOG
            =============================================== */}

            <div className="control-section">

              <h3>
                Joint Jog
              </h3>

              <div className="button-grid">

                <button
                  className="joint"
                  onClick={() =>
                    jogJoint(0, -1)
                  }
                >
                  J1−
                </button>

                <button
                  className="joint"
                  onClick={() =>
                    jogJoint(0, 1)
                  }
                >
                  J1+
                </button>

                <button
                  className="joint"
                  onClick={() =>
                    jogJoint(1, -1)
                  }
                >
                  J2−
                </button>

                <button
                  className="joint"
                  onClick={() =>
                    jogJoint(1, 1)
                  }
                >
                  J2+
                </button>

                <button
                  className="joint"
                  onClick={() =>
                    jogJoint(2, -1)
                  }
                >
                  J3−
                </button>

                <button
                  className="joint"
                  onClick={() =>
                    jogJoint(2, 1)
                  }
                >
                  J3+
                </button>

                <button
                  className="joint"
                  onClick={() =>
                    jogJoint(3, -1)
                  }
                >
                  J4−
                </button>

                <button
                  className="joint"
                  onClick={() =>
                    jogJoint(3, 1)
                  }
                >
                  J4+
                </button>

                <button
                  className="joint"
                  onClick={() =>
                    jogJoint(4, -1)
                  }
                >
                  J5−
                </button>

                <button
                  className="joint"
                  onClick={() =>
                    jogJoint(4, 1)
                  }
                >
                  J5+
                </button>

                <button
                  className="joint"
                  onClick={() =>
                    jogJoint(5, -1)
                  }
                >
                  J6−
                </button>

                <button
                  className="joint"
                  onClick={() =>
                    jogJoint(5, 1)
                  }
                >
                  J6+
                </button>

              </div>

            </div>

            {/* ===============================================
                SETTINGS
            =============================================== */}

            <div className="settings-row">

              <div>

                <label>
                  Step Size
                </label>

                <select
                  value={stepSize}
                  onChange={(e) =>
                    setStepSize(
                      Number(
                        e.target.value
                      )
                    )
                  }
                >

                  <option value={10}>
                    10 mm / °
                  </option>

                  <option value={5}>
                    5 mm / °
                  </option>

                  <option value={1}>
                    1 mm / °
                  </option>

                </select>

              </div>

              <div className="speed">

                <label>
                  Speed
                </label>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={speed}
                  onChange={(e) =>
                    setSpeed(
                      Number(
                        e.target.value
                      )
                    )
                  }
                />

                <span>
                  {speed}%
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            CURRENT POSE
        =================================================== */}

        <section className="pose card">

          <h2>
            Current Pose
          </h2>

          <div className="pose-grid">

            <div>
              <span>
                X
              </span>

              <strong>
                {pose.x.toFixed(2)}
              </strong>

              <small>
                mm
              </small>
            </div>

            <div>
              <span>
                Y
              </span>

              <strong>
                {pose.y.toFixed(2)}
              </strong>

              <small>
                mm
              </small>
            </div>

            <div>
              <span>
                Z
              </span>

              <strong>
                {pose.z.toFixed(2)}
              </strong>

              <small>
                mm
              </small>
            </div>

            <div>
              <span>
                Rx
              </span>

              <strong>
                {pose.rx.toFixed(2)}
              </strong>

              <small>
                °
              </small>
            </div>

            <div>
              <span>
                Ry
              </span>

              <strong>
                {pose.ry.toFixed(2)}
              </strong>

              <small>
                °
              </small>
            </div>

            <div>
              <span>
                Rz
              </span>

              <strong>
                {pose.rz.toFixed(2)}
              </strong>

              <small>
                °
              </small>
            </div>

          </div>

        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer>

          <span>
            Robot Status:
            <strong>
              {" "}Idle
            </strong>
          </span>

          <span className="ros">
            ● ROS2 Connected
          </span>

        </footer>

      </main>

    </div>
  );
}

export default App;