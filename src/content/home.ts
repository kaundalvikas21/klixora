import {
  ClipboardCheck,
  Mail,
  Search,
  ShoppingBag,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type Service = {
  id: string;
  title: string;
  tag: string;
  desc: string;
  icon: LucideIcon;
};

export const services: Service[] = [
  {
    id: "audit-strategy",
    title: "Website Audit & Strategy",
    tag: "Diagnostic & Blueprint",
    desc: "We analyze your website to identify gaps, improve performance, and create a growth-focused strategy that attracts more visitors and converts them into customers.",
    icon: ClipboardCheck,
  },
  {
    id: "smm",
    title: "Social Media Marketing",
    tag: "Organic & Kinetic",
    desc: "Engaging content and campaigns that increase brand awareness, build audience trust, and drive meaningful customer engagement.",
    icon: Users,
  },
  {
    id: "seo",
    title: "SEO Optimization",
    tag: "Intent & Scale",
    desc: "Improve your Google rankings and attract organic traffic through keyword optimization, technical SEO, and content strategies that deliver long-term results.",
    icon: Search,
  },
  {
    id: "paid-ads",
    title: "Paid Ads (Meta & Google)",
    tag: "Performance Media",
    desc: "Reach the right audience with targeted Meta and Google Ads campaigns designed to generate quality leads, increase sales, and maximize ROI.",
    icon: Zap,
  },
  {
    id: "email-whatsapp",
    title: "Email & WhatsApp Marketing",
    tag: "Retention & LTV",
    desc: "Stay connected with your customers through personalized email and WhatsApp campaigns that nurture leads and boost repeat business.",
    icon: Mail,
  },
  {
    id: "ecommerce-marketplace",
    title: "E-Commerce & Marketplace Listing",
    tag: "Storefront Acceleration",
    desc: "Optimize your product listings on Amazon, Flipkart, and other marketplaces to increase visibility, attract buyers, and drive more sales.",
    icon: ShoppingBag,
  },
];

export const stats = [
  { id: "industries", value: 7, suffix: "+", label: "Industries Served" },
  { id: "businesses", value: 30, suffix: "+", label: "Businesses Scaled" },
  { id: "revenue", value: 10, suffix: "M+", label: "Generated in Revenue" },
] as const;

/** Bento spans sit on a 6-column grid: 4 / 2 / 2 / 2 / 3 / 3. */
export const whyCards = [
  {
    id: "data-driven",
    title: "Data-Driven Approach",
    desc: "Decisions based on real data and analytics to maximize your ROI, with no guesswork.",
    span: "lg:col-span-4",
    chart: true,
  },
  {
    id: "expert-team",
    title: "Expert Team",
    desc: "Certified professionals who stay ahead of digital marketing trends.",
    span: "lg:col-span-2",
  },
  {
    id: "proven-results",
    title: "Proven Results",
    desc: "Success stories delivered across various industries.",
    span: "lg:col-span-2",
  },
  {
    id: "marketplace",
    title: "Marketplace Support",
    desc: "Enlisting and visibility on marketplaces, with proven strategies that increase revenue.",
    span: "lg:col-span-2",
  },
  {
    id: "storytelling",
    title: "Creative Storytelling",
    desc: "We blend design, content, and marketing psychology to craft campaigns that connect to your audience.",
    span: "lg:col-span-3",
  },
  {
    id: "performance",
    title: "Performance Marketing Experts",
    desc: "Paid ads, SEO, and conversion optimization to help you scale faster.",
    span: "lg:col-span-3",
  },
] as const;

export const whyPills = [
  "Professional and certified company",
  "Best solution for your business",
  "Ongoing report about your business",
] as const;

export const processSteps = [
  {
    step: "01",
    title: "Research",
    subtitle: "We Listen Before We Plan",
    desc: "Before a single creative is made or a single rupee is spent, we audit. Your brand, competitors, audience, and growth gaps. Where most agencies skip, we don't.",
  },
  {
    step: "02",
    title: "Strategize",
    subtitle: "Your Roadmap, Built to Win",
    desc: "A full-funnel strategy covering which channels, what content, which ads, in what sequence. No cookie-cutter plans; every strategy is built for your business.",
  },
  {
    step: "03",
    title: "Create",
    subtitle: "Content That Actually Converts",
    desc: "Reels, carousels, ad copies, landing pages, email flows. Every piece is designed to move your audience from awareness to action.",
  },
  {
    step: "04",
    title: "Optimize",
    subtitle: "Live. Tracked. Optimized.",
    desc: "Underperforming ads get paused, winners get boosted, copy gets refined, audiences get retargeted. Optimization is a habit, not a phase.",
  },
  {
    step: "05",
    title: "Scale",
    subtitle: "Fix Fast. Improve Always.",
    desc: "Doubling down on what performs, expanding reach, and compounding growth into long-term brand equity.",
  },
] as const;

export const testimonials = [
  {
    id: "learntribe",
    quote:
      "Klixora handled our social media management and regular content posting. The communication was smooth and the team stayed consistent with timelines. Overall, it helped us maintain a more structured and active presence online.",
    name: "Sushree Nayak",
    role: "Founder, Learntribe",
    initials: "SN",
    from: "#FF5FA8",
    to: "#8B5CF6",
  },
  {
    id: "prospirafinreal",
    quote:
      "Klixora supported us with lead ads and Marathi content posting. The creatives were aligned with our target audience and the execution was straightforward. We saw steady responses from the campaigns.",
    name: "Pranav Bhuibar",
    role: "VP Marketing, Prospirafinreal",
    initials: "PB",
    from: "#3D7BFF",
    to: "#19B5F0",
  },
  {
    id: "nath-ayurveda",
    quote:
      "Klixora worked on our social media posting and website development. The team kept the design simple and aligned with our brand. The overall process was smooth and easy to manage.",
    name: "Mohit Malhotra",
    role: "Founder, Nath Ayurveda",
    initials: "MM",
    from: "#12B886",
    to: "#7CC22E",
  },
] as const;

export const contactPromises = [
  "A reply within 24 hours, from a person, not an autoresponder",
  "A straight answer on whether we are the right fit",
  "No pitch deck and no discovery theatre",
] as const;

export const formSteps = [
  "First, who are we talking to?",
  "How can we reach you?",
  "What are you interested in?",
  "Anything we should know?",
] as const;
