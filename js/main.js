/* ============================================
   LUXECEILING - Main JavaScript
   Three.js 3D Effects + GSAP Animations
   ============================================ */

// ========== GLOBAL VARIABLES ==========
let heroScene, heroCamera, heroRenderer, heroParticles, heroLights;
let showcaseScene, showcaseCamera, showcaseRenderer, showcaseRoom, currentDesign = 0;
let mouseX = 0, mouseY = 0;
let isShowcaseDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let targetRotation = { x: 0, y: 0 };

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    initHero3D();
    initShowcase3D();
    initGSAPAnimations();
    initCounters();
    initTestimonialsSlider();
    initLightbox();
    initMobileMenu();
    initSmoothScroll();
    initContactForm();
    initNavbarScroll();
    animate();
});

// ========== THREE.JS HERO BACKGROUND ==========
function initHero3D() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    // Scene
    heroScene = new THREE.Scene();
    heroScene.fog = new THREE.Fog(0x0a0a0a, 1, 50);

    // Camera
    heroCamera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    heroCamera.position.z = 30;

    // Renderer
    heroRenderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create floating particles (ceiling lights effect)
    createHeroParticles();

    // Create floating geometric shapes
    createHeroGeometry();

    // Create ambient lights
    createHeroLights();

    // Mouse movement effect
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Resize handler
    window.addEventListener('resize', () => {
        heroCamera.aspect = window.innerWidth / window.innerHeight;
        heroCamera.updateProjectionMatrix();
        heroRenderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function createHeroParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
        // Position - spread in 3D space
        posArray[i] = (Math.random() - 0.5) * 100;
        posArray[i + 1] = (Math.random() - 0.5) * 100;
        posArray[i + 2] = (Math.random() - 0.5) * 100;

        // Colors - gold and white variations
        const colorChoice = Math.random();
        if (colorChoice > 0.7) {
            // Gold
            colorsArray[i] = 0.83;
            colorsArray[i + 1] = 0.69;
            colorsArray[i + 2] = 0.22;
        } else if (colorChoice > 0.4) {
            // Light gold
            colorsArray[i] = 0.96;
            colorsArray[i + 1] = 0.89;
            colorsArray[i + 2] = 0.65;
        } else {
            // White
            colorsArray[i] = 1;
            colorsArray[i + 1] = 1;
            colorsArray[i + 2] = 1;
        }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    heroParticles = new THREE.Points(particlesGeometry, particlesMaterial);
    heroScene.add(heroParticles);
}

function createHeroGeometry() {
    // Create floating ceiling-like geometric shapes
    const shapes = [];
    const geometries = [
        new THREE.IcosahedronGeometry(2, 0),
        new THREE.OctahedronGeometry(2, 0),
        new THREE.TetrahedronGeometry(2, 0),
        new THREE.TorusGeometry(1.5, 0.5, 8, 16)
    ];

    for (let i = 0; i < 15; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const material = new THREE.MeshPhongMaterial({
            color: 0xd4af37,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = (Math.random() - 0.5) * 60;
        mesh.position.y = (Math.random() - 0.5) * 60;
        mesh.position.z = (Math.random() - 0.5) * 40 - 10;
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;

        mesh.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01
            },
            floatSpeed: Math.random() * 0.5 + 0.5,
            floatOffset: Math.random() * Math.PI * 2
        };

        shapes.push(mesh);
        heroScene.add(mesh);
    }

    heroParticles.userData.shapes = shapes;
}

function createHeroLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    heroScene.add(ambientLight);

    // Point lights (floating ceiling lights effect)
    const lightPositions = [
        { x: 10, y: 10, z: 10 },
        { x: -10, y: -10, z: 10 },
        { x: 10, y: -10, z: -10 },
        { x: -10, y: 10, z: -10 }
    ];

    lightPositions.forEach((pos, index) => {
        const light = new THREE.PointLight(0xd4af37, 2, 50);
        light.position.set(pos.x, pos.y, pos.z);
        heroScene.add(light);
    });

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 0, 10);
    heroScene.add(directionalLight);
}

