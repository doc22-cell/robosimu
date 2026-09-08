import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import URDFLoader from "urdf-loader";
import "./App.css";

const BASE_URL = import.meta.env.BASE_URL;

function Environment({ position, rotation, jointAngles }) {
  return (
    <Canvas camera={{ position: [2.2, 1.6, 2.6], fov: 45 }}>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 8, 5]} intensity={2} />
      <Grid args={[10, 10]} cellSize={0.25} cellThickness={0.5} sectionSize={1} sectionThickness={1} fadeDistance={20} infiniteGrid />
      <RobotModel position={position} rotation={rotation} jointAngles={jointAngles} />
      <OrbitControls />
    </Canvas>
  );
}

function RobotModel({ position, rotation, jointAngles }) {
  const [robot, setRobot] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const manager = new THREE.LoadingManager();
    manager.onError = (url) => console.error("Failed to load:", url);
    const loader = new URDFLoader(manager);

    loader.packages = { "LRMate-200iD": `${BASE_URL}fanuc/` };

    loader.loadMeshCb = (path, manager, material, onComplete) => {
      const extension = path.split("?")[0].split(".").pop().toLowerCase();
      if (extension !== "stl") {
        console.warn("Unsupported mesh format:", path);
        onComplete(null);
        return;
      }

      const stlLoader = new STLLoader(manager);
      stlLoader.load(
        path,
        (geometry) => {
          const fileName = path.split("/").pop().toLowerCase();
          let meshMaterial;
          if (fileName === "base.stl") {
            meshMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.4, roughness: 0.55 });
          } else if (fileName === "j4.stl") {
            meshMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.4, roughness: 0.55 });
          } else {
            meshMaterial = new THREE.MeshStandardMaterial({ color: 0xffd500, metalness: 0.25, roughness: 0.65 });
          }
          const mesh = new THREE.Mesh(geometry, meshMaterial);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          onComplete(mesh);
        },
        undefined,
        (error) => {
          console.error("FANUC STL mesh error:", path, error);
          onComplete(null, error);
        }
      );
    };

    loader.load(
      `${BASE_URL}fanuc/urdf/urdf/LRMate-200iD.urdf`,
      (loadedRobot) => {
        if (!cancelled) setRobot(loadedRobot);
      },
      undefined,
      (error) => console.error("FANUC URDF loading error:", error)
    );

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!robot) return;
    ["J1", "J2", "J3", "J4", "J5", "J6"].forEach((jointName, index) => {
      const joint = robot.joints[jointName];
      if (joint) joint.setJointValue(jointAngles[index]);
    });
  }, [robot, jointAngles]);

  if (!robot) return null;

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <primitive object={robot} scale={1.5} />
    </group>
  );
}

