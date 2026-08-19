"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import { Button } from "@/components/ui/Button";
import { BRAND } from "@/lib/constants";
import { useReducedMotion } from "@/lib/useReducedMotion";
import "./horizon-hero-section.css";

interface MountainUserData {
  baseZ: number;
  index: number;
}

interface ThreeRefs {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  composer: EffectComposer | null;
  stars: THREE.Points[];
  nebula: THREE.Mesh | null;
  atmosphere: THREE.Mesh | null;
  mountains: THREE.Mesh[];
  animationId: number | null;
  targetCameraX?: number;
  targetCameraY?: number;
  targetCameraZ?: number;
}

const TOTAL_SECTIONS = 2;

export const Component = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beat1Ref = useRef<HTMLElement>(null);
  const smoothCameraPos = useRef({ x: 0, y: 30, z: 100 });
  const reducedMotion = useReducedMotion();

  const threeRefs = useRef<ThreeRefs>({
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    stars: [],
    nebula: null,
    atmosphere: null,
    mountains: [],
    animationId: null,
  });

  // Drives every scroll-linked value below — the camera flythrough, the
  // mountain zoom, the glow fade, and the text/indicator crossfades — off a
  // single tracked value instead of a native 'scroll' listener paired with
  // several setState calls per tick. Those setState calls forced a full
  // React re-render of the hero on every scroll event for the entire scroll
  // range (on top of Lenis and GSAP ScrollTrigger both also listening) —
  // the actual source of the scroll jank. useScroll + useTransform update
  // styles as motion values that bypass React's render cycle entirely; the
  // one place raw scroll values are still needed (the imperative Three.js
  // camera/mesh updates) reads them in a change-listener that only mutates
  // refs, never state. offset ["start start","end end"] matches the old
  // manual (scrollY-heroTop)/(heroHeight-viewportHeight) formula exactly:
  // 0 when the hero's top hits the viewport top, 1 when the hero's bottom
  // hits the viewport bottom.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // display:none once scrolled at/past the hero's own end (progress hits 1)
  // — the fixed canvas and blackout overlay have no release point of their
  // own, so without this they'd keep painting over every section below the
  // hero indefinitely.
  const pastHeroDisplay = useTransform(scrollYProgress, (v) => (v >= 1 ? "none" : "block"));
  // CSS-only fallback fade to solid black over the final stretch, so the
  // transition is guaranteed smooth even for reduced-motion users (no camera
  // movement here, just a color fade, which isn't a vestibular trigger).
  const blackoutOpacity = useTransform(scrollYProgress, [0.9, 1], [0, 1]);

  // Each beat line fades in/out against its own section's scroll-visibility
  // window (0 = just entering at the viewport's bottom edge, 1 = fully
  // exited past its top edge) rather than a hand-picked slice of the hero's
  // *overall* scroll fraction — the latter doesn't account for where each
  // content-section actually falls in the document, so the fade played out
  // entirely before the text had even scrolled into a legible position.
  const { scrollYProgress: beat1Progress } = useScroll({
    target: beat1Ref,
    offset: ["start end", "end start"],
  });
  const beat1Opacity = useTransform(beat1Progress, [0, 0.35, 0.65, 1], [0, 1, 1, 0]);
  const beat1Y = useTransform(beat1Progress, [0, 0.35], [40, 0]);

  // Initialize Three.js
  useEffect(() => {
    // Fired once the scene has actually painted a frame — the Preloader
    // listens for this so it can hold the loading state through WebGL/shader
    // init instead of dismissing on a fixed timer that may finish first.
    let readyFired = false;

    const initThree = () => {
      const { current: refs } = threeRefs;
      if (!canvasRef.current) return;

      // Scene setup
      refs.scene = new THREE.Scene();
      refs.scene.fog = new THREE.FogExp2(0x0a0b0b, 0.00025);

      // Camera
      refs.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
      );
      refs.camera.position.z = 100;
      refs.camera.position.y = 20;
      // Set once so a static, well-framed shot exists even if the
      // per-frame camera follow (below) never runs, e.g. reduced-motion
      refs.camera.lookAt(0, 10, -600);

      // Renderer
      refs.renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        alpha: true,
      });
      refs.renderer.setSize(window.innerWidth, window.innerHeight);
      refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      refs.renderer.toneMappingExposure = 0.5;

      // Post-processing
      refs.composer = new EffectComposer(refs.renderer);
      const renderPass = new RenderPass(refs.scene, refs.camera);
      refs.composer.addPass(renderPass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.8,
        0.4,
        0.85
      );
      refs.composer.addPass(bloomPass);

      // Create scene elements
      createStarField();
      createNebula();
      createMountains();
      createAtmosphere();

      // Start animation
      animate();
    };

    const createStarField = () => {
      const { current: refs } = threeRefs;
      const starCount = 5000;

      for (let i = 0; i < 3; i++) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let j = 0; j < starCount; j++) {
          const radius = 200 + Math.random() * 800;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);

          positions[j * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[j * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[j * 3 + 2] = radius * Math.cos(phi);

          // Color variation — MAP palette: cool-white stars with a crimson accent
          const color = new THREE.Color();
          const colorChoice = Math.random();
          if (colorChoice < 0.7) {
            color.setHSL(0, 0, 0.8 + Math.random() * 0.2);
          } else if (colorChoice < 0.9) {
            color.setHSL(0.0, 0.75, 0.55);
          } else {
            color.setHSL(0.0, 0.45, 0.35);
          }

          colors[j * 3] = color.r;
          colors[j * 3 + 1] = color.g;
          colors[j * 3 + 2] = color.b;

          sizes[j] = Math.random() * 2 + 0.5;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            depth: { value: i },
          },
          vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            uniform float depth;

            void main() {
              vColor = color;
              vec3 pos = position;

              // Slow rotation based on depth
              float angle = time * 0.05 * (1.0 - depth * 0.3);
              mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
              pos.xy = rot * pos.xy;

              vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
              gl_PointSize = size * (300.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            varying vec3 vColor;

            void main() {
              float dist = length(gl_PointCoord - vec2(0.5));
              if (dist > 0.5) discard;

              float opacity = 1.0 - smoothstep(0.0, 0.5, dist);
              gl_FragColor = vec4(vColor, opacity);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });

        const stars = new THREE.Points(geometry, material);
        refs.scene!.add(stars);
        refs.stars.push(stars);
      }
    };

    const createNebula = () => {
      const { current: refs } = threeRefs;

      const geometry = new THREE.PlaneGeometry(8000, 4000, 100, 100);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color(0x1a0306) },
          color2: { value: new THREE.Color(0xde1f26) },
          opacity: { value: 0.35 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying float vElevation;
          uniform float time;

          void main() {
            vUv = uv;
            vec3 pos = position;

            float elevation = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 20.0;
            pos.z += elevation;
            vElevation = elevation;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
          uniform float opacity;
          uniform float time;
          varying vec2 vUv;
          varying float vElevation;

          void main() {
            float mixFactor = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
            vec3 color = mix(color1, color2, mixFactor * 0.5 + 0.5);

            float alpha = opacity * (1.0 - length(vUv - 0.5) * 2.0);
            alpha *= 1.0 + vElevation * 0.01;

            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const nebula = new THREE.Mesh(geometry, material);
      nebula.position.z = -1050;
      nebula.rotation.x = 0;
      refs.scene!.add(nebula);
      refs.nebula = nebula;
    };

    const createMountains = () => {
      const { current: refs } = threeRefs;

      const layers = [
        { distance: -50, height: 60, color: 0x120607, opacity: 1 },
        { distance: -100, height: 80, color: 0x1c0a0c, opacity: 0.85 },
        { distance: -150, height: 100, color: 0x2a0f12, opacity: 0.65 },
        { distance: -200, height: 120, color: 0x3a1216, opacity: 0.45 },
      ];

      layers.forEach((layer, index) => {
        const points: THREE.Vector2[] = [];
        const segments = 50;

        for (let i = 0; i <= segments; i++) {
          const x = (i / segments - 0.5) * 1000;
          const y =
            Math.sin(i * 0.1) * layer.height +
            Math.sin(i * 0.05) * layer.height * 0.5 +
            Math.random() * layer.height * 0.2 -
            100;
          points.push(new THREE.Vector2(x, y));
        }

        points.push(new THREE.Vector2(5000, -300));
        points.push(new THREE.Vector2(-5000, -300));

        const shape = new THREE.Shape(points);
        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
          color: layer.color,
          transparent: true,
          opacity: layer.opacity,
          side: THREE.DoubleSide,
        });

        const mountain = new THREE.Mesh(geometry, material);
        mountain.position.z = layer.distance;
        mountain.position.y = layer.distance;
        mountain.userData = { baseZ: layer.distance, index } satisfies MountainUserData;
        refs.scene!.add(mountain);
        refs.mountains.push(mountain);
      });
    };

    const createAtmosphere = () => {
      const { current: refs } = threeRefs;

      const geometry = new THREE.SphereGeometry(1600, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          // Driven by scroll (see the scroll listener's glowFade) so the
          // ambient glow fades out once, monotonically, instead of the
          // fresnel term below re-brightening later purely because the
          // flythrough camera's angle to the shell happens to swing back
          // toward a grazing angle.
          fade: { value: 1 },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vWorldPosition;

          void main() {
            vNormal = normalize(normalMatrix * normal);
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vWorldPosition;
          uniform float time;
          uniform float fade;

          void main() {
            // Fresnel against the true view direction (camera to fragment), not a
            // fixed world axis — a fixed axis means the flythrough camera sweeps
            // its look direction across it as it scrolls, spiking intensity to a
            // bloom-blown full-screen wash for large stretches of the scroll.
            // Grazing-angle-only glow stays a rim light regardless of camera pose.
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);
            float intensity = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.0) * fade;
            vec3 atmosphere = vec3(0.87, 0.12, 0.15) * intensity;

            float pulse = sin(time * 2.0) * 0.1 + 0.9;
            atmosphere *= pulse;

            gl_FragColor = vec4(atmosphere, intensity * 0.25);
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
      });

      const atmosphere = new THREE.Mesh(geometry, material);
      refs.scene!.add(atmosphere);
      refs.atmosphere = atmosphere;
    };

    const animate = () => {
      const { current: refs } = threeRefs;
      refs.animationId = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      // Update stars
      refs.stars.forEach((starField) => {
        const material = starField.material as THREE.ShaderMaterial;
        if (material.uniforms) {
          material.uniforms.time.value = time;
        }
      });

      // Update nebula
      if (refs.nebula) {
        const material = refs.nebula.material as THREE.ShaderMaterial;
        if (material.uniforms) {
          material.uniforms.time.value = time * 0.5;
        }
      }

      // Smooth camera movement with easing
      if (refs.camera && refs.targetCameraX !== undefined) {
        const smoothingFactor = 0.05; // Lower = smoother but slower

        // Calculate smooth position with easing
        smoothCameraPos.current.x +=
          (refs.targetCameraX - smoothCameraPos.current.x) * smoothingFactor;
        smoothCameraPos.current.y +=
          (refs.targetCameraY! - smoothCameraPos.current.y) * smoothingFactor;
        smoothCameraPos.current.z +=
          (refs.targetCameraZ! - smoothCameraPos.current.z) * smoothingFactor;

        // Add subtle floating motion
        const floatX = Math.sin(time * 0.1) * 2;
        const floatY = Math.cos(time * 0.15) * 1;

        // Apply final position
        refs.camera.position.x = smoothCameraPos.current.x + floatX;
        refs.camera.position.y = smoothCameraPos.current.y + floatY;
        refs.camera.position.z = smoothCameraPos.current.z;
        refs.camera.lookAt(0, 10, -600);
      }

      // Parallax mountains with subtle animation
      refs.mountains.forEach((mountain, i) => {
        const parallaxFactor = 1 + i * 0.5;
        mountain.position.x = Math.sin(time * 0.1) * 2 * parallaxFactor;
        mountain.position.y = 50 + Math.cos(time * 0.15) * 1 * parallaxFactor;
      });

      if (refs.composer) {
        refs.composer.render();
      }

      if (!readyFired) {
        readyFired = true;
        window.dispatchEvent(new Event("map:hero-ready"));
      }
    };

    initThree();

    // Handle resize
    const handleResize = () => {
      const { current: refs } = threeRefs;
      if (refs.camera && refs.renderer && refs.composer) {
        refs.camera.aspect = window.innerWidth / window.innerHeight;
        refs.camera.updateProjectionMatrix();
        refs.renderer.setSize(window.innerWidth, window.innerHeight);
        refs.composer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      const { current: refs } = threeRefs;

      if (refs.animationId) {
        cancelAnimationFrame(refs.animationId);
      }

      window.removeEventListener("resize", handleResize);

      // Dispose Three.js resources
      refs.stars.forEach((starField) => {
        starField.geometry.dispose();
        (starField.material as THREE.Material).dispose();
      });

      refs.mountains.forEach((mountain) => {
        mountain.geometry.dispose();
        (mountain.material as THREE.Material).dispose();
      });

      if (refs.nebula) {
        refs.nebula.geometry.dispose();
        (refs.nebula.material as THREE.Material).dispose();
      }

      if (refs.atmosphere) {
        refs.atmosphere.geometry.dispose();
        (refs.atmosphere.material as THREE.Material).dispose();
      }

      if (refs.renderer) {
        refs.renderer.dispose();
      }

      // Reset so a StrictMode dev re-mount (mount → cleanup → mount) starts
      // from an empty scene instead of accumulating a second, disposed copy
      // of every mesh on top of the arrays from the first mount — the stale
      // entries never rendered (their geometry/material were disposed and
      // they weren't re-added to the fresh scene below), but they did throw
      // off refs.mountains[0]/[length-1] (the near-zoom and nebula-depth
      // targets), silently pointing them at an orphaned mesh instead of the
      // live one, and doubled the per-frame parallax work for nothing.
      refs.scene = null;
      refs.camera = null;
      refs.renderer = null;
      refs.composer = null;
      refs.stars = [];
      refs.nebula = null;
      refs.atmosphere = null;
      refs.mountains = [];
      refs.animationId = null;
    };
  }, []);

  // Imperative Three.js updates only — camera position, mountain zoom,
  // nebula depth, glow fade. Never calls setState, so it never triggers a
  // React re-render; the DOM-facing values above (opacity/display) are
  // separate motion values that framer-motion updates directly. Defined as
  // a plain function (called from, rather than inlined into, the
  // useMotionValueEvent callback below) — react-hooks' immutability check
  // treats mutations written directly in an effect-like callback as
  // modifying a captured value, even though threeRefs is a ref specifically
  // meant for this; wrapping it in an ordinary function sidesteps that
  // without changing the actual behavior.
  const updateSceneForProgress = (progress: number) => {
    const refs = threeRefs.current;
    if (!refs.nebula) return;

    const heroEl = containerRef.current;
    if (!heroEl) return;

    // Calculate smooth progress through all sections
    const totalProgress = progress * TOTAL_SECTIONS;
    const sectionProgress = totalProgress % 1;
    const newSection = Math.floor(totalProgress);

    // Skipped under prefers-reduced-motion — a scroll-linked camera
    // flythrough is exactly the kind of vestibular trigger that setting
    // warns about, so the camera simply holds its initial position.
    if (reducedMotion) return;

    // Define camera positions for each section
    const cameraPositions = [
      { x: 0, y: 30, z: 300 }, // near the base
      { x: 0, y: 40, z: -50 }, // mid-climb
      { x: 0, y: 50, z: -700 }, // near the summit
    ];

    // Get current and next positions
    const currentPos = cameraPositions[newSection] || cameraPositions[0];
    const nextPos = cameraPositions[newSection + 1] || currentPos;

    // Set target positions (actual smoothing happens in animate loop)
    refs.targetCameraX = currentPos.x + (nextPos.x - currentPos.x) * sectionProgress;
    refs.targetCameraY = currentPos.y + (nextPos.y - currentPos.y) * sectionProgress;
    refs.targetCameraZ = currentPos.z + (nextPos.z - currentPos.z) * sectionProgress;

    // Mountains hold near their initial position — the camera does the
    // traveling (their only other motion is the subtle sin/cos wobble in
    // the render loop, plus the zoom below). The nebula still drifts with
    // scroll for a sense of depth behind them.
    const rect = heroEl.getBoundingClientRect();
    const heroTop = rect.top + window.scrollY;
    const heroScrollY = window.scrollY - heroTop;
    const backMountain = refs.mountains[refs.mountains.length - 1];
    if (backMountain) {
      const speed = 1 + (refs.mountains.length - 1) * 0.9;
      const nebulaTargetZ = (backMountain.userData as MountainUserData).baseZ + heroScrollY * speed * 0.5;
      refs.nebula.position.z = nebulaTargetZ - 100;
    }

    // Ambient red glow (nebula + atmosphere shell) fades out once,
    // monotonically, across the mid-climb stretch so it's already dark by
    // the time the summit comes into view — black becomes the resting
    // state for the rest of the hero instead of the atmosphere's
    // view-angle-driven fresnel swinging bright again independent of scroll
    // direction. Smoothstep-eased so the fade itself doesn't read as a hard
    // cut.
    const glowLinear = Math.max(0, Math.min(1, (progress - 0.45) / 0.33));
    const glowFade = 1 - glowLinear * glowLinear * (3 - 2 * glowLinear);
    const nebulaMaterial = refs.nebula.material as THREE.ShaderMaterial;
    if (nebulaMaterial.uniforms) {
      nebulaMaterial.uniforms.opacity.value = 0.35 * glowFade;
    }
    const atmosphere = refs.atmosphere;
    if (atmosphere) {
      const atmosphereMaterial = atmosphere.material as THREE.ShaderMaterial;
      if (atmosphereMaterial.uniforms) {
        atmosphereMaterial.uniforms.fade.value = glowFade;
      }
    }

    // After the summit line has had room to be read, zoom the nearest peak
    // into frame — dissolving to black instead of the mountains just
    // cutting out abruptly. Eased (t²) so it starts gently and accelerates
    // into the final black frame.
    const zoomLinear = Math.max(0, Math.min(1, (progress - 0.87) / 0.13));
    const zoomT = zoomLinear * zoomLinear;
    const nearMountain = refs.mountains[0];
    if (nearMountain) {
      nearMountain.scale.setScalar(1 + zoomT * 14);
    }
  };

  useMotionValueEvent(scrollYProgress, "change", updateSceneForProgress);

  return (
    <div ref={containerRef} className="hero-container">
      <motion.canvas ref={canvasRef} className="hero-canvas" style={{ display: pastHeroDisplay }} />

      {/* Fades to solid black over the final stretch of scroll, so the
          hero dissolves into the next section instead of cutting abruptly. */}
      <motion.div
        className="hero-blackout"
        style={{ opacity: blackoutOpacity, display: pastHeroDisplay }}
        aria-hidden
      />

      <div className="hero-content">
        <span className="hero-overline font-display">{BRAND.fullName}</span>

        <motion.h1
          className="hero-headline"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
        >
          Reach Your <span className="text-crimson">Peak</span> With MAP Fitness
        </motion.h1>

        <motion.div
          className="hero-cta"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.5 }}
        >
          <Button href="/about" variant="ghost">
            Explore MAP →
          </Button>
        </motion.div>

        <motion.div
          className="scroll-hint"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.65 }}
        >
          <span className="scroll-hint-text">Scroll Down to Explore</span>
          <span className="scroll-hint-line" />
        </motion.div>
      </div>

      {/* First reveal of the climb — establishes emotion, not information. */}
      <div className="scroll-sections">
        <section ref={beat1Ref} className="content-section">
          <motion.div style={{ opacity: beat1Opacity, y: beat1Y }}>
            <p className="beat-eyebrow">The Journey Starts Here</p>
            <h2 className="beat-text">The Climb</h2>
            <p className="beat-subtext">
              Strength is built.
              <br />
              Performance is earned.
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  );
};
