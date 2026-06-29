/* ============================================
   AS FALSE CEILING - Fixed Script
   Dynamic Database Features (Supabase Option A)
   ============================================ */

// ========== SUPABASE CONFIGURATION ==========
// Supabase credentials, client, and retry counter are loaded from js/supabase-config.js
// Do NOT declare SUPABASE_URL, SUPABASE_ANON_KEY, supabaseClient, or supabaseInitRetries here
function initSupabase() {
    if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.debug('✅ Supabase initialized successfully!');
        fetchServices();
        fetchGallery();
    } else {
        supabaseInitRetries++;
        if (supabaseInitRetries < 15) {
            setTimeout(initSupabase, 200);
        } else {
            console.warn('⚠️ Supabase SDK failed to load. Falling back to local data.');
            fetchServices();
            fetchGallery();
        }
    }
}
initSupabase();

// ========== GLOBAL VARIABLES ==========
let currentSection = 0;
let currentDesignIndex = 0;

// Header elements
let header, mobileMenuToggle, navMenu;

// ========== INITIALIZATION ==========
function init() {
    header = document.getElementById('premiumHeader');
    mobileMenuToggle = document.getElementById('mobileMenuToggle');
    navMenu = document.getElementById('navMenu');

    initHeaderAnimations();
    initSmoothScroll();  // ✅ NEW: Enable smooth scrolling for all anchor links
    initMobileMenu();
    initHeroText3D();
    initHeroSlider();
    initScrollTrigger();

    requestIdleCallback(() => {
        initGSAPAnimations();
        initCounters();
        initTestimonialsSlider();
        initGalleryFilter();
        initContactForm();
        initBeforeAfterSlider();   // Restore slider handle initialization
        initBeforeAfterImages();   // ✅ NEW: Before/After real images
                       // ✅ Call Lenis for smooth scroll
        initMicroInteractions();
    }, { timeout: 1000 });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ========== FETCH SERVICES FROM SUPABASE ==========
async function fetchServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;

    let servicesData = [];
    let fetched = false;
    try {
        if (supabaseClient && SUPABASE_ANON_KEY !== 'YOUR_ANON_PUBLIC_KEY_HERE') {
            const { data, error } = await supabaseClient.from('services').select('*').order('id', { ascending: true });
            if (error) throw error;
            if (data && data.length > 0) {
                servicesData = data.map(item => ({
                    title: item.title,
                    data_service: item.data_service || item.title.toLowerCase().split(' ')[0],
                    icon: item.icon || '◆',
                    description: item.description,
                    features: Array.isArray(item.features_list) ? item.features_list : (item.features_list ? JSON.parse(item.features_list) : [])
                }));
                fetched = true;
            }
        }
    } catch (err) {
        console.warn('Supabase fetchServices failed, keeping static cards:', err);
    }

    if (fetched && servicesData.length > 0) {
        servicesGrid.innerHTML = servicesData.map(service => {
            const featuresHTML = service.features && service.features.length > 0
                ? `<ul class="service-features">
                    ${service.features.map(f => `<li><span class="gold-bullet">✓</span> ${f}</li>`).join('')}
                </ul>`
                : '';
            return `
                <div class="service-card" data-service="${service.data_service}">
                    <div class="service-icon">${service.icon}</div>
                    <h3>${service.title}</h3>
                    <p>${service.description}</p>
                    ${featuresHTML}
                </div>
            `;
        }).join('');
    }
}

