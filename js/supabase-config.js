/* ============================================
   AS FALSE CEILING - Supabase Configuration
   Backend Integration for Contact Form & Gallery
   ============================================ */

// ========== SUPABASE CONFIGURATION ==========
// Replace these with your actual Supabase project credentials
// ⚠️  IMPORTANT: Use the "anon / public" API key from Supabase Dashboard
//     NOT the "service_role / secret" key (which is for server-side only)
//     Get your anon key from: Supabase Dashboard → Settings → API → "anon public" key
// Supabase credentials should NOT be hard-coded in source.
// Recommended: create `js/supabase-config.local.js` (gitignored) that sets `window.SUPABASE_CONFIG = { SUPABASE_URL: 'https://...', SUPABASE_ANON_KEY: 'your-anon-key' }`.
// This file below will read from `window.SUPABASE_CONFIG` when available.
const {
    SUPABASE_URL = 'https://leytftnlvyeqisfiyxck.supabase.co',
    SUPABASE_ANON_KEY = 'sb_publishable_Q7AMpGQaFKH3pmBvfrhZMw_VEUYvBnz'
} = window.SUPABASE_CONFIG || {};

// Initialize Supabase client
let supabaseClient = null;

// Retry mechanism for Supabase initialization
let supabaseInitRetries = 0;
const MAX_SUPABASE_RETRIES = 15;

function initSupabase() {
    // Check if Supabase library is loaded
    if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
        try {
            if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
                console.warn('⚠️ Supabase credentials not found. Please create js/supabase-config.local.js with window.SUPABASE_CONFIG. Falling back to demo mode.');
            }
            // Create Supabase client (if credentials present)
            supabaseClient = SUPABASE_URL && SUPABASE_ANON_KEY ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
            if (supabaseClient) console.debug('✅ Supabase initialized successfully!');
            
            // Test connection only if client created
            if (supabaseClient) testSupabaseConnection();
            
            return true;
        } catch (error) {
            console.error('❌ Supabase initialization error:', error);
            return false;
        }
    } else {
        // Retry if library not loaded yet
        supabaseInitRetries++;
        if (supabaseInitRetries < MAX_SUPABASE_RETRIES) {
            console.debug(`⏳ Waiting for Supabase library... (attempt ${supabaseInitRetries}/${MAX_SUPABASE_RETRIES})`);
            setTimeout(initSupabase, 200);
        } else {
            console.warn('⚠️ Supabase SDK failed to load after maximum retries.');
            console.warn('📋 Using fallback mode - contact form will not save to database.');
            return false;
        }
    }
}

// Test Supabase connection
async function testSupabaseConnection() {
    if (!supabaseClient) return;
    
    try {
        // Try to fetch from gallery table to test connection
        const { data, error } = await supabaseClient
            .from('gallery')
            .select('count')
            .limit(1);
        
        if (error) {
            console.warn('⚠️ Supabase connection test failed:', error.message);
            console.warn('💡 Make sure you have created the required tables in Supabase.');
        } else {
            console.debug('✅ Supabase connection verified!');
        }
    } catch (error) {
        console.warn('⚠️ Supabase connection error:', error);
    }
}

// ========== CONTACT FORM SUBMISSION ==========
async function submitContactForm(formData) {
    if (!supabaseClient) {
        throw new Error('Supabase not initialized');
    }

    try {
        // Validate required fields
        const { name, email, phone, address } = formData;
        
        if (!formData.name || !formData.email || !formData.phone || !formData.address) {
            throw new Error('Please fill in all required fields (name, email, phone, address)');
        }

        // Phone validation (basic)
        const phoneRegex = /^[+]?[\d\s()-]+$/;
        if (!phoneRegex.test(phone) || phone.length < 10) {
            throw new Error('Please enter a valid phone number');
        }

        // Insert data into contacts table
        const { data, error } = await supabaseClient
            .from('contacts')
            .insert([
                {
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    message: address.trim(),
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            console.error('❌ Database insert error:', error);
            throw new Error('Failed to save your message. Please try again.');
        }

        console.debug('✅ Contact form submitted successfully:', data);
        return {
            success: true,
            message: 'Thank you! We will contact you within 24 hours.',
            data: data[0]
        };

    } catch (error) {
        console.error('❌ Contact form submission error:', error);
        throw error;
    }
}

// ========== FETCH GALLERY FROM DATABASE ==========
async function fetchGalleryFromDatabase() {
    if (!supabaseClient) {
        console.warn('⚠️ Supabase not initialized, using fallback gallery');
        return null;
    }

    try {
        const { data, error } = await supabaseClient
            .from('gallery')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error('❌ Gallery fetch error:', error);
            return null;
        }

        if (data && data.length > 0) {
            console.debug(`✅ Fetched ${data.length} gallery items from database`);
            return data;
        }

        return null;
    } catch (error) {
        console.error('❌ Gallery fetch exception:', error);
        return null;
    }
}

// ========== FETCH SERVICES FROM DATABASE ==========
async function fetchServicesFromDatabase() {
    if (!supabaseClient) {
        console.warn('⚠️ Supabase not initialized, using fallback services');
        return null;
    }

    try {
        const { data, error } = await supabaseClient
            .from('services')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error('❌ Services fetch error:', error);
            return null;
        }

        if (data && data.length > 0) {
            console.debug(`✅ Fetched ${data.length} services from database`);
            return data;
        }

        return null;
    } catch (error) {
        console.error('❌ Services fetch exception:', error);
        return null;
    }
}

// ========== FETCH TESTIMONIALS FROM DATABASE ==========
async function fetchTestimonialsFromDatabase() {
    if (!supabaseClient) {
        console.warn('⚠️ Supabase not initialized, using fallback testimonials');
        return null;
    }

    try {
        const { data, error } = await supabaseClient
            .from('testimonials')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error('❌ Testimonials fetch error:', error);
            return null;
        }

        if (data && data.length > 0) {
            console.debug(`✅ Fetched ${data.length} testimonials from database`);
            return data;
        }

        return null;
    } catch (error) {
        console.error('❌ Testimonials fetch exception:', error);
        return null;
    }
}

// ========== UTILITY FUNCTIONS ==========

// Sanitize user input to prevent XSS
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone format
function isValidPhone(phone) {
    const phoneRegex = /^[+]?[\d\s()-]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// ========== INITIALIZATION ==========
// Try to load a local config file (js/supabase-config.local.js) if present,
// then initialize Supabase. This avoids committing keys to source control.
function loadLocalConfigThenInit() {
    if (window.SUPABASE_CONFIG) {
        return initSupabase();
    }

    const script = document.createElement('script');
    script.src = 'js/supabase-config.local.js';
    script.async = true;
    script.onload = () => {
        console.debug('✅ Loaded local Supabase config (js/supabase-config.local.js)');
        initSupabase();
    };
    script.onerror = () => {
        console.warn('⚠️ js/supabase-config.local.js not found — continuing without local config');
        initSupabase();
    };
    document.head.appendChild(script);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadLocalConfigThenInit);
} else {
    loadLocalConfigThenInit();
}

// Export functions for use in other scripts
window.SupabaseAPI = {
    submitContactForm,
    fetchGalleryFromDatabase,
    fetchServicesFromDatabase,
    fetchTestimonialsFromDatabase,
    isInitialized: () => supabaseClient !== null,
    getClient: () => supabaseClient
};

console.debug('📦 Supabase configuration module loaded');