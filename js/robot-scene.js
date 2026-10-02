import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MODEL_CONFIG } from "../model-config.js";

// An original procedural concept; no third-party robot model or remote assets.
function createConcept() {
  const robot = new THREE.Group();
  const shell = new THREE.MeshStandardMaterial({
    color: 0xe7ebde,
    metalness: 0.37,
    roughness: 0.29,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x1e2b26,
    metalness: 0.65,
    roughness: 0.28,
  });
  const rubber = new THREE.MeshStandardMaterial({
    color: 0x16201c,
    metalness: 0.05,
    roughness: 0.88,
  });
  const metal = new THREE.MeshStandardMaterial({
    color: 0x98a99c,
    metalness: 0.9,
    roughness: 0.23,
  });
  const accent = new THREE.MeshStandardMaterial({
    color: 0xd4ef93,
    metalness: 0.25,
    roughness: 0.32,
  });
  const glow = new THREE.MeshStandardMaterial({
    color: 0xd4ef93,
    emissive: 0xbee878,
    emissiveIntensity: 1.8,
    roughness: 0.35,
  });
  const visor = new THREE.MeshStandardMaterial({
    color: 0x091915,
    metalness: 0.45,
    roughness: 0.13,
  });

  function mesh(geometry, material, position, parent = robot) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(...position);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  const box = (w, h, d, r, material, position, parent) =>
    mesh(new RoundedBoxGeometry(w, h, d, 3, r), material, position, parent);
  const cylinder = (top, bottom, height, material, position, parent) =>
    mesh(
      new THREE.CylinderGeometry(top, bottom, height, 40),
      material,
      position,
      parent,
    );

  // Chassis, exposed structure, and four independently detailed wheels.
  box(2.05, 0.27, 1.57, 0.09, dark, [0, 0.79, 0]);
  box(1.96, 0.44, 1.5, 0.15, shell, [0, 1.07, 0]);
  box(1.74, 0.06, 1.34, 0.025, accent, [0, 1.32, 0]);
  box(1.65, 0.09, 0.09, 0.03, dark, [0, 1.01, 0.765]);
  box(0.7, 0.04, 0.035, 0.013, glow, [0, 1.03, 0.819]);
  [-0.64, 0.64].forEach((x) => {
    box(0.22, 0.08, 0.035, 0.02, accent, [x, 1.11, 0.79]);
    cylinder(0.036, 0.036, 0.025, metal, [x, 1.36, 0.46]);
    cylinder(0.036, 0.036, 0.025, metal, [x, 1.36, -0.46]);
  });
  const wheels = [];
  [-1.05, 1.05].forEach((x) =>
    [-0.52, 0.52].forEach((z) => {
      const wheel = new THREE.Group();
      wheel.position.set(x, 0.59, z);
      wheel.rotation.z = Math.PI / 2;
      robot.add(wheel);
      cylinder(0.39, 0.39, 0.32, rubber, [0, 0, 0], wheel);
      cylinder(0.25, 0.25, 0.34, metal, [0, 0, 0], wheel);
      cylinder(0.19, 0.19, 0.355, dark, [0, 0, 0], wheel);
      cylinder(0.085, 0.085, 0.37, accent, [0, 0, 0], wheel);
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const tread = box(
          0.095,
          0.325,
          0.025,
          0.007,
          rubber,
          [Math.cos(a) * 0.387, 0, Math.sin(a) * 0.387],
          wheel,
        );
        tread.rotation.y = -a;
      }
      wheels.push(wheel);
    }),
  );

  cylinder(0.25, 0.32, 0.14, dark, [0, 1.43, -0.08]);
  cylinder(0.16, 0.16, 0.42, metal, [0, 1.65, -0.08]);
  cylinder(0.22, 0.22, 0.055, accent, [0, 1.58, -0.08]);
  const head = new THREE.Group();
  head.position.set(0, 2.13, -0.02);
  robot.add(head);
  box(1.83, 0.94, 0.97, 0.19, shell, [0, 0, 0], head);
  box(1.58, 0.66, 0.14, 0.15, dark, [0, 0, 0.463], head);
  box(1.43, 0.54, 0.06, 0.12, visor, [0, 0.015, 0.548], head);
  [-0.38, 0.38].forEach((x) => {
    mesh(
      new THREE.TorusGeometry(0.145, 0.019, 12, 40),
      glow,
      [x, 0.045, 0.586],
      head,
    );
    mesh(new THREE.CircleGeometry(0.09, 32), dark, [x, 0.045, 0.584], head);
    box(0.065, 0.06, 0.02, 0.015, glow, [x, 0.045, 0.587], head);
  });
  box(0.15, 0.018, 0.025, 0.008, accent, [0, -0.155, 0.587], head);
  // Inset side joints and functional-looking ventilation lines.
  [-1, 1].forEach((side) => {
    const joint = cylinder(
      0.195,
      0.195,
      0.085,
      dark,
      [side * 0.908, 0, -0.02],
      head,
    );
    joint.rotation.z = Math.PI / 2;
    const cap = cylinder(
      0.135,
      0.135,
      0.1,
      accent,
      [side * 0.925, 0, -0.02],
      head,
    );
    cap.rotation.z = Math.PI / 2;
  });
  for (let i = 0; i < 5; i++)
    box(0.08, 0.015, 0.24, 0.006, dark, [-0.22 + i * 0.11, 0.475, -0.02], head);
  cylinder(0.035, 0.04, 0.37, metal, [0.59, 0.62, -0.2], head);
  mesh(
    new THREE.SphereGeometry(0.074, 20, 16),
    accent,
    [0.59, 0.835, -0.2],
    head,
  );

  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 256;
  labelCanvas.height = 128;
  const context = labelCanvas.getContext("2d");
  if (context) {
    context.fillStyle = "#e7ebde";
    context.fillRect(0, 0, 256, 128);
    context.fillStyle = "#283c30";
    context.font = "bold 51px monospace";
    context.textAlign = "center";
    context.fillText("JSP", 128, 72);
    context.font = "15px monospace";
    context.fillText("R O B O T", 128, 100);
    const texture = new THREE.CanvasTexture(labelCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const label = mesh(
      new THREE.PlaneGeometry(0.34, 0.17),
      new THREE.MeshStandardMaterial({ map: texture, roughness: 0.6 }),
      [0, 1.23, 0.758],
    );
    label.castShadow = false;
  }
  robot.userData.head = head;
  return robot;
}