// ========== FETCH GALLERY FROM SUPABASE ==========
async function fetchGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;

    galleryGrid.innerHTML = Array(8).fill('<div class="skeleton-card"></div>').join('');

    try {
        if (supabaseClient && SUPABASE_ANON_KEY !== 'YOUR_ANON_PUBLIC_KEY_HERE') {
            // Fetch ALL gallery items ordered by simple integer ID
            const { data, error } = await supabaseClient
                .from('gallery')
                .select('*')
                .order('id', { ascending: true });
            
            console.debug('📸 Gallery fetch - Total rows:', data?.length, 'Error:', error);
            
            if (error) {
                console.error('❌ Gallery query failed:', error);
                galleryGrid.innerHTML = '<p style="text-align:center; padding: 2rem; color: #d4af37;">Failed to load gallery. Please try again later.</p>';
                return;
            }
            
            if (data && data.length > 0) {
                // Filter out Before/After categories in JavaScript
                const galleryItems = data.filter(item => {
                    const category = (item.category || '').toLowerCase();
                    return category !== 'before' && category !== 'after';
                });
                
                console.debug('✅ Rendering', galleryItems.length, 'gallery items');
                
                // Clear and render database items
                galleryGrid.innerHTML = '';
                galleryGrid.innerHTML = galleryItems.map(item => {
                    const itemClass = item.is_large ? 'gallery-item large' : 'gallery-item';
                    const hasValidImage = item.image_url && item.image_url.trim() !== '' && item.image_url !== 'null' && item.image_url !== 'undefined';
                    const backgroundImageStyle = hasValidImage ? `background-image: url('${item.image_url}');` : '';
                    const normalizedCategory = (item.category || '').toLowerCase().replace(/[•,\/|]+/g, ' ').trim();
                    const dataIdAttr = item.id !== undefined && item.id !== null ? `data-id="${item.id}"` : '';
                    return `
                        <div class="${itemClass}" ${dataIdAttr} data-category="${normalizedCategory}">
                            <div class="gallery-image">
                                <div class="gallery-placeholder luxury-placeholder" style="${backgroundImageStyle} background-size: cover; background-position: center; position: relative;">
                                    <div class="gallery-overlay" style="
                                        position: absolute;
                                        bottom: 0; left: 0; right: 0;
                                        padding: 1.5rem;
                                        background: linear-gradient(transparent, rgba(0,0,0,0.85));
                                        opacity: 0;
                                        transition: opacity 0.3s ease;
                                    ">
                                        <span style="display:block; font-size:1.1rem; font-weight:600; color:#fff; margin-bottom:0.3rem;">${item.title}</span>
                                        <span style="font-size:0.8rem; color:#d4af37; text-transform:uppercase; letter-spacing:1px;">${item.category}</span>
                                    </div>
                                    <div class="gallery-zoom-icon" style="
                                        position: absolute;
                                        top: 50%; left: 50%;
                                        transform: translate(-50%, -50%);
                                        width: 50px; height: 50px;
                                        background: rgba(212,175,55,0.9);
                                        border-radius: 50%;
                                        display: flex; align-items: center; justify-content: center;
                                        font-size: 1.4rem; color: #0a0a0a;
                                        opacity: 0;
                                        transition: opacity 0.3s ease;
                                    ">◆</div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
                
                initGalleryHoverEffects();
                // Ensure we only show 8 items initially (2 rows x 4 columns)
                if (typeof initGalleryFilter === 'function') {
                    // Re-run filter init to ensure limit is enforced for dynamic content
                    initGalleryFilter();
                }
            } else {
                console.debug('⚠️ No gallery data in database');
                galleryGrid.innerHTML = '<p style="text-align:center; padding: 2rem; color: #888;">No gallery items found. Please add images to your database.</p>';
            }
        } else {
            console.debug('⚠️ Supabase not configured');
            galleryGrid.innerHTML = '<p style="text-align:center; padding: 2rem; color: #888;">Gallery unavailable. Please configure Supabase credentials.</p>';
        }
    } catch (err) {
        console.error('❌ Gallery fetch error:', err);
        galleryGrid.innerHTML = '<p style="text-align:center; padding: 2rem; color: #dc3545;">Error loading gallery. Please refresh the page.</p>';
    }
}

function initGalleryHoverEffects() {
    const allItems = document.querySelectorAll('.gallery-item');
    allItems.forEach(item => {
        const placeholder = item.querySelector('.gallery-placeholder');
        if (placeholder) {
            item.addEventListener('mouseenter', () => {
                const overlay = placeholder.querySelector('.gallery-overlay');
                const zoomIcon = placeholder.querySelector('.gallery-zoom-icon');
                if (overlay) overlay.style.opacity = '1';
                if (zoomIcon) zoomIcon.style.opacity = '1';
            });

            item.addEventListener('mouseleave', () => {
                const overlay = placeholder.querySelector('.gallery-overlay');
                const zoomIcon = placeholder.querySelector('.gallery-zoom-icon');
                if (overlay) overlay.style.opacity = '0';
                if (zoomIcon) zoomIcon.style.opacity = '0';
            });
        }
    });
}

// ========== BEFORE/AFTER REAL IMAGES ==========
// ✅ FIX: Before/After section-ல் real photos from Supabase
async function initBeforeAfterImages() {
    const beforePlaceholder = document.querySelector('.before-placeholder');
    const afterPlaceholder = document.querySelector('.after-placeholder');
    const sliderContainer = document.querySelector('.before-after-slider');

    if (sliderContainer && !document.getElementById('slider-loader')) {
        sliderContainer.insertAdjacentHTML('afterbegin', '<div class="slider-skeleton" id="slider-loader"></div>');
    }

    const sliderLoader = document.getElementById('slider-loader');

    // Fetch Before/After images from Supabase
    let beforeImageUrl = 'https://leytftnlvyeqisfiyxck.supabase.co/storage/v1/object/public/before.jpg'; // fallback
    let afterImageUrl = 'https://leytftnlvyeqisfiyxck.supabase.co/storage/v1/object/public/after.jpg'; // fallback

    try {
        if (supabaseClient && SUPABASE_ANON_KEY !== 'YOUR_ANON_PUBLIC_KEY_HERE') {
            // Fetch all gallery items
            const { data, error } = await supabaseClient
                .from('gallery')
                .select('*')
                .order('id', { ascending: true });
            
            if (!error && data && data.length > 0) {
                // Find Before image (case-insensitive match)
                const beforeItem = data.find(item => item.category && item.category.toLowerCase() === 'before');
                if (beforeItem && beforeItem.image_url) {
                    beforeImageUrl = beforeItem.image_url;
                    console.debug('✅ Found Before image:', beforeImageUrl);
                }
                
                // Find After image (case-insensitive match)
                const afterItem = data.find(item => item.category && item.category.toLowerCase() === 'after');
                if (afterItem && afterItem.image_url) {
                    afterImageUrl = afterItem.image_url;
                    console.debug('✅ Found After image:', afterImageUrl);
                }
            }
        }
    } catch (err) {
        console.warn('⚠️ Could not fetch Before/After images from Supabase, using fallback URLs:', err);
    }

    const preloadImage = (src) => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => resolve(src);
        img.src = src;
    });

    const [beforeLoaded, afterLoaded] = await Promise.all([
        preloadImage(beforeImageUrl),
        preloadImage(afterImageUrl)
    ]);

    if (beforePlaceholder) {
        beforePlaceholder.style.backgroundImage = `url('${beforeImageUrl}')`;
        beforePlaceholder.style.backgroundSize = 'contain';
        beforePlaceholder.style.backgroundPosition = 'center center';
        beforePlaceholder.style.backgroundRepeat = 'no-repeat';
        beforePlaceholder.style.minHeight = '400px';

        beforePlaceholder.innerHTML = `
            <div class="placeholder-content" style="background: rgba(0,0,0,0.5); padding: 1rem 2rem; border-radius: 8px; text-align:center;">
                <div style="font-size:2.5rem; color:rgba(255,255,255,0.5); margin-bottom:0.5rem;">◇</div>
                <span style="display:block; font-size:1.4rem; font-weight:700; color:#fff; text-transform:uppercase; letter-spacing:3px;">BEFORE</span>
                <span style="display:block; font-size:0.9rem; color:rgba(255,255,255,0.7); margin-top:0.3rem;">Plain Ceiling</span>
            </div>
        `;
    }

    if (afterPlaceholder) {
        afterPlaceholder.style.backgroundImage = `url('${afterImageUrl}')`;
        afterPlaceholder.style.backgroundSize = 'contain';
        afterPlaceholder.style.backgroundPosition = 'center center';
        afterPlaceholder.style.backgroundRepeat = 'no-repeat';
        afterPlaceholder.style.minHeight = '400px';

        afterPlaceholder.innerHTML = `
            <div class="placeholder-content" style="background: rgba(0,0,0,0.5); padding: 1rem 2rem; border-radius: 8px; text-align:center;">
                <div style="font-size:2.5rem; color:#d4af37; margin-bottom:0.5rem; text-shadow: 0 0 20px rgba(212,175,55,0.8);">◆</div>
                <span style="display:block; font-size:1.4rem; font-weight:700; color:#d4af37; text-transform:uppercase; letter-spacing:3px;">AFTER</span>
                <span style="display:block; font-size:0.9rem; color:rgba(255,255,255,0.8); margin-top:0.3rem;">Luxury False Ceiling</span>
            </div>
        `;
    }

    if (sliderLoader) {
        sliderLoader.classList.add('fade-out');
    }
}

// ========== COUNTER ANIMATION - FIXED ==========
// ✅ FIX: "0+" issue solve - proper animation with + suffix
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    let countersAnimated = false;

    const animateCounters = () => {
        if (countersAnimated) return;
        countersAnimated = true;

        counters.forEach(counter => {
            const target = parseInt(counter.dataset.target) || 0;
            const duration = 2500; // 2.5 seconds
            const startTime = performance.now();

            // Easing function - ease out
            const easeOut = (t) => 1 - Math.pow(1 - t, 3);

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOut(progress);
                const currentValue = Math.floor(easedProgress * target);

                // ✅ stat-number::after CSS-ல் '+' இருக்கு, so just set number
                counter.textContent = currentValue.toLocaleString('en-IN');

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString('en-IN');
                }
            };

            requestAnimationFrame(updateCounter);
        });
    };

    // IntersectionObserver - visible ஆனா animate பண்ணும்
    const statsSection = document.querySelector('.stats-grid');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target); // Once only
                }
            });
        }, { threshold: 0.3 });

        observer.observe(statsSection);
    }
}

// ========== HEADER ANIMATIONS ==========
function initHeaderAnimations() {
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    // Active nav link on scroll
    const sections = document.querySelectorAll('.section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }, { passive: true });
}

// ========== SMOOTH SCROLL FOR ALL ANCHOR LINKS ==========
function initSmoothScroll() {
    // Apply smooth scrolling to all anchor links that start with #
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ========== MOBILE MENU ==========
function initMobileMenu() {
    if (!mobileMenuToggle || !navMenu) return;

    const setMenuState = (isOpen) => {
        mobileMenuToggle.classList.toggle('active', isOpen);
        navMenu.classList.toggle('active', isOpen);
        mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    mobileMenuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setMenuState(!navMenu.classList.contains('active'));
    });

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
         link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            setMenuState(false);
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            setMenuState(false);
        }
    });
}

// ========== HERO TEXT 3D EFFECT ==========
function initHeroText3D() {
    const heroTextWrapper = document.getElementById('heroTextWrapper');
    if (!heroTextWrapper) return;

    document.addEventListener('mousemove', (e) => {
        if (currentSection !== 0) return;
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 2;
        const yPos = (clientY / window.innerHeight - 0.5) * 2;

        if (typeof gsap !== 'undefined') {
            gsap.to(heroTextWrapper, {
                rotateY: xPos * 15,
                rotateX: -yPos * 10,
                duration: 0.8,
                ease: 'power2.out'
            });
        }
    });

    document.addEventListener('mouseleave', () => {
        if (typeof gsap !== 'undefined') {
            gsap.to(heroTextWrapper, { rotateY: 0, rotateX: 0, duration: 1, ease: 'power2.out' });
        }
    });
}

// ========== HERO IMAGE SLIDER ==========
function initHeroSlider() {
    const slides = document.querySelectorAll('.slide');
    if (!slides.length) return;

    let currentSlide = 0;
    const totalSlides = slides.length;

    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === 0);
    });

    const goToSlide = (index) => {
        slides[currentSlide].classList.remove('active');
        currentSlide = index;
        slides[currentSlide].classList.add('active');
    };

    const nextSlide = () => goToSlide((currentSlide + 1) % totalSlides);

    let autoSlide = setInterval(nextSlide, 10000);
}

// ========== SCROLL TRIGGER ==========
function initScrollTrigger() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.defaults({
        toggleActions: 'play none none reverse',
        start: 'top 85%',
    });
}

// ========== GSAP ANIMATIONS ==========
function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    // Hero
    gsap.timeline({ delay: 0.5 })
        .to('.title-line', { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power3.out' })
        .to('.hero-subtitles', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
        .to('.hero-buttons', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');

    // Sections
    gsap.utils.toArray('.section').forEach(section => {
        const content = section.querySelector('.content');
        if (content) {
            gsap.from(content, {
                scrollTrigger: { trigger: section, start: 'top 85%' },
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: 'power2.out'
            });
        }
    });

    // Service cards
    gsap.from('.service-card', {
        scrollTrigger: { trigger: '.services-grid', start: 'top 80%' },
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
    });

    // Gallery items
    gsap.from('.gallery-item', {
        scrollTrigger: { trigger: '.gallery-grid', start: 'top 80%' },
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
    });
}

// ========== TESTIMONIALS SLIDER ==========
function initTestimonialsSlider() {
    const track = document.getElementById('testimonialsTrack');
    if (!track) return;

    const cards = track.querySelectorAll('.testimonial-card');
    if (!cards.length) return;

    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    const dots = document.querySelectorAll('.testimonials-dots span');

    let currentIndex = 0;
    const totalSlides = cards.length;
    let autoSlideInterval;
    let pauseTimeout;

    // Show specific testimonial
    function showTestimonial(index) {
        cards.forEach((card, i) => {
            card.style.display = i === index ? 'block' : 'none';
        });

        // Update dots
        dots.forEach((dot, i) => {
            if (i === index) {
                dot.style.background = '#d4af37';
                dot.style.width = '12px';
                dot.style.borderRadius = '4px';
            } else {
                dot.style.background = 'rgba(255,255,255,0.2)';
                dot.style.width = '6px';
                dot.style.borderRadius = '50%';
            }
        });

        currentIndex = index;
    }

    // Go to next slide
    function goToNext() {
        const nextIndex = (currentIndex + 1) % totalSlides;
        showTestimonial(nextIndex);
    }

    // Go to previous slide
    function goToPrev() {
        const prevIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        showTestimonial(prevIndex);
    }

    // Start auto-play
    function startAutoPlay() {
        stopAutoPlay();
        autoSlideInterval = setInterval(goToNext, 5000); // 5 seconds
    }

    // Stop auto-play
    function stopAutoPlay() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    // Pause auto-play temporarily (resets timer)
    function pauseAutoPlayTemporarily() {
        stopAutoPlay();
        
        // Clear any existing pause timeout
        if (pauseTimeout) {
            clearTimeout(pauseTimeout);
        }
        
        // Resume auto-play after 10 seconds of inactivity
        pauseTimeout = setTimeout(() => {
            startAutoPlay();
        }, 10000);
    }

    // Event listeners for navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            goToPrev();
            pauseAutoPlayTemporarily();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            goToNext();
            pauseAutoPlayTemporarily();
        });
    }

    // Event listeners for dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showTestimonial(index);
            pauseAutoPlayTemporarily();
        });
    });

    // Start auto-play on page load
    startAutoPlay();

    // Pause on hover
    const slider = document.querySelector('.testimonials-slider');
    if (slider) {
        slider.addEventListener('mouseenter', stopAutoPlay);
        slider.addEventListener('mouseleave', startAutoPlay);
    }

    console.debug('✅ Testimonials slider initialized with auto-play');
}

// ========== GALLERY FILTER ==========
function initGalleryFilter() {
    // Remove old event listeners by replacing buttons with fresh clones
    const btnContainer = document.querySelector('.gallery-filters');
    if (!btnContainer) return;
    const oldBtns = Array.from(btnContainer.querySelectorAll('.filter-btn'));
    oldBtns.forEach(b => {
        const clone = b.cloneNode(true);
        b.parentNode.replaceChild(clone, b);
    });

    const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));

    // Helper: return items matching a filter (includes match)
    function getMatchingItems(filter) {
        const items = Array.from(document.querySelectorAll('.gallery-item'));
        if (!filter || filter === 'all') return items;
        const f = (filter || '').toLowerCase().trim();
        return items.filter(it => {
            const raw = (it.dataset.category || '').toLowerCase();
            // Split on spaces and common separators (• , / |)
            const tokens = raw.split(/[\s,•\/|]+/).map(s => s.trim()).filter(Boolean);
            return tokens.includes(f) || tokens.some(t => t.includes(f));
        });
    }

    // Helper: shuffle array (non-destructive)
    function shuffleArray(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // Show only elements in `toShow` array, hide others
    function showOnly(toShow) {
        const items = Array.from(document.querySelectorAll('.gallery-item'));
        items.forEach(it => {
            if (toShow.includes(it)) {
                it.style.display = 'block';
                it.style.opacity = '1';
                it.style.transform = 'scale(1)';
            } else {
                it.style.display = 'none';
                it.style.opacity = '0';
                it.style.transform = 'scale(0.8)';
            }
        });
    }

    // For 'all' view: pick up to 2 items per main category to total ~8
    function computeAllSelection() {
        const categories = ['residential', 'commercial', 'modern', 'classic'];
        const selected = [];
        const seen = new Set();
        for (const cat of categories) {
            const matches = getMatchingItems(cat);
            for (let i = 0; i < matches.length && selected.length < 8; i++) {
                const el = matches[i];
                const id = el.dataset.id || el.outerHTML; // unique-ish key
                if (!seen.has(id)) {
                    selected.push(el);
                    seen.add(id);
                    if (selected.filter(s => (s.dataset.category || '').toLowerCase().includes(cat)).length >= 2) break;
                }
            }
        }
        // If still less than 8, fill with any other items
        if (selected.length < 8) {
            const all = getMatchingItems('all');
            for (const el of all) {
                if (selected.length >= 8) break;
                if (!selected.includes(el)) selected.push(el);
            }
        }
        return selected;
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const rawFilter = (btn.dataset.filter || '').toLowerCase();
            console.debug('🔎 Gallery filter clicked:', rawFilter, ' — total gallery items:', document.querySelectorAll('.gallery-item').length);
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (rawFilter === 'all') {
                const toShow = computeAllSelection();
                console.debug('🔎 All selection computed, items:', toShow.length, toShow.map(it => it.dataset.category));
                showOnly(toShow);
            } else {
                // Prefer ID-based odd/even mapping when available (DB currently stores locations)
                const allItems = Array.from(document.querySelectorAll('.gallery-item'));
                const itemsWithId = allItems.filter(it => it.dataset.id && !isNaN(parseInt(it.dataset.id, 10)));
                let selected = [];

                if (itemsWithId.length > 0) {
                    if (['residential', 'modern'].includes(rawFilter)) {
                        selected = itemsWithId.filter(it => parseInt(it.dataset.id, 10) % 2 === 1);
                    } else {
                        selected = itemsWithId.filter(it => parseInt(it.dataset.id, 10) % 2 === 0);
                    }

                    // If mapping produced none (small DB), fall back to random selection
                    if (!selected.length) {
                        selected = shuffleArray(allItems).slice(0, 4);
                    } else {
                        selected = selected.slice(0, 5); // show up to 5 matching mapped items
                    }
                } else {
                    // No numeric IDs available; show random 4 items to simulate filter
                    selected = shuffleArray(allItems).slice(0, 4);
                }

                console.debug('🔎 Filter selection for', rawFilter, '->', selected.length, selected.map(s => s.dataset.id || s.dataset.category));
                showOnly(selected);
            }
        });
    });

    // Trigger initial 'all' state
    const initialBtn = document.querySelector('.filter-btn[data-filter="all"]');
    if (initialBtn) initialBtn.click();
}

// ========== BEFORE/AFTER SLIDER ==========
function initBeforeAfterSlider() {
    const slider = document.querySelector('.before-after-slider');
    if (!slider) return;

    const beforeImage = slider.querySelector('.before-image');
    const sliderHandle = slider.querySelector('.slider-handle');
    const sliderButton = slider.querySelector('.slider-button');

    let isDragging = false;
    let sliderPosition = 50;

    const updateSliderPosition = (percentage) => {
        beforeImage.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
        sliderHandle.style.left = `${percentage}%`;
    };

    updateSliderPosition(sliderPosition);

    sliderButton.addEventListener('mousedown', (e) => { isDragging = true; e.preventDefault(); });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const rect = slider.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        sliderPosition = percentage;
        updateSliderPosition(percentage);
    });
    document.addEventListener('mouseup', () => { isDragging = false; });

    sliderButton.addEventListener('touchstart', (e) => { isDragging = true; e.preventDefault(); });
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const rect = slider.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(100, ((e.touches[0].clientX - rect.left) / rect.width) * 100));
        sliderPosition = percentage;
        updateSliderPosition(percentage);
    });
    document.addEventListener('touchend', () => { isDragging = false; });
}

// ========== CONTACT FORM HANDLER ==========
// This function prevents page reload and handles form submission
function handleFormSubmit(event) {
    // DEBUG: Log immediately to confirm handler is triggered
    console.debug("Form submit triggered");
    
    // Prevent default form submission (page reload) - MUST BE FIRST!
    event.preventDefault();
    
    // Try both possible form IDs for maximum compatibility
    const form = document.getElementById('contactForm') || document.getElementById('contact-form');
    if (!form) {
        console.error('Form not found!');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Get form data
    const formData = {
        name: form.querySelector('#name')?.value || '',
        phone: form.querySelector('#phone')?.value || '',
        address: form.querySelector('#address')?.value || ''
    };

    // Validate form
    if (!formData.name || !formData.phone || !formData.address) {
        showFormError('Please fill in all required fields');
        return;
    }

    // Show loading state
    submitBtn.textContent = 'SENDING...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    // Submit to Supabase or fallback
    if (window.SupabaseAPI && window.SupabaseAPI.isInitialized()) {
        // Submit to Supabase
        console.debug('Submitting to Supabase...');
        window.SupabaseAPI.submitContactForm(formData)
            .then(result => {
                console.debug('✅ Supabase submission successful:', result);
                showFormSuccess(result.message);
                form.reset();
            })
            .catch(error => {
                console.error('❌ Supabase submission error:', error);
                showFormError(error.message || 'Failed to send message. Please try again.');
            })
            .finally(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
            });
    } else {
        // Fallback: Simulate submission for demo/development
        console.debug('⚠️ Supabase not available, using demo mode');
        setTimeout(() => {
            showFormSuccess('✅ Thank you! We will contact you within 24 hours. (Demo mode)');
            form.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            console.debug('✅ Form submitted successfully (demo mode - not connected to Supabase)');
        }, 1500);
    }
}

// ========== CONTACT FORM INITIALIZATION ==========
function initContactForm() {
    // Get form by both possible IDs for safety
    const form = document.getElementById('contactForm') || document.getElementById('contact-form');
    
    if (!form) {
        console.warn('Contact form not found');
        return;
    }

    // Add click event listener to submit button to prevent native form submission
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof handleFormSubmit === 'function') {
                handleFormSubmit(e);
            } else {
                console.error('handleFormSubmit function not found');
            }
        });
    }

    console.debug('📋 Contact form event listener attached');
}

// Show success message
function showFormSuccess(message) {
    const form = document.getElementById('contactForm');
    
    // Remove any existing messages
    const existingMsg = form.querySelector('.form-message');
    if (existingMsg) existingMsg.remove();
    
    // Create success message
    const successMsg = document.createElement('div');
    successMsg.className = 'form-message';
    successMsg.style.cssText = `
        background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.1));
        border: 1px solid #d4af37;
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
        color: #d4af37;
        font-weight: 600;
        font-size: 1.1rem;
        margin-top: 1rem;
        animation: fadeIn 0.5s ease-in;
    `;
    successMsg.textContent = message;
    form.appendChild(successMsg);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        successMsg.style.opacity = '0';
        successMsg.style.transition = 'opacity 0.5s ease';
        setTimeout(() => successMsg.remove(), 500);
    }, 5000);
}

// Show error message
function showFormError(message) {
    const form = document.getElementById('contactForm');
    
    // Remove any existing messages
    const existingMsg = form.querySelector('.form-message');
    if (existingMsg) existingMsg.remove();
    
    // Create error message
    const errorMsg = document.createElement('div');
    errorMsg.className = 'form-message';
    errorMsg.style.cssText = `
        background: rgba(220, 53, 69, 0.1);
        border: 1px solid #dc3545;
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
        color: #dc3545;
        font-weight: 600;
        font-size: 1rem;
        margin-top: 1rem;
        animation: shake 0.5s ease-in;
    `;
    errorMsg.textContent = `❌ ${message}`;
    form.appendChild(errorMsg);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorMsg.style.opacity = '0';
        errorMsg.style.transition = 'opacity 0.5s ease';
        setTimeout(() => errorMsg.remove(), 500);
    }, 5000);
}

// ========== MICRO INTERACTIONS ==========
function initMicroInteractions() {
    if (typeof gsap === 'undefined') return;

    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(btn, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'power2.out' });
        });
    });
}

console.debug('✅ AS FALSE CEILING - All Features Initialized!');
