// Three.js scenes: hero character, about cube, skills orbs, contact envelope

(() => {
  if (typeof THREE === "undefined") return;

  document.addEventListener("DOMContentLoaded", () => {
    initHeroCharacter();
    initAboutCube();
    initSkillsOrbs();
    initContactEnvelope();
  });

  function createRenderer(container) {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);
    return renderer;
  }

  function useIntersectionToggle(container, start, stop) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) start();
          else stop();
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);
  }

  // ================= HERO CHARACTER =================
  function initHeroCharacter() {
    const container = document.getElementById("hero-3d-container");
    if (!container) return;

    const isMobile = window.innerWidth < 768;

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.Fog(0x0d0d0d, 10, 20);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 1.5, 0);

    const renderer = createRenderer(container);

    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(2, 5, 3);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const faceGlow = new THREE.PointLight(0x00ff41, 0.6, 20);
    faceGlow.position.set(0, 3, 2);
    scene.add(faceGlow);

    const cyanFill = new THREE.PointLight(0x00ffff, 0.2, 15);
    cyanFill.position.set(-3, 1, 1);
    scene.add(cyanFill);

    const character = new THREE.Group();
    scene.add(character);

    const lambert = (color, opts = {}) =>
      new THREE.MeshLambertMaterial({
        color,
        flatShading: true,
        ...opts,
      });

    const headGeom = new THREE.BoxGeometry(1, 1, 1);
    const headMat = lambert(0x1a1a2e);
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.set(0, 2.8, 0);
    head.castShadow = true;
    character.add(head);

    const eyeGeom = new THREE.BoxGeometry(0.2, 0.15, 0.05);
    const eyeMat = lambert(0x00ff41, {
      emissive: 0x00ff41,
      emissiveIntensity: 0.8,
    });
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.25, 2.85, 0.52);
    const rightEye = leftEye.clone();
    rightEye.position.set(0.25, 2.85, 0.52);
    character.add(leftEye, rightEye);

    const visorGeom = new THREE.BoxGeometry(0.8, 0.15, 0.05);
    const visorMat = lambert(0x00ff41, {
      emissive: 0x00ff41,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.6,
    });
    const visor = new THREE.Mesh(visorGeom, visorMat);
    visor.position.set(0, 2.85, 0.53);
    character.add(visor);

    const bodyGeom = new THREE.BoxGeometry(1.4, 1.5, 0.9);
    const bodyMat = lambert(0x111111);
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.set(0, 1.5, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    character.add(body);

    const pocketGeom = new THREE.BoxGeometry(0.6, 0.4, 0.05);
    const pocketMat = lambert(0x1a1a1a);
    const pocket = new THREE.Mesh(pocketGeom, pocketMat);
    pocket.position.set(0, 1.1, 0.48);
    character.add(pocket);

    const stringGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8);
    const stringMat = lambert(0x333333);
    const stringL = new THREE.Mesh(stringGeom, stringMat);
    stringL.position.set(-0.2, 2.1, 0.4);
    const stringR = stringL.clone();
    stringR.position.set(0.2, 2.1, 0.4);
    character.add(stringL, stringR);

    const armGeom = new THREE.BoxGeometry(0.35, 1.2, 0.35);
    const armMat = lambert(0x111111);
    const leftArm = new THREE.Mesh(armGeom, armMat);
    leftArm.position.set(-0.95, 1.4, 0);
    leftArm.rotation.z = 0.15;
    const rightArm = new THREE.Mesh(armGeom, armMat);
    rightArm.position.set(0.95, 1.4, 0);
    rightArm.rotation.z = -0.15;
    character.add(leftArm, rightArm);

    const handGeom = new THREE.BoxGeometry(0.3, 0.3, 0.25);
    const handMat = lambert(0x1a1a2e);
    const leftHand = new THREE.Mesh(handGeom, handMat);
    leftHand.position.set(-0.95, 0.8, 0.2);
    const rightHand = leftHand.clone();
    rightHand.position.set(0.95, 0.8, 0.2);
    character.add(leftHand, rightHand);

    const legGeom = new THREE.BoxGeometry(0.45, 1.1, 0.45);
    const legMat = lambert(0x0d0d0d);
    const leftLeg = new THREE.Mesh(legGeom, legMat);
    leftLeg.position.set(-0.35, 0.2, 0);
    const rightLeg = new THREE.Mesh(legGeom, legMat);
    rightLeg.position.set(0.35, 0.2, 0);
    character.add(leftLeg, rightLeg);

    const shoeGeom = new THREE.BoxGeometry(0.5, 0.25, 0.65);
    const shoeMat = lambert(0xffffff);
    const leftShoe = new THREE.Mesh(shoeGeom, shoeMat);
    leftShoe.position.set(-0.35, -0.35, 0.1);
    leftShoe.rotation.x = -0.1;
    const rightShoe = leftShoe.clone();
    rightShoe.position.set(0.35, -0.35, 0.1);
    character.add(leftShoe, rightShoe);

    const baseGeom = new THREE.BoxGeometry(1.0, 0.05, 0.7);
    const baseMat = lambert(0x222222);
    const laptopBase = new THREE.Mesh(baseGeom, baseMat);
    laptopBase.position.set(0, 0.85, 0.3);
    character.add(laptopBase);

    const screenGeom = new THREE.BoxGeometry(1.0, 0.7, 0.05);
    const screenMat = lambert(0x0a0a0a);
    const laptopScreen = new THREE.Mesh(screenGeom, screenMat);
    laptopScreen.position.set(0, 1.2, 0.6);
    laptopScreen.rotation.x = -0.3;
    character.add(laptopScreen);

    const screenGlowGeom = new THREE.PlaneGeometry(0.9, 0.6);
    const screenGlowMat = new THREE.MeshLambertMaterial({
      color: 0x00ff41,
      emissive: 0x00ff41,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.15,
    });
    const screenGlow = new THREE.Mesh(screenGlowGeom, screenGlowMat);
    screenGlow.position.copy(laptopScreen.position);
    screenGlow.rotation.copy(laptopScreen.rotation);
    screenGlow.position.z += 0.03;
    character.add(screenGlow);

    const gridGeom = new THREE.CircleGeometry(3, 32);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x00ff41,
      wireframe: true,
      transparent: true,
      opacity: 0.06,
    });
    const groundGrid = new THREE.Mesh(gridGeom, gridMat);
    groundGrid.rotation.x = -Math.PI / 2;
    groundGrid.position.set(0, -0.6, 0);
    scene.add(groundGrid);

    const shadowGeom = new THREE.CircleGeometry(2, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x00ff41,
      transparent: true,
      opacity: 0.1,
    });
    const shadow = new THREE.Mesh(shadowGeom, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, -0.61, 0);
    scene.add(shadow);

    const codeTexts = [
      "def train():",
      "import torch",
      "git commit",
      "npm start",
      "python app.py",
      "SELECT *",
      "{ model }",
      "console.log",
      "flask run",
      "ssh -i key",
    ];

    const particles = [];
    const particleCount = isMobile ? 5 : 10;

    for (let i = 0; i < particleCount; i++) {
      const text = codeTexts[i % codeTexts.length];
      const tex = makeTextTexture(text);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(1.2, 0.3, 1);
      scene.add(sprite);
      particles.push({
        sprite,
        radius: 2.5 + Math.random(),
        speed: 0.3 + Math.random() * 0.5,
        height: -0.5 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
      });
    }

    function makeTextTexture(text) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "24px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(0,255,65,0.85)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    }

    let targetHeadRot = new THREE.Euler();
    let scrollRotation = 0;

    container.addEventListener("mousemove", (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const maxY = 0.4;
      const maxX = 0.4;
      const targetY = ((x - centerX) * 0.0003) * -1;
      const targetX = (y - centerY) * -0.0002;
      targetHeadRot.y = THREE.MathUtils.clamp(targetY, -maxY, maxY);
      targetHeadRot.x = THREE.MathUtils.clamp(targetX, -maxX, maxX);
    });

    let lastScrollY = window.scrollY;
    window.addEventListener("scroll", () => {
      const current = window.scrollY;
      const delta = current - lastScrollY;
      lastScrollY = current;
      scrollRotation += delta * 0.001;
      scrollRotation = THREE.MathUtils.clamp(scrollRotation, -0.5, 0.5);
    });

    let hoverScaleTarget = 1;
    container.addEventListener("mouseenter", () => {
      hoverScaleTarget = 1.05;
    });
    container.addEventListener("mouseleave", () => {
      hoverScaleTarget = 1;
    });

    let running = false;
    let frameSkip = 0;

    function animate(time) {
      if (!running) return;
      requestAnimationFrame(animate);

      if (isMobile) {
        frameSkip = (frameSkip + 1) % 3;
        if (frameSkip !== 0) return;
      }

      const t = time * 0.001;

      character.position.y = Math.sin(t * 1.5) * 0.08;
      const shadowScale = 1 + Math.cos(t * 1.5) * 0.08;
      shadow.scale.set(shadowScale, shadowScale, 1);

      body.scale.y = 1 + Math.sin(t * 1.2) * 0.02;

      rightArm.rotation.x = Math.sin(t * 8) * 0.15;
      leftArm.rotation.x = Math.sin(t * 8 + Math.PI) * 0.15;

      head.rotation.x += (targetHeadRot.x - head.rotation.x) * 0.05;
      head.rotation.y += (targetHeadRot.y - head.rotation.y) * 0.05;

      character.rotation.y += (scrollRotation - character.rotation.y) * 0.05;

      const scale = character.scale.x + (hoverScaleTarget - character.scale.x) * 0.08;
      character.scale.setScalar(scale);

      screenGlowMat.emissiveIntensity = 0.3 + Math.sin(t * 2) * 0.15;

      groundGrid.rotation.z += 0.002;

      particles.forEach((p, i) => {
        const s = p.sprite;
        const phase = p.phase;
        const speed = p.speed;
        s.position.x = Math.cos(t * speed + phase) * p.radius;
        s.position.z = Math.sin(t * speed + phase) * p.radius;
        s.position.y = p.height + Math.sin(t * 0.5 + phase) * 0.2;
        const alpha = 0.65 + Math.sin(t * 1.5 + phase) * 0.25;
        s.material.opacity = alpha;
      });

      renderer.render(scene, camera);
    }

    function start() {
      if (running) return;
      running = true;
      requestAnimationFrame(animate);
    }
    function stop() {
      running = false;
    }

    useIntersectionToggle(container, start, stop);

    window.addEventListener("resize", () => {
      if (!container.clientWidth) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }

  // ================= ABOUT CUBE =================
  function initAboutCube() {
    const container = document.getElementById("about-cube-container");
    if (!container) return;

    const isMobile = window.innerWidth < 768;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 5);

    const renderer = createRenderer(container);

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(3, 5, 3);
    scene.add(dir);

    const point = new THREE.PointLight(0x00ff41, 0.3, 10);
    point.position.set(2, 2, 2);
    scene.add(point);

    function faceTexture(drawFn) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff41";
      drawFn(ctx, canvas);
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }

    const materials = [
      new THREE.MeshLambertMaterial({
        map: faceTexture((ctx, c) => {
          ctx.fillStyle = "#111";
          ctx.fillRect(40, 30, 176, 176);
          ctx.fillStyle = "#00ff41";
          ctx.fillRect(56, 46, 144, 144);
          ctx.fillStyle = "#050505";
          ctx.fillRect(72, 62, 112, 112);
          ctx.fillStyle = "#00ff41";
          ctx.font = "18px 'JetBrains Mono'";
          ctx.textAlign = "center";
          ctx.fillText("SURAJ", c.width / 2, 210);
          ctx.fillText("KUMAR", c.width / 2, 232);
        }),
      }),
      new THREE.MeshLambertMaterial({
        map: faceTexture((ctx, c) => {
          ctx.font = "28px 'JetBrains Mono'";
          ctx.textAlign = "center";
          ctx.fillText("CGPA: 7.73", c.width / 2, c.height / 2);
        }),
      }),
      new THREE.MeshLambertMaterial({
        map: faceTexture((ctx, c) => {
          ctx.font = "20px 'JetBrains Mono'";
          ctx.textAlign = "center";
          ctx.fillText("CHENNAI, TN", c.width / 2, c.height / 2);
        }),
      }),
      new THREE.MeshLambertMaterial({
        map: faceTexture((ctx, c) => {
          ctx.font = "22px 'JetBrains Mono'";
          ctx.textAlign = "center";
          ctx.fillText("2023 - 2027", c.width / 2, c.height / 2);
        }),
      }),
      new THREE.MeshLambertMaterial({
        map: faceTexture((ctx, c) => {
          ctx.font = "26px 'JetBrains Mono'";
          ctx.textAlign = "center";
          ctx.fillText("AI & DS", c.width / 2, c.height / 2);
        }),
      }),
      new THREE.MeshLambertMaterial({
        map: faceTexture((ctx, c) => {
          ctx.fillStyle = "#00ff41";
          for (let y = 20; y < c.height; y += 32) {
            for (let x = 20; x < c.width; x += 32) {
              ctx.fillRect(x, y, 4, 4);
            }
          }
        }),
      }),
    ];

    const cubeGeom = new THREE.BoxGeometry(2.5, 2.5, 2.5);
    const cube = new THREE.Mesh(cubeGeom, materials);
    scene.add(cube);

    const edges = new THREE.EdgesGeometry(cubeGeom);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00ff41,
      transparent: true,
      opacity: 0.4,
    });
    const lineSegments = new THREE.LineSegments(edges, lineMat);
    scene.add(lineSegments);

    const corners = [];
    const cornerGeom = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    const cornerMat = new THREE.MeshLambertMaterial({
      color: 0x00ff41,
      emissive: 0x00ff41,
      emissiveIntensity: 0.5,
    });
    const posVals = [-1.4, 1.4];
    posVals.forEach((x) => {
      posVals.forEach((y) => {
        posVals.forEach((z) => {
          const m = new THREE.Mesh(cornerGeom, cornerMat);
          m.position.set(x, y, z);
          scene.add(m);
          corners.push(m);
        });
      });
    });

    let hover = false;
    let dragging = false;
    let lastX = 0;
    let idleSpeedY = 0.005;
    let targetIdleSpeed = idleSpeedY;

    container.addEventListener("mouseenter", () => {
      hover = true;
      targetIdleSpeed = 0;
      point.intensity = 1.0;
      lineMat.opacity = 0.7;
    });
    container.addEventListener("mouseleave", () => {
      hover = false;
      targetIdleSpeed = 0.005;
      point.intensity = 0.3;
      lineMat.opacity = 0.4;
      dragging = false;
    });

    if (!isMobile) {
      container.addEventListener("mousedown", (e) => {
        dragging = true;
        lastX = e.clientX;
      });
      window.addEventListener("mouseup", () => {
        dragging = false;
      });
      window.addEventListener("mousemove", (e) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        cube.rotation.y += dx * 0.01;
      });
    }

    let running = false;

    function animate(time) {
      if (!running) return;
      requestAnimationFrame(animate);
      const t = time * 0.001;

      idleSpeedY += (targetIdleSpeed - idleSpeedY) * 0.05;
      cube.rotation.y += idleSpeedY;
      cube.rotation.x = Math.sin(t * 0.5) * 0.1;
      lineSegments.rotation.copy(cube.rotation);

      corners.forEach((c, i) => {
        const phase = (i / corners.length) * Math.PI * 2;
        c.position.x += Math.sin(t * 0.6 + phase) * 0.002;
        c.position.y += Math.cos(t * 0.6 + phase) * 0.002;
      });

      renderer.render(scene, camera);
    }

    function start() {
      if (running) return;
      running = true;
      requestAnimationFrame(animate);
    }
    function stop() {
      running = false;
    }

    useIntersectionToggle(container, start, stop);

    window.addEventListener("resize", () => {
      if (!container.clientWidth) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }

  // ================= SKILLS ORBS =================
  function initSkillsOrbs() {
    const container = document.getElementById("skills-orbs-container");
    if (!container) return;

    const isMobile = window.innerWidth < 768;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 5);

    const renderer = createRenderer(container);

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const p1 = new THREE.PointLight(0x00ff41, 0.5, 15);
    p1.position.set(3, 3, 3);
    scene.add(p1);
    const p2 = new THREE.PointLight(0x00d4ff, 0.4, 15);
    p2.position.set(-3, -2, -2);
    scene.add(p2);

    const skills = [
      { name: "PY", color: 0x00ff41, category: "lang" },
      { name: "ML", color: 0x00d4ff, category: "ml" },
      { name: "JS", color: 0x00ff41, category: "lang" },
      { name: "C++", color: 0x00ff41, category: "lang" },
      { name: "SQL", color: 0x00ff41, category: "lang" },
      { name: "GIT", color: 0xffb000, category: "tool" },
      { name: "NLP", color: 0x00d4ff, category: "ml" },
      { name: "HTML", color: 0xff6b6b, category: "web" },
      { name: "CSS", color: 0xff6b6b, category: "web" },
      { name: "FLASK", color: 0xff6b6b, category: "web" },
      { name: "LINUX", color: 0xffb000, category: "tool" },
      { name: "NLTK", color: 0x00d4ff, category: "ml" },
      { name: "PANDAS", color: 0x00d4ff, category: "ml" },
      { name: "NUMPY", color: 0x00d4ff, category: "ml" },
      { name: "REACT", color: 0xff6b6b, category: "web" },
    ];

    const maxOrbs = isMobile ? 8 : skills.length;
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    const orbs = [];

    const sphereGeom = new THREE.SphereGeometry(0.25, 8, 8);

    skills.slice(0, maxOrbs).forEach((s, idx) => {
      const mat = new THREE.MeshLambertMaterial({
        color: s.color,
        emissive: s.color,
        emissiveIntensity: 0.3,
      });
      const mesh = new THREE.Mesh(sphereGeom, mat);
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 2 + Math.random();
      mesh.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi) * 0.6,
        r * Math.sin(phi) * Math.sin(theta)
      );
      orbGroup.add(mesh);

      const labelTex = makeLabelTexture(s.name);
      const labelMat = new THREE.SpriteMaterial({
        map: labelTex,
        transparent: true,
      });
      const label = new THREE.Sprite(labelMat);
      label.scale.set(0.9, 0.3, 1);
      mesh.add(label);
      label.position.set(0, 0.5, 0);

      orbs.push({
        mesh,
        label,
        name: s.name,
        baseColor: s.color,
        speed: 0.6 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
      });
    });

    function makeLabelTexture(text) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "26px 'JetBrains Mono'";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(0,255,65,0.9)";
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredOrb = null;

    container.addEventListener("mousemove", (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    });

    container.addEventListener("click", () => {
      if (!hoveredOrb) return;
      const targetName = hoveredOrb.name;
      const rows = document.querySelectorAll(".skill-row-header span:first-child");
      let matchedRow = null;
      rows.forEach((label) => {
        const text = label.textContent || "";
        if (text.toUpperCase().includes(targetName.replace("+", "++"))) {
          matchedRow = label.closest(".skill-row");
        }
      });
      if (matchedRow) {
        matchedRow.scrollIntoView({ behavior: "smooth", block: "center" });
        const fill = matchedRow.querySelector(".skill-bar-fill");
        if (fill) {
          const oldBoxShadow = fill.style.boxShadow;
          fill.style.boxShadow = "0 0 12px rgba(0,255,65,0.8)";
          setTimeout(() => {
            fill.style.boxShadow = oldBoxShadow || "none";
          }, 1000);
        }
      }

      const mesh = hoveredOrb.mesh;
      const start = performance.now();
      const duration = 400;
      const baseScale = mesh.scale.x || 1;

      function bounce(now) {
        const progress = Math.min((now - start) / duration, 1);
        const s =
          progress < 0.5
            ? baseScale + (1.8 - baseScale) * (progress / 0.5)
            : 1.8 - (0.8 * (progress - 0.5)) / 0.5;
        mesh.scale.setScalar(s);
        if (progress < 1) requestAnimationFrame(bounce);
        else mesh.scale.setScalar(1);
      }
      requestAnimationFrame(bounce);
    });

    let running = false;

    function animate(time) {
      if (!running) return;
      requestAnimationFrame(animate);
      const t = time * 0.001;

      orbGroup.rotation.y += 0.003;
      orbGroup.rotation.x = Math.sin(t * 0.2) * 0.1;

      orbs.forEach((o, idx) => {
        o.mesh.position.y += Math.sin(t * o.speed + o.phase) * 0.003;
      });

      raycaster.setFromCamera(mouse, camera);
      const meshes = orbs.map((o) => o.mesh);
      const intersects = raycaster.intersectObjects(meshes);
      const newlyHovered = intersects.length ? orbs.find((o) => o.mesh === intersects[0].object) : null;

      hoveredOrb = newlyHovered;

      orbs.forEach((o) => {
        const mat = o.mesh.material;
        if (o === hoveredOrb) {
          o.mesh.scale.setScalar(1.4);
          mat.emissiveIntensity = 0.8;
          mat.opacity = 1;
          mat.transparent = true;
        } else {
          o.mesh.scale.setScalar(1);
          mat.emissiveIntensity = 0.3;
          mat.transparent = true;
          mat.opacity = hoveredOrb ? 0.6 : 1.0;
        }
      });

      renderer.render(scene, camera);
    }

    function start() {
      if (running) return;
      running = true;
      requestAnimationFrame(animate);
    }
    function stop() {
      running = false;
    }

    useIntersectionToggle(container, start, stop);

    window.addEventListener("resize", () => {
      if (!container.clientWidth) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }

  // ================= CONTACT ENVELOPE =================
  function initContactEnvelope() {
    const container = document.getElementById("contact-envelope-container");
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 6);

    const renderer = createRenderer(container);

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const point = new THREE.PointLight(0x00ff41, 0.6, 15);
    point.position.set(1, 2, 3);
    scene.add(point);

    const envelopeGroup = new THREE.Group();
    scene.add(envelopeGroup);

    const bodyGeom = new THREE.BoxGeometry(3, 2, 0.1);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    envelopeGroup.add(body);

    const edges = new THREE.EdgesGeometry(bodyGeom);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x00ff41 });
    const edgeLines = new THREE.LineSegments(edges, edgeMat);
    envelopeGroup.add(edgeLines);

    const flapGeom = new THREE.BufferGeometry();
    const flapVerts = new Float32Array([
      -1.5, 0, 0.06,
      1.5, 0, 0.06,
      0, 1, 0.06,
    ]);
    flapGeom.setAttribute("position", new THREE.BufferAttribute(flapVerts, 3));
    flapGeom.computeVertexNormals();
    const flapMat = new THREE.MeshLambertMaterial({ color: 0x161616 });
    const flap = new THREE.Mesh(flapGeom, flapMat);
    flap.position.y = 0.5;
    envelopeGroup.add(flap);

    const sealGeom = new THREE.CircleGeometry(0.25, 16);
    const sealMat = new THREE.MeshLambertMaterial({
      color: 0x00ff41,
      emissive: 0x00ff41,
      emissiveIntensity: 0.5,
    });
    const seal = new THREE.Mesh(sealGeom, sealMat);
    seal.position.set(0, 0, 0.08);
    envelopeGroup.add(seal);

    const vLineGeom = new THREE.BoxGeometry(0.05, 1.6, 0.02);
    const vLineMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    const v1 = new THREE.Mesh(vLineGeom, vLineMat);
    v1.rotation.z = Math.PI / 4;
    v1.position.set(-0.75, -0.1, 0.05);
    const v2 = v1.clone();
    v2.rotation.z = -Math.PI / 4;
    v2.position.set(0.75, -0.1, 0.05);
    envelopeGroup.add(v1, v2);

    let running = false;
    let sendAnim = null;

    function animate(time) {
      if (!running) return;
      requestAnimationFrame(animate);

      const t = time * 0.001;

      if (!sendAnim) {
        envelopeGroup.position.y = Math.sin(t) * 0.15;
        envelopeGroup.rotation.z = Math.sin(t * 0.5) * 0.05;
      } else {
        const elapsed = (performance.now() - sendAnim.start) / sendAnim.duration;
        if (elapsed < 1) {
          const eased = 1 - Math.pow(1 - elapsed, 3);
          envelopeGroup.position.y = THREE.MathUtils.lerp(0, 10, eased);
          sealMat.emissiveIntensity = 1;
        } else if (!sendAnim.incoming) {
          sendAnim.incoming = true;
          envelopeGroup.position.y = -10;
          sendAnim.start = performance.now();
        } else if (elapsed < 2) {
          const e2 = (performance.now() - sendAnim.start) / sendAnim.duration;
          const eased2 = 1 - Math.pow(1 - Math.min(e2, 1), 3);
          envelopeGroup.position.y = THREE.MathUtils.lerp(-10, 0, eased2);
          sealMat.emissiveIntensity = 0.8;
        } else {
          sendAnim = null;
          sealMat.emissiveIntensity = 0.5;
        }
      }

      sealMat.emissiveIntensity =
        (sealMat.emissiveIntensity || 0.3) +
        Math.sin(t * 2) * 0.3 * (sendAnim ? 0 : 1);

      renderer.render(scene, camera);
    }

    function start() {
      if (running) return;
      running = true;
      requestAnimationFrame(animate);
    }
    function stop() {
      running = false;
    }

    useIntersectionToggle(container, start, stop);

    window.addEventListener("resize", () => {
      if (!container.clientWidth) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    window.notifyContactSent = () => {
      sendAnim = { start: performance.now(), duration: 1000, incoming: false };
    };
  }
})(); 

