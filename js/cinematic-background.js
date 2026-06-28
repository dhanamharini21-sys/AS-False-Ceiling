/* ============================================
   LUXECEILING - Cinematic False Ceiling Showroom
   Premium 3D Background Experience
   ============================================ */

// ========== GLOBAL VARIABLES ==========
let bgScene, bgCamera, bgRenderer;
let falseCeilingGroup;
let particles;
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;
let scrollY = 0;
let animationId;
const clock = new THREE.Clock();

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    initCinematicBackground();
});

function initCinematicBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    // Scene setup
    bgScene = new THREE.Scene();
    bgScene.background = new THREE.Color(0x0a0a0a);
    bgScene.fog = new THREE.Fog(0x0a0a0a, 5, 50);

    // Camera setup - neutral position
    bgCamera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );
    bgCamera.position.set(0, 0, 7);

    // Renderer setup
    bgRenderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: window.innerWidth > 768,
        alpha: true,
        powerPreference: "high-performance"
    });
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    bgRenderer.outputEncoding = THREE.sRGBEncoding;

    // Create global false ceiling group for external access
    window.falseCeilingGroup = new THREE.Group();
    
    // Create scene elements
    createFalseCeiling();
    createCoveLighting();
    createParticles();
    createLights();

    // Event listeners
    window.addEventListener('resize', onWindowResize, { passive: true });
    document.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // Start animation
    animate();
}

// ========== FALSE CEILING MODEL ==========
function createFalseCeiling() {
    // Main ceiling panel - wireframe for high-tech blueprint look
    const ceilingGeo = new THREE.BoxGeometry(6, 0.4, 4);
    const ceilingMat = new THREE.MeshBasicMaterial({ 
        color: 0x111111, 
        wireframe: true
    });
    const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
    window.falseCeilingGroup.add(ceilingMesh);

    // Glowing border frame - luxury neon gold outline
    const glowGeo = new THREE.BoxGeometry(6.2, 0.1, 4.2);
    const glowMat = new THREE.MeshBasicMaterial({ 
        color: 0xd4af37, 
        transparent: true, 
        opacity: 0.8 
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    window.falseCeilingGroup.add(glowMesh);

    // Position the group at center, slightly back
    window.falseCeilingGroup.position.set(0, 0, -2);
    bgScene.add(window.falseCeilingGroup);
}

// ========== COVE LIGHTING ==========
function createCoveLighting() {
    const lightCount = 4;
    const coveLights = [];

    for (let i = 0; i < lightCount; i++) {
        const lightGeometry = new THREE.BoxGeometry(2, 0.1, 0.3);
        const lightMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.9
        });
        
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        
        // Position lights around the ceiling
        const angle = (i / lightCount) * Math.PI * 2;
        const radius = 2;
        light.position.x = Math.cos(angle) * radius;
        light.position.z = Math.sin(angle) * radius;
        light.position.y = -0.2;
        light.rotation.y = angle + Math.PI / 2;
        
        window.falseCeilingGroup.add(light);
        coveLights.push(light);

        // Add point light for glow
        const pointLight = new THREE.PointLight(0xffd700, 2, 10);
        pointLight.position.copy(light.position);
        window.falseCeilingGroup.add(pointLight);
    }
}

// ========== PARTICLES (Light Rays/Dust) ==========
function createParticles() {
    const particleCount = 300;
    
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        // Position particles in a volume
        positions[i * 3] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 1] = Math.random() * 8;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

        // Golden-white color
        const colorChoice = Math.random();
        if (colorChoice > 0.7) {
            colors[i * 3] = 0.83;     // Gold
            colors[i * 3 + 1] = 0.69;
            colors[i * 3 + 2] = 0.22;
        } else {
            colors[i * 3] = 1;        // White
            colors[i * 3 + 1] = 0.97;
            colors[i * 3 + 2] = 0.91;
        }

        sizes[i] = Math.random() * 0.05 + 0.02;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    bgScene.add(particles);
}

// ========== LIGHTING ==========
function createLights() {
    // Ambient light - bright for visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    bgScene.add(ambientLight);

    // Main key light - warm golden
    const keyLight = new THREE.DirectionalLight(0xffd700, 1.5);
    keyLight.position.set(5, 10, 5);
    bgScene.add(keyLight);

    // Fill light - soft white
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
    fillLight.position.set(-5, 8, -5);
    bgScene.add(fillLight);

    // Rim light - gold accent
    const rimLight = new THREE.DirectionalLight(0xd4af37, 0.8);
    rimLight.position.set(0, 5, -10);
    bgScene.add(rimLight);
}

// ========== EVENT HANDLERS ==========
function onWindowResize() {
    if (!bgCamera || !bgRenderer) return;
    
    bgCamera.aspect = window.innerWidth / window.innerHeight;
    bgCamera.updateProjectionMatrix();
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
    targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onScroll() {
    scrollY = window.scrollY;
}

// ========== ANIMATION LOOP ==========
function animate() {
    animationId = requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();

    // Smooth mouse follow
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Parallax camera movement
    if (bgCamera) {
        bgCamera.position.x = mouseX * 0.5;
        bgCamera.position.y = mouseY * 0.3;
        bgCamera.lookAt(0, 0, 0);
    }

    // Scroll-based depth
    if (bgCamera && scrollY > 0) {
        const scrollProgress = Math.min(scrollY / 1000, 1);
        bgCamera.position.z = 7 - scrollProgress * 2;
    }

    // Animate false ceiling group if it exists
    if (window.falseCeilingGroup) {
        window.falseCeilingGroup.rotation.y = Math.sin(time * 0.2) * 0.1;
    }

    // Render
    bgRenderer.render(bgScene, bgCamera);
}

// ========== PERFORMANCE OPTIMIZATIONS ==========
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(animationId);
    } else {
        animate();
    }
});

// Reduce quality on mobile
if (window.innerWidth < 768) {
    if (bgRenderer) {
        bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    if (bgRenderer) {
        bgRenderer.dispose();
    }
    
    if (bgScene) {
        bgScene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
});

console.debug('✨ Cinematic False Ceiling Showroom Ready');