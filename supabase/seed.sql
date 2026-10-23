-- The home page's live copy, loaded into the tables.
--
-- Runs automatically on `supabase db reset`. Content only: the admin user is
-- created by `npm run db:admin`, which goes through the Auth Admin API so the
-- same command works against a hosted project.
--
-- Every insert is `on conflict do nothing`, so re-running never overwrites
-- copy that has been edited in the admin.

-- ---------------------------------------------------------------------------
-- Site settings
-- ---------------------------------------------------------------------------

insert into public.site_settings (
  brand_name, tagline, domain, logo_url, logo_alt, logo_height,
  address_line1, address_line2, map_url, email, phone, whatsapp, hours_label
)
select
  'Klixora',
  'Growth Driven Digital Strategy',
  'klixora.site',
  '/klixora-logo-white.webp',
  'Klixora',
  34,
  'Vardhman City',
  'Kurukshetra, Haryana',
  'https://maps.google.com/?cid=18288639185173001004',
  'Info@Klixora.site',
  '8668322325',
  '918668322325',
  'Mon-Fri from 8am to 5pm'
where not exists (select 1 from public.site_settings);

-- day_of_week 0 = Monday. Mon-Fri open, weekend closed.
insert into public.working_hours (day_of_week, opens_at, closes_at, is_closed)
values
  (0, '08:00', '17:00', false),
  (1, '08:00', '17:00', false),
  (2, '08:00', '17:00', false),
  (3, '08:00', '17:00', false),
  (4, '08:00', '17:00', false),
  (5, null, null, true),
  (6, null, null, true)
on conflict (day_of_week) do nothing;

-- The real profiles, taken from the live klixora.site footer.
insert into public.social_links (platform, url, is_visible, sort_order)
select * from (values
  ('LinkedIn',  'https://www.linkedin.com/company/klixora',                  true, 0),
  ('Instagram', 'https://www.instagram.com/klixora.site/',                   true, 1),
  ('Facebook',  'https://www.facebook.com/people/Klixora/61578608045043/',   true, 2),
  ('YouTube',   'https://www.youtube.com/@Klixora.Official',                 true, 3)
) as v(platform, url, is_visible, sort_order)
where not exists (select 1 from public.social_links);

-- ---------------------------------------------------------------------------
-- Home page sections.
--
-- Asterisks mark the cyan-to-violet words in a heading: "GROWTH *DRIVEN*".
-- See src/lib/rich-text.tsx.
--
-- draft and published are seeded identical, so the site renders exactly as it
-- did before the migration and the admin opens with nothing pending.
-- ---------------------------------------------------------------------------

insert into public.page_sections (page_slug, section_key, draft, published, published_at)
values (
  'home',
  'hero',
  jsonb_build_object(
    'eyebrow', '// Klixora · Digital Growth Partner',
    'headlineLines', jsonb_build_array('GROWTH *DRIVEN*', '*DIGITAL* STRATEGY', 'FOR BOLD BRANDS'),
    'subheadline', 'More than a digital agency. We are architects of growth strategies, engineers of digital presence, and the partner you call when you''re serious about scaling.',
    'backgroundImageUrl', '/hero-bg.webp',
    'chips', jsonb_build_array('Data-Driven Approach'),
    'scrollCue', 'Scroll to explore'
  ),
  jsonb_build_object(
    'eyebrow', '// Klixora · Digital Growth Partner',
    'headlineLines', jsonb_build_array('GROWTH *DRIVEN*', '*DIGITAL* STRATEGY', 'FOR BOLD BRANDS'),
    'subheadline', 'More than a digital agency. We are architects of growth strategies, engineers of digital presence, and the partner you call when you''re serious about scaling.',
    'backgroundImageUrl', '/hero-bg.webp',
    'chips', jsonb_build_array('Data-Driven Approach'),
    'scrollCue', 'Scroll to explore'
  ),
  now()
)
on conflict (page_slug, section_key) do nothing;