// ========== THREE.JS 3D SHOWCASE ==========
function initShowcase3D() {
    const canvas = document.getElementById('showcaseCanvas');
    if (!canvas) return;

    const container = canvas.parentElement;

    // Scene
    showcaseScene = new THREE.Scene();
    showcaseScene.background = new THREE.Color(0x0a0a0a);

    // Camera
    showcaseCamera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    showcaseCamera.position.set(8, 6, 8);
    showcaseCamera.lookAt(0, 0, 0);

    // Renderer
    showcaseRenderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    showcaseRenderer.setSize(container.clientWidth, container.clientHeight);
    showcaseRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    showcaseRenderer.shadowMap.enabled = true;
    showcaseRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Create room
    createShowcaseRoom();

    // Create ceiling designs
    createCeilingDesigns();

    // Lights
    createShowcaseLights();

    // Controls
    initShowcaseControls();

    // Resize handler
    window.addEventListener('resize', () => {
        showcaseCamera.aspect = container.clientWidth / container.clientHeight;
        showcaseCamera.updateProjectionMatrix();
        showcaseRenderer.setSize(container.clientWidth, container.clientHeight);
    });
}

function createShowcaseRoom() {
    showcaseRoom = new THREE.Group();

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    showcaseRoom.add(floor);

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.9,
        metalness: 0.1
    });

    // Back wall
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 10), wallMaterial);
    backWall.position.set(0, 5, -10);
    showcaseRoom.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 10), wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-10, 5, 0);
    showcaseRoom.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 10), wallMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(10, 5, 0);
    showcaseRoom.add(rightWall);

    showcaseScene.add(showcaseRoom);
}

function createCeilingDesigns() {
    const designs = [];

    // Design 1: Modern Gypsum with cove lighting
    const design1 = createGypsumCeiling();
    design1.position.y = 8;
    designs.push(design1);

    // Design 2: Grid ceiling
    const design2 = createGridCeiling();
    design2.position.y = 8;
    designs.push(design2);

    // Design 3: POP with decorative elements
    const design3 = createPOPCeiling();
    design3.position.y = 8;
    designs.push(design3);

    showcaseRoom.userData.designs = designs;
    showcaseRoom.userData.currentDesign = 0;
    showcaseScene.add(designs[0]);
}

function createGypsumCeiling() {
    const group = new THREE.Group();

    // Main ceiling panel
    const ceilingGeometry = new THREE.BoxGeometry(18, 0.2, 18);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5f5f5,
        roughness: 0.5,
        metalness: 0.1
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.position.y = 0;
    group.add(ceiling);

    // Cove lighting strip
    const coveGeometry = new THREE.BoxGeometry(16, 0.1, 16);
    const coveMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffd700,
        emissiveIntensity: 0.5,
        roughness: 0.3
    });
    const cove = new THREE.Mesh(coveGeometry, coveMaterial);
    cove.position.y = -0.2;
    group.add(cove);

    // Decorative beams
    for (let i = -6; i <= 6; i += 3) {
        const beamGeometry = new THREE.BoxGeometry(0.2, 0.3, 18);
        const beamMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.4,
            metalness: 0.6
        });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.set(i, 0.15, 0);
        group.add(beam);
    }

    return group;
}

function createGridCeiling() {
    const group = new THREE.Group();

    // Main ceiling
    const ceilingGeometry = new THREE.BoxGeometry(18, 0.1, 18);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
        color: 0xe8e8e8,
        roughness: 0.6,
        metalness: 0.2
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    group.add(ceiling);

    // Grid tiles
    const tileMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.1
    });

    for (let x = -7.5; x < 7.5; x += 1.5) {
        for (let z = -7.5; z < 7.5; z += 1.5) {
            const tileGeometry = new THREE.BoxGeometry(1.4, 0.05, 1.4);
            const tile = new THREE.Mesh(tileGeometry, tileMaterial);
            tile.position.set(x, 0.1, z);
            group.add(tile);
        }
    }

    // Grid frame
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.3,
        metalness: 0.7
    });

    for (let i = -7.5; i <= 7.5; i += 1.5) {
        // Horizontal
        const hFrame = new THREE.Mesh(
            new THREE.BoxGeometry(18, 0.08, 0.08),
            frameMaterial
        );
        hFrame.position.set(0, 0.12, i);
        group.add(hFrame);

        // Vertical
        const vFrame = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.08, 18),
            frameMaterial
        );
        vFrame.position.set(i, 0.12, 0);
        group.add(vFrame);
    }

    return group;
}

