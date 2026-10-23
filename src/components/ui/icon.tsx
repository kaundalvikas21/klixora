import {
  Activity,
  Award,
  BarChart3,
  Boxes,
  Briefcase,
  Building2,
  CalendarCheck,
  Camera,
  ClipboardCheck,
  ClipboardList,
  Code2,
  CreditCard,
  Gauge,
  Globe,
  Handshake,
  Heart,
  Layers,
  Lightbulb,
  LineChart,
  Mail,
  MapPin,
  Megaphone,
  MessageSquare,
  MonitorSmartphone,
  Package,
  Palette,
  PenTool,
  PhoneCall,
  PieChart,
  Rocket,
  Search,
  Send,
  Share2,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Target,
  ThumbsUp,
  TrendingUp,
  Truck,
  Users,
  Video,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Services store their icon as a lucide export name. An explicit allowlist
 * rather than `import * as lucide`: a namespace import with a dynamic key
 * defeats tree-shaking and would pull all ~1500 icons into the bundle.
 *
 * This same list is what the admin's icon picker offers, so a stored name can
 * never be one the site cannot render.
 */
export const ICONS = {
  Activity,
  Award,
  BarChart3,
  Boxes,
  Briefcase,
  Building2,
  CalendarCheck,
  Camera,
  ClipboardCheck,
  ClipboardList,
  Code2,
  CreditCard,
  Gauge,
  Globe,
  Handshake,
  Heart,
  Layers,
  Lightbulb,
  LineChart,
  Mail,
  MapPin,
  Megaphone,
  MessageSquare,
  MonitorSmartphone,
  Package,
  Palette,
  PenTool,
  PhoneCall,
  PieChart,
  Rocket,
  Search,
  Send,
  Share2,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Target,
  ThumbsUp,
  TrendingUp,
  Truck,
  Users,
  Video,
  Zap,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export const DEFAULT_ICON: IconName = "Sparkles";

type IconProps = {
  name: string | null | undefined;
  size?: number;
  className?: string;
};

/**
 * The lookup is a plain property access rather than a helper call: a
 * function that returns a component reads as a component factory, which the
 * react-hooks lint rules reject and which would reset state on every render.
 */
export function Icon({ name, size = 20, className }: IconProps) {
  const Glyph: LucideIcon = ICONS[(name ?? "") as IconName] ?? ICONS[DEFAULT_ICON];
  return <Glyph size={size} className={className} aria-hidden="true" />;
}