function disposeObject(object) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  object.traverse((child) => {
    if (child.geometry) geometries.add(child.geometry);
    const list = child.material
      ? Array.isArray(child.material)
        ? child.material
        : [child.material]
      : [];
    list.forEach((material) => {
      materials.add(material);
      Object.values(material).forEach((value) => {
        if (value?.isTexture) textures.add(value);
      });
    });
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  textures.forEach((texture) => texture.dispose());
}

export async function mountRobot(container, showFallback) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x101615, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    "Robot 3D de démonstration. Glissez horizontalement ou utilisez les flèches gauche et droite pour le faire tourner. Appuyez sur Début pour réinitialiser.",
  );
  canvas.setAttribute("aria-describedby", "robot-caption");
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(4.7, 3.15, 6.8);
  camera.lookAt(0, 1.48, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.72;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xe9f5dc, 0x526753, 1.9));
  const key = new THREE.DirectionalLight(0xfff9e8, 3.2);
  key.position.set(-3.5, 6, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xc9ef9f, 3.8);
  rim.position.set(3, 3.5, -4);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xc2d8e8, 1.1);
  fill.position.set(-4, 1, -1);
  scene.add(fill);

  const pivot = new THREE.Group();
  scene.add(pivot);
  let model = createConcept();
  pivot.add(model);
  // A soft contact shadow avoids a costly extra shadow pass on classroom devices.
  const shadowMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexShader:
      "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader:
      "varying vec2 vUv; void main(){ float d = length((vUv - 0.5) * 2.0); float a = (1.0 - smoothstep(0.12, 1.0, d)) * 0.32; gl_FragColor = vec4(0.0, 0.0, 0.0, a); }",
  });
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 3.5),
    shadowMaterial,
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.19;
  scene.add(floor);
  // The fine orbit is geometry, so it remains attached to the ground plane.
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.94, 1.945, 100),
    new THREE.MeshBasicMaterial({
      color: 0xaabe98,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.195;
  scene.add(ring);

  let paused = document.documentElement.classList.contains("paused");
  let visible = true;
  let lost = false;
  let running = false;
  let previousTime = 0;
  let elapsed = 0;
  let angle = paused ? -0.25 : 0.45;
  let targetAngle = -0.25;
  let pointerX = 0;
  let pointerY = 0;
  let headX = 0;
  let headY = 0;
  let mixer = null;
  let dragging = false;
  let lastX = 0;
  let activePointer = null;

  function render() {
    if (!lost) renderer.render(scene, camera);
  }
  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    // Keep the entire model within the frame at narrow aspect ratios.
    camera.fov = camera.aspect < 1 ? 38 : 34;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  }
  function frame(time) {
    const dt = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
    previousTime = time;
    elapsed += dt;
    const easing = 1 - Math.exp(-dt * 5);
    angle += (targetAngle - angle) * easing;
    headX += (pointerX - headX) * easing;
    headY += (pointerY - headY) * easing;
    pivot.rotation.y = angle + Math.sin(elapsed * 0.35) * 0.045;
    if (model.userData.head) {
      model.userData.head.rotation.y =
        Math.sin(elapsed * 0.55) * 0.065 + headX * 0.15;
      model.userData.head.rotation.x = headY * 0.05;
    }
    mixer?.update(dt);
    render();
  }
  function syncLoop() {
    const shouldRun = visible && !paused && !document.hidden && !lost;
    if (running === shouldRun) return;
    running = shouldRun;
    previousTime = 0;
    renderer.setAnimationLoop(shouldRun ? frame : null);
    if (!shouldRun) render();
  }
  function setAngle(value) {
    targetAngle = value;
    if (paused) {
      angle = value;
      pivot.rotation.y = angle;
      render();
    }
  }
  function resetView() {
    pointerX = pointerY = 0;
    setAngle(-0.25);
    if (paused && model.userData.head) {
      model.userData.head.rotation.set(0, 0, 0);
      render();
    }
  }
  canvas.addEventListener("pointerdown", (event) => {
    if (
      !event.isPrimary ||
      (event.pointerType === "mouse" && event.button !== 0)
    )
      return;
    dragging = true;
    activePointer = event.pointerId;
    lastX = event.clientX;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (dragging && event.pointerId === activePointer) {
      setAngle(targetAngle + (event.clientX - lastX) * 0.009);
      lastX = event.clientX;
    } else if (event.pointerType === "mouse" && !paused) {
      const bounds = canvas.getBoundingClientRect();
      pointerX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointerY = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    }
  });
  const endDrag = (event) => {
    if (event.pointerId !== activePointer) return;
    dragging = false;
    activePointer = null;
    if (canvas.hasPointerCapture(event.pointerId))
      canvas.releasePointerCapture(event.pointerId);
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("lostpointercapture", () => {
    dragging = false;
    activePointer = null;
  });
  canvas.addEventListener("pointerleave", () => {
    pointerX = pointerY = 0;
  });
  canvas.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") resetView();
    else setAngle(targetAngle + (event.key === "ArrowLeft" ? -0.22 : 0.22));
  });
  document.querySelector("#reset-view").addEventListener("click", resetView);
  document.addEventListener("jsp:motion-change", (event) => {
    paused = event.detail.paused;
    syncLoop();
  });
  document.addEventListener("visibilitychange", syncLoop);
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      syncLoop();
    },
    { threshold: 0 },
  );
  observer.observe(container);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    lost = true;
    syncLoop();
    showFallback("Aperçu du concept · La scène 3D se reconnecte.");
  });
  canvas.addEventListener("webglcontextrestored", () => {
    lost = false;
    resize();
    container.classList.add("is-ready");
    document.querySelector("#scene-controls").hidden = false;
    syncLoop();
  });
  pivot.rotation.y = angle;
  resize();
  container.classList.add("is-ready");
  container.setAttribute("aria-busy", "false");
  document.querySelector("#scene-controls").hidden = false;
  syncLoop();

  if (MODEL_CONFIG.url) {
    try {
      const url = new URL(MODEL_CONFIG.url, document.baseURI).href;
      const gltf = await new GLTFLoader().loadAsync(url);
      const custom = new THREE.Group();
      custom.add(gltf.scene);
      gltf.scene.rotation.set(...MODEL_CONFIG.rotation);
      gltf.scene.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(custom);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      if (!Number.isFinite(size.length()) || size.length() === 0)
        throw new Error("Modèle vide");
      gltf.scene.position.sub(center);
      const userScale =
        Number.isFinite(MODEL_CONFIG.scale) && MODEL_CONFIG.scale > 0
          ? MODEL_CONFIG.scale
          : 1;
      const scale =
        Math.min(2.65 / size.y, 2.8 / size.x, 2.25 / size.z) * userScale;
      custom.scale.setScalar(scale);
      custom.position.y = (size.y * scale) / 2 + 0.2;
      custom.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      pivot.remove(model);
      disposeObject(model);
      model = custom;
      pivot.add(custom);
      if (MODEL_CONFIG.animate && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(gltf.scene);
        // Play the first authored clip; avoid superimposing incompatible actions.
        mixer.clipAction(gltf.animations[0]).play();
      }
      const label = document.querySelector("#model-label");
      label.textContent = MODEL_CONFIG.label || "JSP — Notre robot";
      canvas.setAttribute(
        "aria-label",
        "Modèle 3D du robot JSP. Glissez horizontalement ou utilisez les flèches gauche et droite pour le faire tourner. Appuyez sur Début pour réinitialiser.",
      );
      render();
    } catch (error) {
      // A broken replacement must never leave an empty hero.
      console.warn("Modèle indisponible. Le concept 3D reste affiché.", error);
    }
  }
}