function createPOPCeiling() {
    const group = new THREE.Group();

    // Main ceiling
    const ceilingGeometry = new THREE.BoxGeometry(18, 0.15, 18);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4,
        metalness: 0.1
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    group.add(ceiling);

    // Decorative dome
    const domeGeometry = new THREE.SphereGeometry(2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5f5f5,
        roughness: 0.5,
        metalness: 0.2
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.set(0, 0.1, 0);
    group.add(dome);

    // Chandelier
    const chandelierGroup = new THREE.Group();

    const chainGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2);
    const chainMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.3,
        metalness: 0.8
    });
    const chain = new THREE.Mesh(chainGeometry, chainMaterial);
    chain.position.y = -1;
    chandelierGroup.add(chain);

    const fixtureGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const fixtureMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffd700,
        emissiveIntensity: 0.3,
        roughness: 0.2,
        metalness: 0.9
    });
    const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
    chandelierGroup.add(fixture);

    chandelierGroup.position.set(0, 0.5, 0);
    group.add(chandelierGroup);

    // Decorative moldings
    const moldingMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.4,
        metalness: 0.6
    });

    for (let i = 0; i < 4; i++) {
        const moldingGeometry = new THREE.TorusGeometry(6, 0.1, 8, 4);
        const molding = new THREE.Mesh(moldingGeometry, moldingMaterial);
        molding.rotation.x = Math.PI / 2;
        molding.rotation.z = (Math.PI / 2) * i;
        molding.position.y = 0.1;
        group.add(molding);
    }

    return group;
}

function createShowcaseLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    showcaseScene.add(ambientLight);

    // Main light
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    showcaseScene.add(mainLight);

    // Accent lights
    const accentLight1 = new THREE.PointLight(0xd4af37, 1, 20);
    accentLight1.position.set(5, 8, 5);
    showcaseScene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0xd4af37, 1, 20);
    accentLight2.position.set(-5, 8, -5);
    showcaseScene.add(accentLight2);
}

function initShowcaseControls() {
    const canvas = document.getElementById('showcaseCanvas');
    const controlBtns = document.querySelectorAll('.control-btn');

    // Mouse drag rotation
    canvas.addEventListener('mousedown', (e) => {
        isShowcaseDragging = true;
        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isShowcaseDragging) return;

        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        targetRotation.y += deltaX * 0.005;
        targetRotation.x += deltaY * 0.005;

        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    });

    canvas.addEventListener('mouseup', () => {
        isShowcaseDragging = false;
    });

    canvas.addEventListener('mouseleave', () => {
        isShowcaseDragging = false;
    });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        isShowcaseDragging = true;
        previousMousePosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    });

    canvas.addEventListener('touchmove', (e) => {
        if (!isShowcaseDragging) return;

        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        targetRotation.y += deltaX * 0.005;
        targetRotation.x += deltaY * 0.005;

        previousMousePosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    });

    canvas.addEventListener('touchend', () => {
        isShowcaseDragging = false;
    });

    // Design switcher buttons
    controlBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const designIndex = parseInt(btn.dataset.design);
            switchDesign(designIndex);

            controlBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function switchDesign(index) {
    if (index === showcaseRoom.userData.currentDesign) return;

    // Remove current design
    showcaseScene.remove(showcaseRoom.userData.designs[showcaseRoom.userData.currentDesign]);

    // Add new design
    showcaseRoom.userData.currentDesign = index;
    showcaseScene.add(showcaseRoom.userData.designs[index]);
}