insert into public.page_sections (page_slug, section_key, draft, published, published_at)
values (
  'home',
  'services',
  jsonb_build_object(
    'eyebrow', '// Core Services',
    'heading', 'Digital solutions *that work.*',
    'intro', 'Instead of juggling multiple agencies, you get everything under one roof: ads, organic presence, and everything your business needs to grow online.',
    'ctaLabel', 'Get a free audit',
    'ctaHref', '/#contact',
    'columns', 3
  ),
  jsonb_build_object(
    'eyebrow', '// Core Services',
    'heading', 'Digital solutions *that work.*',
    'intro', 'Instead of juggling multiple agencies, you get everything under one roof: ads, organic presence, and everything your business needs to grow online.',
    'ctaLabel', 'Get a free audit',
    'ctaHref', '/#contact',
    'columns', 3
  ),
  now()
)
on conflict (page_slug, section_key) do nothing;

insert into public.page_sections (page_slug, section_key, draft, published, published_at)
values (
  'home',
  'contact',
  jsonb_build_object(
    'eyebrow', '// Contact',
    'heading', 'Let''s make something *great together!*',
    'cardKicker', 'Start here',
    'formTitle', 'Tell us what you are trying to grow.',
    'formIntro', 'Four short questions. It takes under a minute, and it tells us more than a contact form ever does.',
    'successTitle', 'Thanks, that''s everything we need.',
    'successMessage', 'A real person will reply within 24 hours. No autoresponder, no pitch deck.',
    'notifyInbox', 'Info@Klixora.site',
    'slaHours', 24,
    'showContactBlock', true
  ),
  jsonb_build_object(
    'eyebrow', '// Contact',
    'heading', 'Let''s make something *great together!*',
    'cardKicker', 'Start here',
    'formTitle', 'Tell us what you are trying to grow.',
    'formIntro', 'Four short questions. It takes under a minute, and it tells us more than a contact form ever does.',
    'successTitle', 'Thanks, that''s everything we need.',
    'successMessage', 'A real person will reply within 24 hours. No autoresponder, no pitch deck.',
    'notifyInbox', 'Info@Klixora.site',
    'slaHours', 24,
    'showContactBlock', true
  ),
  now()
)
on conflict (page_slug, section_key) do nothing;

-- ---------------------------------------------------------------------------
-- Structured rows
-- ---------------------------------------------------------------------------

insert into public.hero_ctas (label, href, variant, open_new_tab, is_visible, sort_order)
select * from (values
  ('Enquire Now',         '/#contact', 'PRIMARY'::public.cta_variant, false, true, 0),
  ('Get on a Call Today', '/#contact', 'OUTLINE'::public.cta_variant, false, true, 1)
) as v(label, href, variant, open_new_tab, is_visible, sort_order)
where not exists (select 1 from public.hero_ctas);

-- `icon` is a lucide-react export name from the allowlist in
-- src/components/ui/icon.tsx.
insert into public.services (kicker, title, description, icon, status, is_visible, sort_order)
select * from (values
  ('Diagnostic & Blueprint', 'Website Audit & Strategy',
   'We analyze your website to identify gaps, improve performance, and create a growth-focused strategy that attracts more visitors and converts them into customers.',
   'ClipboardCheck', 'LIVE'::public.content_status, true, 0),
  ('Organic & Kinetic', 'Social Media Marketing',
   'Engaging content and campaigns that increase brand awareness, build audience trust, and drive meaningful customer engagement.',
   'Users', 'LIVE'::public.content_status, true, 1),
  ('Intent & Scale', 'SEO Optimization',
   'Improve your Google rankings and attract organic traffic through keyword optimization, technical SEO, and content strategies that deliver long-term results.',
   'Search', 'LIVE'::public.content_status, true, 2),
  ('Performance Media', 'Paid Ads (Meta & Google)',
   'Reach the right audience with targeted Meta and Google Ads campaigns designed to generate quality leads, increase sales, and maximize ROI.',
   'Zap', 'LIVE'::public.content_status, true, 3),
  ('Retention & LTV', 'Email & WhatsApp Marketing',
   'Stay connected with your customers through personalized email and WhatsApp campaigns that nurture leads and boost repeat business.',
   'Mail', 'LIVE'::public.content_status, true, 4),
  ('Storefront Acceleration', 'E-Commerce & Marketplace Listing',
   'Optimize your product listings on Amazon, Flipkart, and other marketplaces to increase visibility, attract buyers, and drive more sales.',
   'ShoppingBag', 'LIVE'::public.content_status, true, 5)
) as v(kicker, title, description, icon, status, is_visible, sort_order)
where not exists (select 1 from public.services);

insert into public.contact_promises (body, sort_order)
select * from (values
  ('A reply within 24 hours, from a person, not an autoresponder', 0),
  ('A straight answer on whether we are the right fit', 1),
  ('No pitch deck and no discovery theatre', 2)
) as v(body, sort_order)
where not exists (select 1 from public.contact_promises);

