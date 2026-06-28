# 🗄️ Supabase Backend Setup Guide
## AS FALSE CEILING - Complete Database Integration

---

## 📋 Table of Contents
1. [What is Supabase?](#what-is-supabase)
2. [Step 1: Create Supabase Account](#step-1-create-supabase-account)
3. [Step 2: Create New Project](#step-2-create-new-project)
4. [Step 3: Get API Credentials](#step-3-get-api-credentials)
5. [Step 4: Create Database Tables](#step-4-create-database-tables)
6. [Step 5: Configure Website](#step-5-configure-website)
7. [Step 6: Test Connection](#step-6-test-connection)
8. [Database Schema](#database-schema)
9. [Troubleshooting](#troubleshooting)

---

## What is Supabase?

**Supabase** is an open-source Firebase alternative that provides:
- ✅ **Free PostgreSQL database** (500MB storage)
- ✅ **Auto-generated REST API**
- ✅ **Real-time subscriptions**
- ✅ **Authentication** (if needed later)
- ✅ **File storage** (for gallery images)
- ✅ **No credit card required** for free tier

**Why Supabase for this project?**
- Perfect for small to medium websites
- Easy to set up and manage
- Generous free tier
- Works seamlessly with JavaScript
- No backend code needed

---

## Step 1: Create Supabase Account

### 1.1 Visit Supabase
```
https://supabase.com
```

### 1.2 Sign Up
- Click **"Start your project"** or **"Sign Up"**
- You can sign up with:
  - GitHub account (recommended)
  - Google account
  - Email and password

### 1.3 Verify Email
- Check your email for verification link
- Click the link to verify your account

---

## Step 2: Create New Project

### 2.1 Create Project
1. After logging in, click **"New Project"**
2. Fill in the details:
   ```
   Name: as-false-ceiling
   Database Password: [Create a strong password - SAVE THIS!]
   Region: [Choose closest to you, e.g., Asia Pacific]
   Pricing Plan: Free
   ```
3. Click **"Create new project"**

### 2.2 Wait for Setup
- Project creation takes ~2 minutes
- You'll see a progress indicator
- Once complete, you'll be redirected to the project dashboard

---

## Step 3: Get API Credentials

### 3.1 Navigate to API Settings
1. In your project dashboard, look for **"Settings"** (gear icon) in the left sidebar
2. Click on **"API"** under Settings

### 3.2 Copy Your Credentials
You'll see two important values:

```
Project URL: https://xxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANT:**
- **Project URL**: Your database endpoint
- **anon public key**: Public API key (safe to expose in frontend)
- **service_role key**: Secret key (NEVER expose in frontend!)

### 3.3 Save These Values
You'll need them in Step 5.

---

## Step 4: Create Database Tables

### 4.1 Open SQL Editor
1. In the left sidebar, click on **"SQL Editor"**
2. Click **"New query"**

### 4.2 Create Tables

Copy and paste the following SQL scripts one by one:

---

#### **Table 1: Contacts** (Contact Form Submissions)

```sql
-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed'))
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting contacts (anyone can submit)
CREATE POLICY "Allow public insert" ON contacts
    FOR INSERT WITH CHECK (true);

-- Create policy for reading contacts (only authenticated users)
CREATE POLICY "Allow authenticated read" ON contacts
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for updating contacts (only authenticated users)
CREATE POLICY "Allow authenticated update" ON contacts
    FOR UPDATE USING (auth.role() = 'authenticated');
```

Click **"Run"** to execute.

---

#### **Table 2: Gallery** (Project Images)

```sql
-- Create gallery table
CREATE TABLE IF NOT EXISTS gallery (
    id BIGSERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    is_large BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_display_order ON gallery(display_order);

-- Enable Row Level Security (RLS)
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Create policy for reading gallery (public can view)
CREATE POLICY "Allow public read" ON gallery
    FOR SELECT USING (true);

-- Create policy for inserting gallery (only authenticated users)
CREATE POLICY "Allow authenticated insert" ON gallery
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy for updating gallery (only authenticated users)
CREATE POLICY "Allow authenticated update" ON gallery
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy for deleting gallery (only authenticated users)
CREATE POLICY "Allow authenticated delete" ON gallery
    FOR DELETE USING (auth.role() = 'authenticated');
```

Click **"Run"** to execute.

---

#### **Table 3: Services** (Service Offerings)

```sql
-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    icon TEXT DEFAULT '◆',
    description TEXT NOT NULL,
    features_list JSONB DEFAULT '[]'::jsonb,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_services_display_order ON services(display_order);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policy for reading services (public can view)
CREATE POLICY "Allow public read" ON services
    FOR SELECT USING (is_active = true);

-- Create policy for managing services (only authenticated users)
CREATE POLICY "Allow authenticated manage" ON services
    FOR ALL USING (auth.role() = 'authenticated');
```

Click **"Run"** to execute.

---

#### **Table 4: Testimonials** (Client Reviews)

```sql
-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id BIGSERIAL PRIMARY KEY,
    rating TEXT NOT NULL CHECK (rating IN ('★★★★★', '★★★★', '★★★', '★★', '★')),
    text TEXT NOT NULL,
    avatar TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON testimonials(display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_active ON testimonials(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Create policy for reading testimonials (public can view)
CREATE POLICY "Allow public read" ON testimonials
    FOR SELECT USING (is_active = true);

-- Create policy for managing testimonials (only authenticated users)
CREATE POLICY "Allow authenticated manage" ON testimonials
    FOR ALL USING (auth.role() = 'authenticated');
```

Click **"Run"** to execute.

---

### 4.3 Verify Tables Created
1. Click on **"Table editor"** in the left sidebar
2. You should see 4 tables:
   - ✅ contacts
   - ✅ gallery
   - ✅ services
   - ✅ testimonials

---

## Step 5: Configure Website

### 5.1 Update Configuration File

Open the file: `js/supabase-config.js`

Find these lines (around line 6-7):

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

Replace with your actual credentials:

```javascript
const SUPABASE_URL = 'https://xxxxxxxxxxxx.supabase.co';  // Your Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';  // Your anon public key
```

**Example:**
```javascript
const SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJpYXQiOjE3MTk4MjE1NzksImV4cCI6MjAzNTM5NzU3OX0.abcdefghijklmnopqrstuvwxyz123456789';
```

### 5.2 Save the File
- Save `js/supabase-config.js`
- The website will automatically use these credentials

---

## Step 6: Test Connection

### 6.1 Open Website Locally

```bash
# Option 1: Using Python
python -m http.server 8000

# Option 2: Using Node.js
npx serve .

# Option 3: Using PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

### 6.2 Check Browser Console
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for these messages:

**Success Messages:**
```
✅ Supabase initialized successfully!
✅ Supabase connection verified!
```

**If you see errors:**
```
⚠️ Supabase connection test failed: relation "gallery" does not exist
```
This means tables aren't created yet. Go back to Step 4.

### 6.3 Test Contact Form
1. Scroll to the contact form
2. Fill in all fields:
   - Name: Test User
   - Phone: 9876543210
   - Email: test@example.com
   - Message: Test message
3. Click **"BOOK NOW"**
4. You should see:
   ```
   ✅ Thank you! We will contact you within 24 hours.
   ```

### 6.4 Verify Data in Supabase
1. Go back to Supabase dashboard
2. Click **"Table editor"**
3. Click on **"contacts"** table
4. You should see your test submission!

---

## Database Schema

### Contacts Table
```sql
contacts
├── id (Primary Key, Auto-increment)
├── name (Text, Required)
├── phone (Text, Required)
├── email (Text, Required)
├── message (Text, Optional)
├── created_at (Timestamp, Auto)
└── status (Text: new/read/replied/closed)
```

### Gallery Table
```sql
gallery
├── id (Primary Key, Auto-increment)
├── image_url (Text, Required)
├── title (Text, Required)
├── category (Text, Required)
├── is_large (Boolean, Default: false)
├── display_order (Integer, Default: 0)
└── created_at (Timestamp, Auto)
```

### Services Table
```sql
services
├── id (Primary Key, Auto-increment)
├── title (Text, Required)
├── icon (Text, Default: '◆')
├── description (Text, Required)
├── features_list (JSONB, Default: [])
├── display_order (Integer, Default: 0)
├── is_active (Boolean, Default: true)
├── created_at (Timestamp, Auto)
└── updated_at (Timestamp, Auto)
```

### Testimonials Table
```sql
testimonials
├── id (Primary Key, Auto-increment)
├── rating (Text: ★★★★★/★★★★/★★★/★★/★)
├── text (Text, Required)
├── avatar (Text, Required)
├── name (Text, Required)
├── role (Text, Required)
├── display_order (Integer, Default: 0)
├── is_active (Boolean, Default: true)
└── created_at (Timestamp, Auto)
```

---

## Adding Sample Data

### Add Gallery Images

In Supabase SQL Editor, run:

```sql
INSERT INTO gallery (image_url, title, category, is_large, display_order) VALUES
('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80', 'Modern Living Room', 'Residential • Modern', false, 1),
('https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', 'Premium Office Space', 'Commercial • Modern', true, 2),
('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80', 'Classic Bedroom Suite', 'Residential • Classic', false, 3),
('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80', 'Luxury Restaurant', 'Commercial • Modern', false, 4),
('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', 'Grand Luxury Hall', 'Residential • Modern', true, 5);
```

### Add Services

```sql
INSERT INTO services (title, icon, description, features_list, display_order) VALUES
('Gypsum False Ceiling', '👑', 'High-end premium finish with excellent fire resistance, sound isolation, and durability for luxury spaces.', 
 '["Fire resistant", "Sound isolation", "Smooth finish", "Custom designs"]', 1),
('PVC Ceiling Panels', '⚡', '100% waterproof and termite-resistant budget modern designs, best for kitchens and bathrooms.', 
 '["Waterproof", "Termite resistant", "Easy maintenance", "Modern designs"]', 2),
('Plaster of Paris (POP)', '✨', 'Exquisite custom 3D shapes and traditional curved architectural designs for a royal look.', 
 '["Custom 3D shapes", "Traditional designs", "Durable", "Cost effective"]', 3);
```

### Add Testimonials

```sql
INSERT INTO testimonials (rating, text, avatar, name, role, display_order) VALUES
('★★★★★', '"LuxeCeiling transformed our home completely. The gypsum ceiling design they created is absolutely stunning."', 'RK', 'Rajesh Kumar', 'Homeowner, Mumbai', 1),
('★★★★★', '"Professional team, excellent workmanship, and timely delivery. Our office ceiling looks premium and modern."', 'PS', 'Priya Sharma', 'Business Owner, Delhi', 2),
('★★★★★', '"The cove lighting design added so much warmth to our living room. The team was creative and understood our vision perfectly."', 'AM', 'Amit Mehta', 'Architect, Bangalore', 3);
```

---

## Troubleshooting

### ❌ Error: "Supabase not initialized"
**Solution:**
- Check if CDN link is correct in `index.html`
- Verify internet connection
- Check browser console for specific errors

### ❌ Error: "Invalid API key"
**Solution:**
- Double-check your `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Make sure you copied the **anon public key**, not the service_role key
- Keys are case-sensitive

### ❌ Error: "relation 'contacts' does not exist"
**Solution:**
- Tables not created yet
- Go to Step 4 and create all tables
- Run the SQL scripts in the correct order

### ❌ Error: "new row violates row-level security policy"
**Solution:**
- RLS policies not set correctly
- Make sure you ran the policy creation SQL
- Check that policies allow public insert for contacts

### ❌ Form submits but data not saved
**Solution:**
- Check browser console for errors
- Verify Supabase credentials are correct
- Make sure you're not using placeholder values
- Test with Supabase dashboard query

### ❌ Gallery not loading from database
**Solution:**
- Check if gallery table has data
- Verify image_url column has valid URLs
- Check browser console for fetch errors
- Fallback gallery should load automatically

---

## Security Best Practices

### ✅ DO:
- Use `anon public key` in frontend (it's designed to be public)
- Enable RLS (Row Level Security) on all tables
- Validate input on both frontend and backend
- Use HTTPS in production
- Regularly backup your database

### ❌ DON'T:
- Never expose `service_role key` in frontend
- Don't disable RLS unless absolutely necessary
- Don't store sensitive data without encryption
- Don't trust client-side validation alone

---

## Next Steps

### 1. Deploy to Production
- Deploy frontend to Vercel, Netlify, or GitHub Pages
- Update CORS settings in Supabase if needed

### 2. Add Authentication (Optional)
- Enable email authentication in Supabase
- Add login/signup forms
- Protect admin routes

### 3. Add Admin Panel (Optional)
- Create admin interface to manage content
- Upload images directly to Supabase Storage
- View and manage contact submissions

### 4. Enable Email Notifications (Optional)
- Use Supabase Edge Functions
- Send email when new contact form submitted
- Use services like SendGrid or Resend

---

## Useful Supabase Features

### 1. Supabase Studio
- Web-based database management
- View/edit data directly
- Run SQL queries
- Monitor performance

### 2. Real-time Subscriptions
```javascript
// Listen for new contacts in real-time
supabaseClient
  .channel('contacts')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contacts' }, 
    (payload) => console.log('New contact:', payload)
  )
  .subscribe();
```

### 3. File Storage
- Store gallery images in Supabase Storage
- Get public URLs for images
- Automatic image optimization

### 4. Database Backups
- Automatic daily backups (free tier: 7 days)
- Point-in-time recovery
- Export to SQL

---

## Support & Resources

### Official Documentation
- Supabase Docs: https://supabase.com/docs
- JavaScript Client: https://supabase.com/docs/reference/javascript
- PostgreSQL Docs: https://www.postgresql.org/docs/

### Community
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase
- Twitter: @supabase

### Your Project
- GitHub Repo: AS-False-Ceiling
- Supabase Project: as-false-ceiling

---

## ✅ Checklist

Before going live, make sure:

- [ ] Supabase project created
- [ ] All 4 tables created (contacts, gallery, services, testimonials)
- [ ] RLS policies enabled
- [ ] API credentials updated in `js/supabase-config.js`
- [ ] Test contact form submission works
- [ ] Test gallery loads from database
- [ ] Sample data inserted
- [ ] Website tested locally
- [ ] Error handling working
- [ ] Console shows no errors

---

## 🎉 Congratulations!

Your AS FALSE CEILING website now has a fully functional backend!

**What you can do now:**
- ✅ Collect contact form submissions
- ✅ Manage gallery images from database
- ✅ Update services dynamically
- ✅ Add/edit testimonials
- ✅ View all data in Supabase dashboard

**Next:**
1. Add more gallery images
2. Customize services
3. Add real testimonials
4. Deploy to production!

---

**Built with ❤️ for AS FALSE CEILING**

*Last Updated: 2024*