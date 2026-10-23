import {
  CalendarCheck,
  CalendarPlus,
  ClipboardCheck,
  Handshake,
  type LucideIcon,
} from "lucide-react";

/** One segment of a hero headline; `gradient` paints it cyan → violet. */
export type TitleSegment = { t: string; gradient?: boolean };

/** A heading split into a plain lead and a gradient-painted accent. */
export type SplitHeading = { lead: string; accent: string };

export type PageContent = {
  slug: string;
  docTitle: string;
  eyebrow: string;
  titleLines: TitleSegment[][];
  sub: string;
  ctaPrimary: string;
  /** Icon for the hero CTA — picked to match the action, not a generic arrow. */
  ctaPrimaryIcon: LucideIcon;
  heroImg: string;
  heroAlt: string;
  stats?: { value: string; label: string }[];
  ribbon: string;
  introEyebrow: string;
  introTitle: SplitHeading;
  introText: string;
  services: { title: string; desc: string }[];
  /** Agri only — the "what goes wrong" grid. */
  problemsEyebrow?: string;
  problemsTitle?: SplitHeading;
  problemsSub?: string;
  problems?: { title: string; desc: string }[];
  /** Events only — the 3×3 image grid. */
  expertiseEyebrow?: string;
  expertiseTitle?: SplitHeading;
  expertise?: { label: string; src: string }[];
  whyEyebrow: string;
  whyTitle: SplitHeading;
  why: string[];
  blueprintEyebrow: string;
  blueprintTitle: string;
  blueprint: { title: string; desc: string }[];
  ctaEyebrow: string;
  ctaTitle: string;
  ctaSub: string;
  ctaLabel: string;
  ctaBandIcon: LucideIcon;
};

export const agriContent: PageContent = {
  slug: "agri-marketing",
  docTitle: "Agri Marketing — Klixora",
  eyebrow: "// Klixora · Agri Marketing",
  titleLines: [
    [{ t: "AGRI MARKETING", gradient: true }],
    [{ t: "BUILT FOR " }, { t: "RURAL INDIA", gradient: true }],
  ],
  sub: "Klixora helps agri brands connect with rural audiences through digital, offline-first, and insight-led communication. From performance marketing to mass audio engagement and research-driven campaigns — strategies that work where it matters most.",
  ctaPrimary: "Book Strategy Call",
  ctaPrimaryIcon: CalendarCheck,
  heroImg: "/pages/agri-hero.png",
  heroAlt: "Agri marketing for rural India by Klixora",
  ribbon: "Specialization in Agri Marketing",
  introEyebrow: "// Our Services",
  introTitle: { lead: "End-to-end marketing solutions ", accent: "for agri brands" },
  introText:
    "Agri marketing is changing fast — today's farmers use phones, social platforms, audio channels, and digital touchpoints to discover and trust brands. Klixora offers a complete suite of performance-driven, farmer-friendly marketing services designed specifically for rural India.",
  services: [
    {
      title: "Performance Marketing & SEO for Agri Brands",
      desc: "Reach the right farmers, dealers, and agri businesses through SEO, Google Ads, and performance campaigns designed to generate quality leads and measurable growth.",
    },
    {
      title: "Agri Market Research & Campaign Execution",
      desc: "Make informed marketing decisions with farmer insights, market research, and targeted campaign execution tailored to regional and crop-specific audiences.",
    },
    {
      title: "Farmer Engagement Platform (Mass Audio & Omni-Channel)",
      desc: "Engage rural audiences at scale through voice calls, WhatsApp, SMS, and multi-channel communication that builds awareness, trust, and participation.",
    },
  ],
  problemsEyebrow: "// The Real Problem",
  problemsTitle: { lead: "Why most agri businesses ", accent: "lose on marketing" },
  problemsSub: "The patterns we fix every single day.",
  problems: [
    { title: "Low-Quality Leads", desc: "Wasting time on leads that never convert, draining your sales team's energy." },
    { title: "High Ad Spend, Poor ROAS", desc: "Burning budget daily with no clear visibility into what's actually working." },
    { title: "No Proper Strategy", desc: "Running ads without a clear targeting plan or funnel structure in place." },
    { title: "Wrong Audience", desc: "Showing ads to people who will never buy from you, wasting every rupee." },
    { title: "Weak Creatives & Copy", desc: "Ads that do not stop the scroll or communicate your value proposition clearly." },
    { title: "No Optimization", desc: "Set-and-forget campaigns that slowly bleed money month after month." },
  ],
  whyEyebrow: "// Why Klixora",
  whyTitle: { lead: "Why agri brands ", accent: "choose Klixora" },
  why: [
    "Built exclusively for Agri & rural audiences",
    "Deep understanding of farmer communication behaviour",
    "Technology-first platforms with offline accessibility",
    "Data-driven campaign strategy & optimisation",
    "Multilingual communication capabilities",
    "Scalable solutions for brands of all sizes",
  ],
  blueprintEyebrow: "// Our Blueprint",
  blueprintTitle: "Our blueprint for your success",
  blueprint: [
    { title: "Research & Discover", desc: "We study farmer needs, market trends and the competitor landscape." },
    { title: "Strategy & Planning", desc: "We build a rural-direct marketing strategy tailored for your goals." },
    { title: "Execute & Engage", desc: "We run multi-channel campaigns that reach and engage farmers." },
    { title: "Measure & Optimize", desc: "We track performance and optimize for maximum impact." },
  ],
  ctaEyebrow: "// Real Strategies. Real Results.",
  ctaTitle: "Ready to grow your agri brand?",
  ctaSub:
    "Whether your goal is to engage farmers, gather insights, or scale your digital presence — Klixora helps you build meaningful conversations that create real impact.",
  ctaLabel: "Let's Connect",
  ctaBandIcon: Handshake,
};

