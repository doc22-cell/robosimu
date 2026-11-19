# RoboSimu — FANUC Robot Arm Simulator

An interactive browser-based robotics simulation project focused on the FANUC LR Mate 200iD industrial robotic arm.

## Overview
RoboSimu combines a 3D robot visualization with joint controls and kinematics-related program logic. The application loads a URDF robot description and STL meshes and renders the model in a React interface.

## Technology
- React and Vite
- JavaScript
- Three.js, React Three Fiber, and Drei
- URDF Loader and STL Loader
- CSS

## Implementation highlights
- Interactive 3D scene with orbit camera controls and a reference grid.
- FANUC LR Mate 200iD robot visualization from URDF and STL assets.
- Six-joint angle updates for the robot model.
- Separate modules for forward kinematics, inverse kinematics, and parsing robot motion instructions.
- Browser-based interface for exploring robot control and motion.

## Run locally
```bash
git clone https://github.com/doc22-cell/robosimu.git
cd robosimu
npm install
npm run dev
```
Open the local address printed by Vite.

## Development commands
```bash
npm run build
npm run lint
npm run preview
```

## Project structure
- `src/App.jsx`: 3D scene, URDF model loading, and interface integration
- `src/App.css`: application styles
- `src/kinematics/`: kinematics and robot program parsing modules
- `public/`: static robot model assets (where present)

## Scope and limitations
This is a software simulation and educational development project, not a controller for a physical robot. The repository does not establish that machine learning or autonomous AI control is implemented. Verify numerical accuracy and robot safety constraints before applying the algorithms to hardware.

## Author
Mythreyan — [GitHub](https://github.com/doc22-cell)