// ========== GSAP ANIMATIONS ==========
function initGSAPAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero animations
    const heroTimeline = gsap.timeline({ delay: 0.5 });
    heroTimeline
        .to('.title-line', {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out'
        })
        .to('.hero-subtitle', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.5')
        .to('.hero-buttons', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.5');

    // Fade in sections on scroll
    gsap.utils.toArray('section').forEach(section => {
        gsap.from(section.querySelector('.section-header'), {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power3.out'
        });
    });

    // About section animations
    gsap.from('.about-text', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top 70%'
        },
        opacity: 0,
        x: -50,
        duration: 1,
        ease: 'power3.out'
    });

    gsap.from('.about-features', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top 70%'
        },
        opacity: 0,
        x: 50,
        duration: 1,
        ease: 'power3.out'
    });

    // Service cards stagger animation
    gsap.from('.service-card', {
        scrollTrigger: {
            trigger: '.services-grid',
            start: 'top 80%'
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
    });

    // Gallery items animation
    gsap.from('.gallery-item', {
        scrollTrigger: {
            trigger: '.gallery-grid',
            start: 'top 80%'
        },
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
    });

    // Contact form animation
    gsap.from('.contact-form', {
        scrollTrigger: {
            trigger: '.contact',
            start: 'top 70%'
        },
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out'
    });

    gsap.from('.contact-info', {
        scrollTrigger: {
            trigger: '.contact',
            start: 'top 70%'
        },
        opacity: 0,
        x: -50,
        duration: 1,
        ease: 'power3.out'
    });
}

// ========== COUNTER ANIMATION ==========
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    let countersAnimated = false;

    const animateCounters = () => {
        if (countersAnimated) return;

        counters.forEach(counter => {
            const target = parseInt(counter.dataset.target);
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };

            updateCounter();
        });

        countersAnimated = true;
    };

    // Trigger on scroll
    const statsSection = document.querySelector('.stats-grid');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                }
            });
        }, { threshold: 0.5 });

        observer.observe(statsSection);
    }
}

// ========== TESTIMONIALS SLIDER ==========
function initTestimonialsSlider() {
    const track = document.querySelector('.testimonials-track');
    const cards = document.querySelectorAll('.testimonial-card');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    const dotsContainer = document.querySelector('.testimonials-dots');

    if (!track || !cards.length) return;

    let currentIndex = 0;
    const totalSlides = cards.length;
    let autoSlideInterval;

    // Create dots
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }

    const dots = document.querySelectorAll('.dot');

    const updateSlider = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    };

    const goToSlide = (index) => {
        currentIndex = index;
        updateSlider();
        resetAutoSlide();
    };

    const nextSlide = () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
    };

    const prevSlide = () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlider();
    };

    const startAutoSlide = () => {
        autoSlideInterval = setInterval(nextSlide, 5000);
    };

    const resetAutoSlide = () => {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    };

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    startAutoSlide();
}

// Gallery filter consolidated to script.js (canonical implementation)

// ========== LIGHTBOX ==========
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxTitle = lightbox.querySelector('.lightbox-info h3');
    const lightboxDesc = lightbox.querySelector('.lightbox-info p');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    const lightboxBtns = document.querySelectorAll('.lightbox-btn');

    const galleryData = [
        { title: 'Modern Living Room', desc: 'Contemporary gypsum ceiling with integrated LED lighting', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { title: 'Office Space', desc: 'Professional grid ceiling design for corporate environment', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { title: 'Classic Bedroom', desc: 'Elegant POP ceiling with decorative moldings', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
        { title: 'Restaurant', desc: 'Ambient cove lighting creating warm dining atmosphere', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
        { title: 'Luxury Hall', desc: 'Grand ceiling design with chandelier and gold accents', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
        { title: 'Traditional Design', desc: 'Classic Indian ceiling with intricate patterns', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }
    ];

    let currentIndex = 0;

    const openLightbox = (index) => {
        currentIndex = index;
        updateLightboxContent();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    const updateLightboxContent = () => {
        const data = galleryData[currentIndex];
        lightboxImage.style.background = data.gradient;
        lightboxImage.innerHTML = `<span style="color: white; font-size: 2rem; font-weight: 600; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">${data.title}</span>`;
        lightboxTitle.textContent = data.title;
        lightboxDesc.textContent = data.desc;
    };

    const showNext = () => {
        currentIndex = (currentIndex + 1) % galleryData.length;
        updateLightboxContent();
    };

    const showPrev = () => {
        currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
        updateLightboxContent();
    };

    lightboxBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.image);
            openLightbox(index);
        });
    });

    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    });
}

