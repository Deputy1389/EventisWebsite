import {
  Activity,
  AlertTriangle,
  Anchor,
  ArrowRight,
  BookMarked,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  Copy,
  FileText,
  Filter,
  Flag,
  Folder,
  FolderOpen,
  Gavel,
  Group,
  HelpCircle,
  Info,
  Link,
  Link2Off,
  List,
  Loader,
  Lock,
  LogOut,
  Menu,
  MoreVertical,
  Move,
  Percent,
  Plus,
  RefreshCcw,
  Save,
  Scale,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Shuffle,
  SortAsc,
  Timer,
  Trash2,
  TrendingUp,
  Unlock,
  Upload,
  User,
  Users,
  Verified,
  View,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const materialToLucide: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: Activity,
  folder_open: FolderOpen,
  folder: Folder,
  ecg_heart: Activity,
  gavel: Gavel,
  settings: Settings,
  logout: LogOut,
  search: Search,
  add: Plus,
  table_rows: List,
  description: FileText,
  verified_user: ShieldCheck,
  check_circle: CheckCircle,
  check: Check,
  warning: AlertTriangle,
  info: Info,
  close: X,
  chevron_right: ChevronRight,
  expand_more: ChevronDown,
  ios_share: ShareIcon,
  filter_list: Filter,
  unfold_less: UnfoldLessIcon,
  sort: SortAsc,
  link: Link,
  visibility: View,
  shield_person: ShieldPersonIcon,
  flag: Flag,
  gpp_bad: AlertTriangle,
  verified: Verified,
  rocket_launch: Zap,
  format_quote: QuoteIcon,
  balance: Scale,
  anchor: Anchor,
  account_tree: TreeIcon,
  link_off: Link2Off,
  shuffle: Shuffle,
  menu: Menu,
  delete: Trash2,
  save: Save,
  schedule: Timer,
  medication: PillIcon,
  percent: Percent,
  restart_alt: RefreshCcw,
  shield_with_heart: ShieldHeartIcon,
  group: Users,
  receipt_long: ReceiptIcon,
};

function ShareIcon(props: { className?: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  );
}

function QuoteIcon(props: { className?: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3" />
    </svg>
  );
}

function TreeIcon(props: { className?: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="8" x="2" y="8" rx="2" />
      <rect width="20" height="8" x="2" y="14" rx="2" />
      <path d="M6 4v16" />
      <path d="M10 4v16" />
      <path d="M14 4v4" />
      <path d="M14 10v6" />
    </svg>
  );
}

function ShieldHeartIcon(props: { className?: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
      <path d="m18 15-2-2" />
      <path d="m15 18-2-2" />
    </svg>
  );
}

function PillIcon(props: { className?: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <path d="m8.5 8.5 7 7" />
    </svg>
  );
}

function ReceiptIcon(props: { className?: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17V7" />
    </svg>
  );
}

function UnfoldLessIcon(props: { className?: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 17 5-5 5 5" />
      <path d="m2 7 5 5 5-5" />
      <path d="m2 12 5 5 5-5" />
      <path d="m17 17 5-5 5 5" />
      <path d="m17 7 5 5 5-5" />
      <path d="m17 12 5 5 5-5" />
    </svg>
  );
}

function ShieldPersonIcon(props: { className?: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export interface IconProps {
  name: string;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  const LucideIcon = materialToLucide[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in materialToLucide mapping`);
    return <HelpCircle className={cn("w-4 h-4", className)} />;
  }

  return <LucideIcon className={className} />;
}

export const iconNames = [
  "dashboard",
  "folder_open",
  "folder",
  "ecg_heart",
  "gavel",
  "settings",
  "logout",
  "search",
  "add",
  "table_rows",
  "description",
  "verified_user",
  "check_circle",
  "check",
  "warning",
  "info",
  "close",
  "chevron_right",
  "expand_more",
  "ios_share",
  "filter_list",
  "unfold_less",
  "sort",
  "link",
  "visibility",
  "shield_person",
  "flag",
  "gpp_bad",
  "verified",
  "rocket_launch",
  "format_quote",
  "balance",
  "anchor",
  "account_tree",
  "link_off",
  "shuffle",
  "menu",
  "delete",
  "save",
  "schedule",
  "medication",
  "percent",
  "restart_alt",
  "shield_with_heart",
  "group",
  "receipt_long",
] as const;

export type IconName = (typeof iconNames)[number];