export const eventsContent: PageContent = {
  slug: "event-management",
  docTitle: "Event Management — Klixora",
  eyebrow: "// Klixora · Event Management",
  titleLines: [
    [{ t: "CREATE " }, { t: "EVENTS", gradient: true }],
    [{ t: "PEOPLE " }, { t: "REMEMBER", gradient: true }],
  ],
  sub: "From concept to execution, Klixora delivers end-to-end event management solutions that help brands create impactful experiences, engage audiences, and build lasting impressions.",
  ctaPrimary: "Plan Your Event",
  ctaPrimaryIcon: CalendarPlus,
  heroImg: "/pages/event-hero.png",
  heroAlt: "Event management by Klixora",
  stats: [
    { value: "400+", label: "Events Managed" },
    { value: "95%", label: "Client Satisfaction" },
  ],
  ribbon: "Specialization in Event Management",
  introEyebrow: "// Our Services",
  introTitle: { lead: "End-to-end ", accent: "event solutions" },
  introText:
    "Klixora helps businesses plan, design, manage, and execute professional events with creativity and precision. Corporate event, product launch, exhibition, or brand activation — every event delivers a memorable experience.",
  services: [
    { title: "Event Design & Production", desc: "From stage setup to event production, we design immersive experiences that reflect your brand and engage your audience." },
    { title: "Stage & Stall Design", desc: "Custom-designed stages and exhibition stalls that maximize brand visibility and create engaging visitor experiences." },
    { title: "LED & AV Setup", desc: "Professional LED screens, sound systems, lighting, and audiovisual solutions for a seamless event experience." },
    { title: "Artist & Influencer Booking", desc: "We arrange celebrities, influencers, hosts, speakers, and performers to increase audience engagement and event reach." },
    { title: "Branding & Printing", desc: "Complete branding support including standees, banners, backdrops, brochures, event signage, and promotional materials." },
    { title: "Venue Management", desc: "From venue selection to on-site coordination, we manage every detail to ensure smooth event execution." },
    { title: "Event Logistics", desc: "Transportation, setup, vendor coordination, inventory handling, and operational support managed efficiently under one roof." },
    { title: "Photography & Videography", desc: "Capture every important moment with professional photography and cinematic videography for marketing and future promotions." },
    { title: "On-Ground Team Management", desc: "Experienced event staff manage registrations, guest handling, stage coordination, crowd management, and overall operations." },
  ],
  expertiseEyebrow: "// Areas of Expertise",
  expertiseTitle: { lead: "Events we ", accent: "bring to life" },
  expertise: [
    { label: "Corporate Events", src: "/pages/exp-corporate.png" },
    { label: "Product Launches", src: "/pages/exp-launch.png" },
    { label: "Brand Activations", src: "/pages/exp-activation.png" },
    { label: "Exhibitions & Expos", src: "/pages/exp-expo.png" },
    { label: "Mall Activations", src: "/pages/exp-mall.png" },
    { label: "College Activations", src: "/pages/exp-college.png" },
    { label: "Road Shows", src: "/pages/exp-roadshow.png" },
    { label: "Dealer Meets", src: "/pages/exp-dealer.png" },
    { label: "Conferences & Seminars", src: "/pages/exp-seminar.png" },
  ],
  whyEyebrow: "// Why Klixora",
  whyTitle: { lead: "Why brands ", accent: "choose Klixora" },
  why: [
    "End-to-End Event Planning",
    "Creative Event Concepts",
    "Professional Event Production",
    "Dedicated On-Ground Team",
    "Branding & Printing Support",
    "Venue & Logistics Management",
  ],
  blueprintEyebrow: "// Our Blueprint",
  blueprintTitle: "Our blueprint for your success",
  blueprint: [
    { title: "Discovery & Planning", desc: "We map your goals, audience, venue, and budget before anything moves." },
    { title: "Production & Execution", desc: "Stages, stalls, AV, and branding produced with precision." },
    { title: "Execute & Engage", desc: "Our on-ground team runs the show, end to end." },
    { title: "Event Success & Reporting", desc: "Post-event reporting with photos, videos, and insights." },
  ],
  ctaEyebrow: "// Create Events That People Talk About",
  ctaTitle: "Let's plan something unforgettable",
  ctaSub:
    "From planning to promotion, we help brands create unforgettable experiences. Get your event managed by Klixora.",
  ctaLabel: "Get Your Event Managed",
  ctaBandIcon: ClipboardCheck,
};