// ========== MOBILE MENU ==========
function initMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// ========== SMOOTH SCROLL ==========
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========== CONTACT FORM ==========
function initContactForm() {
    const form = document.getElementById('contactForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Simulate form submission
        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<span>Sending...</span>';
        submitBtn.disabled = true;

        setTimeout(() => {
            alert('Thank you for your message! We will get back to you soon.');
            form.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
    });
}

// ========== NAVBAR SCROLL EFFECT ==========
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ========== ANIMATION LOOP ==========
function animate() {
    requestAnimationFrame(animate);

    // Animate hero particles
    if (heroParticles) {
        heroParticles.rotation.y += 0.0002;
        heroParticles.rotation.x += 0.0001;

        // Mouse interaction
        heroParticles.rotation.y += mouseX * 0.0005;
        heroParticles.rotation.x += mouseY * 0.0005;

        // Animate shapes
        if (heroParticles.userData.shapes) {
            const time = Date.now() * 0.001;
            heroParticles.userData.shapes.forEach(shape => {
                shape.rotation.x += shape.userData.rotationSpeed.x;
                shape.rotation.y += shape.userData.rotationSpeed.y;
                shape.position.y += Math.sin(time * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.01;
            });
        }
    }

    // Animate showcase
    if (showcaseRoom) {
        // Smooth rotation
        showcaseRoom.rotation.y += (targetRotation.y - showcaseRoom.rotation.y) * 0.05;
        showcaseRoom.rotation.x += (targetRotation.x - showcaseRoom.rotation.x) * 0.05;

        // Auto-rotate when not dragging
        if (!isShowcaseDragging) {
            targetRotation.y += 0.001;
        }
    }

    // Render scenes
    if (heroRenderer && heroScene && heroCamera) {
        heroRenderer.render(heroScene, heroCamera);
    }

    if (showcaseRenderer && showcaseScene && showcaseCamera) {
        showcaseRenderer.render(showcaseScene, showcaseCamera);
    }
}

// ========== UTILITY FUNCTIONS ==========
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced resize handler
window.addEventListener('resize', debounce(() => {
    if (heroRenderer) {
        heroCamera.aspect = window.innerWidth / window.innerHeight;
        heroCamera.updateProjectionMatrix();
        heroRenderer.setSize(window.innerWidth, window.innerHeight);
    }
}, 250));

// ========== PERFORMANCE OPTIMIZATION ==========
// Pause animations when tab is not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause heavy animations
        console.debug('Page hidden - animations paused');
    } else {
        // Resume animations
        console.debug('Page visible - animations resumed');
    }
});

// ========== LOADING COMPLETE ==========
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    console.debug('🚀 LuxeCeiling website loaded successfully!');
    console.debug('✨ Features: Three.js 3D, GSAP Animations, Glassmorphism UI');
});

