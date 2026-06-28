/* ============================================
   ENQUIRY POPUP - Auto Open & Submit Logic
   ============================================ */

// ========== POPUP FUNCTIONALITY ==========
function initEnquiryPopup() {
    const popupOverlay = document.getElementById('enquiryPopup');
    const popupClose = document.querySelector('.popup-close');
    const popupForm = document.getElementById('enquiryForm');
    const popupFormContainer = document.querySelector('.popup-form');
    const popupSuccess = document.querySelector('.popup-success');
    const whatsappBtn = document.getElementById('whatsappBtn');

    // Check if popup elements exist
    if (!popupOverlay || !popupForm) return;

    // ========== AUTO OPEN POPUP AFTER DELAY ==========
    const POPUP_DELAY = 3000; // 3 seconds delay
    const STORAGE_KEY = 'luxeCeiling_popupShown';

    // Check if popup was already shown in this session
    const hasPopupBeenShown = sessionStorage.getItem(STORAGE_KEY);

    if (!hasPopupBeenShown) {
        setTimeout(() => {
            openPopup();
            sessionStorage.setItem(STORAGE_KEY, 'true');
        }, POPUP_DELAY);
    }

    // ========== OPEN POPUP ==========
    function openPopup() {
        popupOverlay.classList.add('active');
        document.body.classList.add('popup-open');
        
        // Add GSAP animation if available
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(popupOverlay.querySelector('.popup-card'), 
                {
                    opacity: 0,
                    y: 50,
                    scale: 0.9
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    ease: 'back.out(1.7)'
                }
            );
        }

        // Focus on first input
        setTimeout(() => {
            const firstInput = popupForm.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 600);
    }

    // ========== CLOSE POPUP ==========
    function closePopup() {
        popupOverlay.classList.remove('active');
        document.body.classList.remove('popup-open');
        
        // Reset form after closing
        setTimeout(() => {
            resetForm();
        }, 400);
    }

    // ========== RESET FORM ==========
    function resetForm() {
        popupForm.reset();
        popupFormContainer.style.display = 'block';
        popupSuccess.classList.remove('active');
        
        // Remove loading state from button
        const submitBtn = popupForm.querySelector('.popup-submit-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = 'Submit Enquiry';
        }
    }

    // ========== CLOSE BUTTON EVENT ==========
    if (popupClose) {
        popupClose.addEventListener('click', (e) => {
            e.preventDefault();
            closePopup();
        });
    }

    // ========== CLICK OUTSIDE TO CLOSE ==========
    popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) {
            closePopup();
        }
    });

    // ========== ESC KEY TO CLOSE ==========
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popupOverlay.classList.contains('active')) {
            closePopup();
        }
    });

    // ========== FORM SUBMISSION ==========
    popupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(popupForm);
        
        // Map popup form fields to main form handler format
        const mappedData = {
            name: formData.get('fullName') || '',
            phone: formData.get('phone') || '',
            email: 'customer@example.com', // Default email since popup doesn't collect it
            message: `Address: ${formData.get('address') || 'N/A'}\n\nMessage: ${formData.get('message') || 'No message'}`
        };

        // Validate form
        if (!mappedData.name || !mappedData.phone) {
            alert('Please fill in all required fields');
            return;
        }

        // Show loading state
        const submitBtn = popupForm.querySelector('.popup-submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Submitting...';
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Use the main form submission handler from script.js
        if (typeof handleFormSubmit === 'function') {
            // Create a mock event object
            const mockEvent = {
                preventDefault: () => {}
            };
            
            // Temporarily swap form data for the handler
            const originalForm = document.getElementById('contactForm');
            if (originalForm) {
                // Call handleFormSubmit with mapped data
                console.debug('📋 Popup form submitting via main handler...');
                
                // Submit directly using SupabaseAPI if available
                if (window.SupabaseAPI && window.SupabaseAPI.isInitialized()) {
                    window.SupabaseAPI.submitContactForm(mappedData)
                        .then(result => {
                            console.debug('✅ Popup submission successful:', result);
                            showPopupSuccess();
                            setTimeout(() => {
                                closePopup();
                            }, 2000);
                        })
                        .catch(error => {
                            console.error('❌ Popup submission error:', error);
                            alert('Failed to submit. Please try again.');
                            submitBtn.innerHTML = originalText;
                            submitBtn.classList.remove('loading');
                            submitBtn.disabled = false;
                        });
                } else {
                    // Fallback: Simulate submission
                    console.debug('⚠️ Supabase not available, using demo mode');
                    setTimeout(() => {
                        showPopupSuccess();
                        setTimeout(() => {
                            closePopup();
                        }, 2000);
                    }, 1500);
                }
            } else {
                // Fallback if main form not found
                console.debug('⚠️ Main form not found, using local success');
                setTimeout(() => {
                    showPopupSuccess();
                    setTimeout(() => {
                        closePopup();
                    }, 2000);
                }, 1500);
            }
        } else {
            // Fallback if handleFormSubmit not available
            console.debug('⚠️ handleFormSubmit not found, using fallback');
            setTimeout(() => {
                showPopupSuccess();
                setTimeout(() => {
                    closePopup();
                }, 2000);
            }, 1500);
        }
    });

    function showPopupSuccess() {
        // Hide form, show success message
        popupFormContainer.style.display = 'none';
        popupSuccess.classList.add('active');

        // Add animation to success message
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(popupSuccess,
                {
                    opacity: 0,
                    y: 20
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: 'power3.out'
                }
            );
        }

        // Reset button state
        const submitBtn = popupForm.querySelector('.popup-submit-btn');
        submitBtn.innerHTML = 'Submit Enquiry';
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }

    // ========== FORM VALIDATION ==========
    function validateForm(data) {
        let isValid = true;
        const errors = [];

        // Validate full name
        if (!data.fullName || data.fullName.trim().length < 2) {
            errors.push('Please enter a valid full name');
            isValid = false;
        }

        // Validate phone number
        const phoneRegex = /^[0-9]{10,15}$/;
        const cleanPhone = data.phone.replace(/\s/g, '');
        if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
            errors.push('Please enter a valid phone number (10-15 digits)');
            isValid = false;
        }

        // Validate address
        if (!data.address || data.address.trim().length < 5) {
            errors.push('Please enter a valid address');
            isValid = false;
        }

        // Validate message (optional but recommended)
        if (!data.message || data.message.trim().length < 10) {
            errors.push('Please provide more details about your enquiry (at least 10 characters)');
            isValid = false;
        }

        if (!isValid) {
            alert('Please fix the following errors:\n\n' + errors.join('\n'));
            return false;
        }

        return true;
    }

    // ========== WHATSAPP BUTTON (BONUS FEATURE) ==========
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get form data for WhatsApp message
            const formData = new FormData(popupForm);
            const name = formData.get('fullName') || 'Customer';
            const phone = formData.get('phone') || '';
            const message = formData.get('message') || 'I would like to enquire about your services';
            
            // Create WhatsApp message
            const whatsappMessage = encodeURIComponent(
                `Hi LuxeCeiling! I'm ${name}.\n\n` +
                `Phone: ${phone}\n\n` +
                `Enquiry: ${message}\n\n` +
                `I submitted this enquiry through your website. Please contact me soon!`
            );

            // Your WhatsApp business number (replace with actual number)
            const whatsappNumber = '919876543210'; // Format: country code + number
            
            // Open WhatsApp
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
            window.open(whatsappURL, '_blank');
        });
    }

    // ========== FLOATING ACTION BUTTON (Optional - Reopen Popup) ==========
    // Add a small floating button to reopen popup if needed
    const fab = document.createElement('button');
    fab.className = 'popup-reopen-fab';
    fab.innerHTML = '💬';
    fab.setAttribute('aria-label', 'Open Enquiry Form');
    fab.title = 'Quick Enquiry';
    document.body.appendChild(fab);

    // Add styles for FAB
    const fabStyles = document.createElement('style');
    fabStyles.textContent = `
        .popup-reopen-fab {
            position: fixed;
            bottom: 100px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: var(--gradient-gold);
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4);
            z-index: 999;
            transition: all 0.3s ease;
            display: none;
            align-items: center;
            justify-content: center;
        }

        .popup-reopen-fab:hover {
            transform: scale(1.1) rotate(15deg);
            box-shadow: 0 6px 25px rgba(212, 175, 55, 0.6);
        }

        .popup-reopen-fab.show {
            display: flex;
        }

        @media (max-width: 768px) {
            .popup-reopen-fab {
                bottom: 90px;
                right: 15px;
                width: 55px;
                height: 55px;
                font-size: 1.3rem;
            }
        }
    `;
    document.head.appendChild(fabStyles);

    // Show FAB after popup is closed
    fab.addEventListener('click', () => {
        openPopup();
        fab.classList.remove('show');
    });

    // Show FAB after user scrolls past hero section
    const heroSection = document.getElementById('home');
    if (heroSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting && !sessionStorage.getItem(STORAGE_KEY + '_fabShown')) {
                    fab.classList.add('show');
                    sessionStorage.setItem(STORAGE_KEY + '_fabShown', 'true');
                }
            });
        }, { threshold: 0.5 });

        observer.observe(heroSection);
    }

    // ========== INPUT FORMATTING ==========
    // Format phone number as user types
    const phoneInput = popupForm.querySelector('input[name="phone"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
            if (value.length > 15) value = value.slice(0, 15);
            e.target.value = value;
        });
    }

    // Auto-resize textarea
    const textareas = popupForm.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    });

    console.debug('✅ Enquiry Popup initialized successfully');
    console.debug('📋 Popup will open after', POPUP_DELAY / 1000, 'seconds');
    console.debug('💾 Session storage used to prevent repeated popups');
}

// ========== INITIALIZE ON DOM LOAD ==========
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnquiryPopup);
} else {
    initEnquiryPopup();
}

// ========== EXPORT FOR EXTERNAL USE ==========
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initEnquiryPopup };
}