function App() {
  const [position, setPosition] = useState([0, 0, 0]);
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [pose, setPose] = useState({ x: 350.25, y: 125.80, z: 420.10, rx: -2.45, ry: 15.30, rz: 90.00 });
  const [stepSize, setStepSize] = useState(10);
  const [speed, setSpeed] = useState(50);
  const [jointAngles, setJointAngles] = useState([0, 0, 0, 0, 0, 0]);

  const jog = (axis, direction) => {
    const amount = stepSize * direction;
    setPose((prev) => ({ ...prev, [axis]: prev[axis] + amount }));
    if (axis === "x") setPosition((prev) => [prev[0] + amount * 0.01, prev[1], prev[2]]);
    if (axis === "y") setPosition((prev) => [prev[0], prev[1] + amount * 0.01, prev[2]]);
    if (axis === "z") setPosition((prev) => [prev[0], prev[1], prev[2] + amount * 0.01]);
  };

  const jointLimits = [
    [-170, 170],
    [-122.5, 122.5],
    [-210, 210],
    [-190, 190],
    [-125, 125],
    [-360, 360],
  ];

  const jogJoint = (jointIndex, direction) => {
    const angleChange = THREE.MathUtils.degToRad(stepSize * direction);
    setJointAngles((prev) => {
      const updated = [...prev];
      const [minDeg, maxDeg] = jointLimits[jointIndex];
      updated[jointIndex] = THREE.MathUtils.clamp(updated[jointIndex] + angleChange, THREE.MathUtils.degToRad(minDeg), THREE.MathUtils.degToRad(maxDeg));
      return updated;
    });
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">🤖<div><strong>Robot Jog Control</strong><span>6-Axis Robot Simulation</span></div></div>
        <nav>
          <button>▦ <span>Dashboard</span></button>
          <button className="active">⌘ <span>Jog Control</span></button>
          <button>◎ <span>Position</span></button>
          <button>◈ <span>I/O Monitor</span></button>
          <button>⚙ <span>Settings</span></button>
          <button>ⓘ <span>About</span></button>
        </nav>
      </aside>

      <main className="main">
        <header className="header">
          <div><h1>Jog Control</h1><p>Manually control the robot position</p></div>
          <div className="connection"><span className="dot"></span>Connected</div>
        </header>

        <section className="content">
          <div className="environment card">
            <div className="card-header"><h2>3D Environment</h2><button>⛶</button></div>
            <div className="canvas-container"><Environment position={position} rotation={rotation} jointAngles={jointAngles} /></div>
          </div>

          <div className="controls card">
            <div className="program-editor">
              <div className="program-editor-header">
                <h2>Program Editor</h2>
                <div className="program-editor-actions">
                  <button type="button">📄 New</button>
                  <button type="button">📂 Open</button>
                  <button type="button">💾 Save</button>
                  <button type="button" className="run-button">▶ Run</button>
                </div>
              </div>
              <div className="code-editor">
                <div className="line-numbers">{Array.from({ length: 10 }, (_, i) => <span key={i}>{i + 1}</span>)}</div>
                <textarea className="program-code" defaultValue={`# Robot program\n# Add your code here...\n\n\n\n\n\n\n\n`} spellCheck="false" />
              </div>
            </div>

            <div className="card-header"><h2>Manual Jog Control</h2><select defaultValue="Manual Mode"><option>Manual Mode</option><option>Auto Mode</option></select></div>

            <div className="control-section">
              <h3>Cartesian Jog</h3>
              <div className="button-grid">
                <button className="x" onClick={() => jog("x", -1)}>X−</button><button className="x" onClick={() => jog("x", 1)}>X+</button>
                <button className="y" onClick={() => jog("y", -1)}>Y−</button><button className="y" onClick={() => jog("y", 1)}>Y+</button>
                <button className="z" onClick={() => jog("z", -1)}>Z−</button><button className="z" onClick={() => jog("z", 1)}>Z+</button>
              </div>
            </div>

            <div className="control-section">
              <h3>Joint Jog</h3>
              <div className="button-grid">
                <button className="joint" onClick={() => jogJoint(0, -1)}>J1−</button><button className="joint" onClick={() => jogJoint(0, 1)}>J1+</button>
                <button className="joint" onClick={() => jogJoint(1, -1)}>J2−</button><button className="joint" onClick={() => jogJoint(1, 1)}>J2+</button>
                <button className="joint" onClick={() => jogJoint(2, -1)}>J3−</button><button className="joint" onClick={() => jogJoint(2, 1)}>J3+</button>
                <button className="joint" onClick={() => jogJoint(3, -1)}>J4−</button><button className="joint" onClick={() => jogJoint(3, 1)}>J4+</button>
                <button className="joint" onClick={() => jogJoint(4, -1)}>J5−</button><button className="joint" onClick={() => jogJoint(4, 1)}>J5+</button>
                <button className="joint" onClick={() => jogJoint(5, -1)}>J6−</button><button className="joint" onClick={() => jogJoint(5, 1)}>J6+</button>
              </div>
            </div>

            <div className="settings-row">
              <div><label>Step Size</label><select value={stepSize} onChange={(e) => setStepSize(Number(e.target.value))}><option value={10}>10 mm / °</option><option value={5}>5 mm / °</option><option value={1}>1 mm / °</option></select></div>
              <div className="speed"><label>Speed</label><input type="range" min="0" max="100" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} /><span>{speed}%</span></div>
            </div>
          </div>
        </section>

        <section className="pose card">
          <h2>Current Pose</h2>
          <div className="pose-grid">
            <div><span>X</span><strong>{pose.x.toFixed(2)}</strong><small>mm</small></div>
            <div><span>Y</span><strong>{pose.y.toFixed(2)}</strong><small>mm</small></div>
            <div><span>Z</span><strong>{pose.z.toFixed(2)}</strong><small>mm</small></div>
            <div><span>Rx</span><strong>{pose.rx.toFixed(2)}</strong><small>°</small></div>
            <div><span>Ry</span><strong>{pose.ry.toFixed(2)}</strong><small>°</small></div>
            <div><span>Rz</span><strong>{pose.rz.toFixed(2)}</strong><small>°</small></div>
          </div>
        </section>

        <footer><span>Robot Status:<strong> Idle</strong></span><span className="ros">● ROS2 Connected</span></footer>
      </main>
    </div>
  );
}

export default App;
