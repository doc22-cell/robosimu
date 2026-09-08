import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { useEffect, useState } from "react";
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

  const jogJoint = (
    jointIndex,
    direction
  ) => {
    const angleChangeDeg =
      stepSize * direction;

    const angleChange =
      THREE.MathUtils.degToRad(
        angleChangeDeg
      );

    setJointAngles((prev) => {
      const updated = [
        ...prev,
      ];

      const [
        minDeg,
        maxDeg,
      ] =
        jointLimits[jointIndex];

      const minRad =
        THREE.MathUtils.degToRad(
          minDeg
        );

      const maxRad =
        THREE.MathUtils.degToRad(
          maxDeg
        );

      const requested =
        updated[jointIndex] +
        angleChange;

      const clamped =
        THREE.MathUtils.clamp(
          requested,
          minRad,
          maxRad
        );

      updated[jointIndex] =
        clamped;

      console.log(
        `J${jointIndex + 1}:`,
        THREE.MathUtils
          .radToDeg(clamped)
          .toFixed(2),
        "degrees",
        clamped !== requested
          ? "(limit reached)"
          : ""
      );

      return updated;
    });
  };

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
      <button type="button" className="run-button">
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
      defaultValue={`# Robot program
# Add your code here...









`}
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