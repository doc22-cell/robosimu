# Six-Axis Robotic Arm Simulator — FANUC LR Mate 200iD

**Mythreyan I. S.** | B.Tech, Information and Communication Technology | SASTRA Deemed to be University

A browser-based interactive simulator for exploring the motion and control of a six-axis FANUC LR Mate 200iD robotic arm.

## Project overview

The simulator provides a 3D visualization of the robot and a control interface for exploring individual joint movement, target joint configurations, and straight-line tool motion. The project integrates robot kinematics calculations with interactive controls.

## My contributions

I worked on the **motion logic and user interface**. In particular, I:

- Implemented and refined controls for jogging individual robot joints.
- Worked on commanding the arm to a specified joint configuration.
- Worked on straight-line tool movement commands.
- Integrated inverse-kinematics output into the interface so the joint angles corresponding to a requested tool pose could be displayed.
- Iterated on the motion logic after observing jerky sequential joint movements during testing.

## Testing and iteration

During simulator testing, I observed that the joints moved rapidly in sequence, producing a jerky-looking motion. I revised the motion logic and repeated the same command. The resulting arm movement appeared smoother on screen.

**Important:** This was a *visual observation in the simulator*, not a quantitative benchmark of trajectory smoothness or physical robot performance.

## Technology stack

The checked-in application uses:

- **React + Vite** for the user interface and development environment
- **JavaScript and CSS** for interaction logic and styling
- **Three.js / React Three Fiber / Drei** for 3D rendering and camera controls
- **URDF Loader and STL Loader** for the FANUC robot description and mesh assets
- **Kinematics modules** for forward/inverse kinematics and robot motion instruction parsing

## Run locally

Prerequisite: install Node.js and npm.

```bash
git clone https://github.com/doc22-cell/robosimu.git
cd robosimu
npm install
npm run dev
```

Open the local URL printed in the terminal.

For a production build:

```bash
npm run build
npm run preview
```

## Code organization

- `src/App.jsx` — main simulator interface, 3D environment, robot model integration, and control logic
- `src/App.css` — interface styling
- `src/kinematics/` — kinematics and motion parsing logic
- `public/` — robot assets used by the simulator

## Project scope

This is a software-based robotics simulation project. It does not claim autonomous AI control, verified real-world robot safety, or hardware deployment. Motion quality was assessed visually during the described testing iteration.

## Project link

[GitHub repository](https://github.com/doc22-cell/robosimu)

## Author

**Mythreyan I. S.**  
B.Tech in Information and Communication Technology  
SASTRA Deemed to be University
