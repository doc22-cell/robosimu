import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, useGLTF } from "@react-three/drei";
import { useState } from "react";
import * as THREE from "three";
import "./App.css";

function Environment({ position, rotation }) {
  return (
    <Canvas camera={{ position: [5, 4, 6], fov: 45 }}>
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
      />

      <OrbitControls />
    </Canvas>
  );
}

function RobotModel({ position, rotation }) {
  const { scene } = useGLTF("/models/robot.glb");

  return (
    <group
      position={position}
      rotation={rotation}
    >
      <primitive
        object={scene}
        scale={2}
      />
    </group>
  );
}

function App() {
  // =========================
  // ROBOT STATE
  // =========================

  const [position, setPosition] = useState([0, 0, 0]);

  const [rotation, setRotation] = useState([0, 0, 0]);

  const [pose, setPose] = useState({
    x: 350.25,
    y: 125.80,
    z: 420.10,
    rx: -2.45,
    ry: 15.30,
    rz: 90.00
  });

  const [stepSize, setStepSize] = useState(10);

  const [speed, setSpeed] = useState(50);

  // =========================
  // JOG FUNCTION
  // =========================

  const jog = (axis, direction) => {
    const amount = stepSize * direction;

    // Update pose display
    setPose((prev) => ({
      ...prev,
      [axis]: prev[axis] + amount
    }));

    // =========================
    // CARTESIAN MOVEMENT
    // =========================

    if (axis === "x") {
      setPosition((prev) => [
        prev[0] + amount * 0.01,
        prev[1],
        prev[2]
      ]);
    }

    if (axis === "y") {
      setPosition((prev) => [
        prev[0],
        prev[1] + amount * 0.01,
        prev[2]
      ]);
    }

    if (axis === "z") {
      setPosition((prev) => [
        prev[0],
        prev[1],
        prev[2] + amount * 0.01
      ]);
    }

    // =========================
    // ROTATIONAL MOVEMENT
    // =========================

    if (axis === "rx") {
      setRotation((prev) => [
        prev[0] + THREE.MathUtils.degToRad(amount),
        prev[1],
        prev[2]
      ]);
    }

    if (axis === "ry") {
      setRotation((prev) => [
        prev[0],
        prev[1] + THREE.MathUtils.degToRad(amount),
        prev[2]
      ]);
    }

    if (axis === "rz") {
      setRotation((prev) => [
        prev[0],
        prev[1],
        prev[2] + THREE.MathUtils.degToRad(amount)
      ]);
    }
  };

  // =========================
  // JSX
  // =========================

  return (
    <div className="app">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">

        <div className="logo">
          🤖

          <div>
            <strong>Robot Jog Control</strong>
            <span>6-Axis Robot Simulation</span>
          </div>
        </div>

        <nav>

          <button>
            ▦ <span>Dashboard</span>
          </button>

          <button className="active">
            ⌘ <span>Jog Control</span>
          </button>

          <button>
            ◎ <span>Position</span>
          </button>

          <button>
            ◈ <span>I/O Monitor</span>
          </button>

          <button>
            ⚙ <span>Settings</span>
          </button>

          <button>
            ⓘ <span>About</span>
          </button>

        </nav>

      </aside>


      {/* =========================
          MAIN
      ========================= */}

      <main className="main">

        {/* HEADER */}

        <header className="header">

          <div>
            <h1>Jog Control</h1>

            <p>
              Manually control the robot position
            </p>
          </div>

          <div className="connection">

            <span className="dot"></span>

            Connected

          </div>

        </header>


        {/* =========================
            CONTENT
        ========================= */}

        <section className="content">


          {/* =========================
              3D ENVIRONMENT
          ========================= */}

          <div className="environment card">

            <div className="card-header">

              <h2>3D Environment</h2>

              <button>⛶</button>

            </div>

            <div className="canvas-container">

              <Environment
                position={position}
                rotation={rotation}
              />

            </div>

          </div>


          {/* =========================
              CONTROLS
          ========================= */}

          <div className="controls card">

            <div className="card-header">

              <h2>Manual Jog Control</h2>

              <select>
                <option>Manual Mode</option>
                <option>Auto Mode</option>
              </select>

            </div>


            {/* =========================
                CARTESIAN JOG
            ========================= */}

            <div className="control-section">

              <h3>Cartesian Jog</h3>

              <div className="button-grid">

                <button
                  className="x"
                  onClick={() => jog("x", -1)}
                >
                  X−
                </button>

                <button
                  className="x"
                  onClick={() => jog("x", 1)}
                >
                  X+
                </button>


                <button
                  className="y"
                  onClick={() => jog("y", -1)}
                >
                  Y−
                </button>

                <button
                  className="y"
                  onClick={() => jog("y", 1)}
                >
                  Y+
                </button>


                <button
                  className="z"
                  onClick={() => jog("z", -1)}
                >
                  Z−
                </button>

                <button
                  className="z"
                  onClick={() => jog("z", 1)}
                >
                  Z+
                </button>

              </div>

            </div>


            {/* =========================
                ROTATIONAL JOG
            ========================= */}

            <div className="control-section">

              <h3>Rotational Jog</h3>

              <div className="button-grid">

                <button
                  className="rx"
                  onClick={() => jog("rx", -1)}
                >
                  Rx−
                </button>

                <button
                  className="rx"
                  onClick={() => jog("rx", 1)}
                >
                  Rx+
                </button>


                <button
                  className="ry"
                  onClick={() => jog("ry", -1)}
                >
                  Ry−
                </button>

                <button
                  className="ry"
                  onClick={() => jog("ry", 1)}
                >
                  Ry+
                </button>


                <button
                  className="rz"
                  onClick={() => jog("rz", -1)}
                >
                  Rz−
                </button>

                <button
                  className="rz"
                  onClick={() => jog("rz", 1)}
                >
                  Rz+
                </button>

              </div>

            </div>


            {/* =========================
                JOINT JOG
            ========================= */}

            <div className="control-section">

              <h3>Joint Jog</h3>

              <div className="button-grid">

                <button className="joint">
                  J1−
                </button>

                <button className="joint">
                  J1+
                </button>

                <button className="joint">
                  J2−
                </button>

                <button className="joint">
                  J2+
                </button>

                <button className="joint">
                  J3−
                </button>

                <button className="joint">
                  J3+
                </button>

                <button className="joint">
                  J4−
                </button>

                <button className="joint">
                  J4+
                </button>

                <button className="joint">
                  J5−
                </button>

                <button className="joint">
                  J5+
                </button>

                <button className="joint">
                  J6−
                </button>

                <button className="joint">
                  J6+
                </button>

              </div>

            </div>


            {/* =========================
                SETTINGS
            ========================= */}

            <div className="settings-row">

              <div>

                <label>Step Size</label>

                <select
                  value={stepSize}
                  onChange={(e) =>
                    setStepSize(Number(e.target.value))
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

                <label>Speed</label>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={speed}
                  onChange={(e) =>
                    setSpeed(Number(e.target.value))
                  }
                />

                <span>
                  {speed}%
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =========================
            CURRENT POSE
        ========================= */}

        <section className="pose card">

          <h2>Current Pose</h2>

          <div className="pose-grid">

            <div>
              <span>X</span>
              <strong>{pose.x.toFixed(2)}</strong>
              <small>mm</small>
            </div>

            <div>
              <span>Y</span>
              <strong>{pose.y.toFixed(2)}</strong>
              <small>mm</small>
            </div>

            <div>
              <span>Z</span>
              <strong>{pose.z.toFixed(2)}</strong>
              <small>mm</small>
            </div>

            <div>
              <span>Rx</span>
              <strong>{pose.rx.toFixed(2)}</strong>
              <small>°</small>
            </div>

            <div>
              <span>Ry</span>
              <strong>{pose.ry.toFixed(2)}</strong>
              <small>°</small>
            </div>

            <div>
              <span>Rz</span>
              <strong>{pose.rz.toFixed(2)}</strong>
              <small>°</small>
            </div>

          </div>

        </section>


        {/* =========================
            FOOTER
        ========================= */}

        <footer>

          <span>
            Robot Status:
            <strong> Idle</strong>
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