-- Each field's `name` is the leads column it writes to, which is what makes a
-- submission arrive with its answers mapped.
insert into public.form_steps (step_number, question, fields)
values
  (1, 'First, who are we talking to?', jsonb_build_array(
     jsonb_build_object('name', 'firstName', 'label', 'First name', 'type', 'text', 'required', true),
     jsonb_build_object('name', 'lastName',  'label', 'Last name',  'type', 'text', 'required', true)
   )),
  (2, 'How can we reach you?', jsonb_build_array(
     jsonb_build_object('name', 'email', 'label', 'Email',  'type', 'email', 'required', true),
     jsonb_build_object('name', 'phone', 'label', 'Mobile', 'type', 'tel',   'required', true)
   )),
  (3, 'What are you interested in?', jsonb_build_array(
     jsonb_build_object(
       'name', 'goal', 'label', 'Service', 'type', 'select', 'required', true,
       'options', jsonb_build_array(
         'Website Audit & Strategy',
         'Social Media Marketing',
         'SEO Optimization',
         'Paid Ads (Meta & Google)',
         'Email & WhatsApp Marketing',
         'E-Commerce & Marketplace Listing',
         'Event Management'
       )
     )
   )),
  (4, 'Anything we should know?', jsonb_build_array(
     jsonb_build_object('name', 'message', 'label', 'Message (optional)', 'type', 'textarea', 'required', false)
   ))
on conflict (step_number) do nothing;

-- ---------------------------------------------------------------------------
-- SEO
-- ---------------------------------------------------------------------------

insert into public.seo_defaults (title_template, sitemap_url)
select '%s | Klixora', 'https://klixora.site/sitemap.xml'
where not exists (select 1 from public.seo_defaults);

insert into public.seo_meta (
  page_slug, path, meta_title, meta_description, canonical_url,
  robots, og_title, og_description, twitter_card, focus_keywords, schema_type
)
select * from (values
  ('home', '/',
   'Klixora: Growth Driven Digital Strategy for Bold Brands',
   'Growth driven digital strategy for bold brands. Klixora runs paid ads, SEO, social media, e-commerce and marketplace growth for you, under one roof.',
   'https://klixora.site', 'index, follow',
   'Klixora: Growth Driven Digital Strategy for Bold Brands',
   'Paid ads, SEO, social media, e-commerce and marketplace growth under one roof.',
   'summary_large_image',
   array['digital marketing agency', 'performance marketing', 'SEO Kurukshetra'],
   'LocalBusiness'),
  ('services', '/#services',
   'Core Services: Ads, SEO, Social and Marketplace Growth',
   'Everything under one roof: website audit and strategy, social media, SEO, paid ads, email and WhatsApp marketing, e-commerce and marketplace listing.',
   'https://klixora.site/#services', 'index, follow', '', '',
   'summary_large_image',
   array['digital marketing services', 'paid ads agency'],
   'Service'),
  ('contact', '/#contact',
   'Contact Klixora: Talk to a Growth Partner Today',
   'Four short questions and a real reply within 24 hours. Tell us what you are trying to grow and we will tell you straight whether we are the right fit.',
   'https://klixora.site/#contact', 'index, follow', '', '',
   'summary_large_image',
   array['contact digital marketing agency'],
   'Organization'),
  ('agri-marketing', '/agri-marketing',
   'Agri Marketing Built for Rural India | Klixora',
   'Klixora helps agri brands connect with rural audiences through digital, offline-first, and insight-led communication that works where it matters most.',
   'https://klixora.site/agri-marketing', 'index, follow', '', '',
   'summary_large_image',
   array['agri marketing', 'rural marketing India'],
   'Service'),
  ('event-management', '/event-management',
   'Event Management and Brand Activations | Klixora',
   'Stage and stall design, LED and AV, artist booking, branding, logistics and on-ground teams. Klixora runs your whole event, end to end, under one roof.',
   'https://klixora.site/event-management', 'index, follow', '', '',
   'summary_large_image',
   array['event management agency', 'brand activation'],
   'Service')
) as v(page_slug, path, meta_title, meta_description, canonical_url,
       robots, og_title, og_description, twitter_card, focus_keywords, schema_type)
on conflict (page_slug) do nothing;