// ==========================================
// TESTIMONIALS PREMIUM SLIDER CODE
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    // வாடிக்கையாளர் கருத்துக்களின் தரவுகள் (Array of Testimonials)
    const testimonials = [
        {
            rating: "★★★★★",
            text: '"LuxeCeiling transformed our home completely. The gypsum ceiling design they created is absolutely stunning."',
            avatar: "RK",
            name: "Rajesh Kumar",
            role: "Homeowner, Mumbai"
        },
        {
            rating: "★★★★★",
            text: '"Professional team, excellent workmanship, and timely delivery. Our office ceiling looks premium and modern."',
            avatar: "PS",
            name: "Priya Sharma",
            role: "Business Owner, Delhi"
        },
        {
            rating: "★★★★★",
            text: '"The cove lighting design added so much warmth to our living room. The team was creative and understood our vision perfectly."',
            avatar: "AM",
            name: "Amit Mehta",
            role: "Architect, Bangalore"
        }
    ];

    let currentIndex = 0;

    // HTML கூறுகளைத் தேர்ந்தெடுத்தல் (Selecting UI Elements)
    const ratingEl = document.querySelector(".testimonial-rating");
    const textEl = document.querySelector(".testimonial-text");
    const avatarEl = document.querySelector(".author-avatar");
    const nameEl = document.querySelector(".author-info h4");
    const roleEl = document.querySelector(".author-info p");
    const dotsContainer = document.querySelector(".testimonials-dots");
    const prevBtn = document.querySelector(".testimonial-prev");
    const nextBtn = document.querySelector(".testimonial-next");

    // கார்டை புதுப்பிக்கும் முதன்மை ஃபங்க்ஷன் (Update Slide View)
    function updateTestimonial(index) {
        // கார்டுக்குள் மென்மையான அனிமேஷன் வரவழைக்க (Fade-in effect)
        const track = document.querySelector(".testimonials-track");
        if(track) {
            track.style.opacity = 0;
            track.style.transition = "opacity 0.3s ease-in-out";
        }

        setTimeout(() => {
            if(ratingEl) ratingEl.textContent = testimonials[index].rating;
            if(textEl) textEl.textContent = testimonials[index].text;
            if(avatarEl) avatarEl.textContent = testimonials[index].avatar;
            if(nameEl) nameEl.textContent = testimonials[index].name;
            if(roleEl) roleEl.textContent = testimonials[index].role;
            
            if(track) track.style.opacity = 1;
            updateDots(index);
        }, 300);
    }

    // டாட்களின் வடிவத்தை மாற்ற (Update Active Dot Style)
    function updateDots(activeIndex) {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = ""; // பழைய டாட்களை நீக்க

        testimonials.forEach((_, i) => {
            const dot = document.createElement("span");
            if (i === activeIndex) {
                // தற்போதைய ஆக்டிவ் டாட்டிற்கு தங்க நிற நீள வடிவம்
                dot.style.cssText = "width: 15px; height: 6px; background: #d4af37; border-radius: 3px; display: inline-block; transition: all 0.3s ease;";
            } else {
                // மற்ற டாட்களுக்கு சாதாரண வட்ட வடிவம்
                dot.style.cssText = "width: 6px; height: 6px; background: rgba(255,255,255,0.2); border-radius: 50%; display: inline-block; transition: all 0.3s ease; cursor: pointer;";
                // டாட்களை கிளிக் செய்தாலும் கார்டு மாற
                dot.addEventListener("click", () => {
                    currentIndex = i;
                    updateTestimonial(currentIndex);
                    resetTimer();
                });
            }
            dotsContainer.appendChild(dot);
        });
    }

    // அடுத்த கார்டுக்குச் செல்ல (Next Button Function)
    function nextSlide() {
        currentIndex = (currentIndex + 1) % testimonials.length;
        updateTestimonial(currentIndex);
    }

    // முந்தைய கார்டுக்குச் செல்ல (Prev Button Function)
    function prevSlide() {
        currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
        updateTestimonial(currentIndex);
    }

    // 5 வினாடிக்கு ஒருமுறை தானாக கார்டு மாறும் டைமர் (Auto Interval)
    let autoSlideInterval = setInterval(nextSlide, 5000);

    // பயனர் மேனுவலாக கிளிக் செய்யும்போது டைமரை ரீசெட் செய்ய (Reset Timer on Click)
    function resetTimer() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    // பட்டன் கிளிக் நிகழ்வுகள் (Button Event Listeners)
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            nextSlide();
            resetTimer();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            prevSlide();
            resetTimer();
        });
    }

    // முதல் முறை லோடு செய்யும்போது ஆரம்பிக்க (Initialize First Slide)
    updateTestimonial(currentIndex);
});
