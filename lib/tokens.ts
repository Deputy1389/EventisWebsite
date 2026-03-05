export const tokens = {
  radius: {
    sm: "calc(0.5rem - 4px)",
    md: "calc(0.5rem - 2px)",
    lg: "0.5rem",
    xl: "calc(0.5rem + 4px)",
    "2xl": "calc(0.5rem + 8px)",
    "3xl": "calc(0.5rem + 12px)",
    full: "9999px",
  },
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
    glow: {
      primary: "0 0 20px rgba(59, 130, 246, 0.2)",
      success: "0 0 20px rgba(22, 163, 74, 0.2)",
      danger: "0 0 20px rgba(220, 38, 38, 0.2)",
    },
  },
  border: {
    DEFAULT: "#e2e8f0",
    dark: "#30363d",
    subtle: "#e2e8f0",
  },
  spacing: {
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    6: "1.5rem",
    8: "2rem",
  },
  typography: {
    xs: {
      fontSize: "0.75rem",
      lineHeight: "1rem",
      letterSpacing: "0.05em",
    },
    sm: {
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
    },
    base: {
      fontSize: "1rem",
      lineHeight: "1.5rem",
    },
    lg: {
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
    },
    xl: {
      fontSize: "1.25rem",
      lineHeight: "1.75rem",
    },
    "2xl": {
      fontSize: "1.5rem",
      lineHeight: "2rem",
    },
  },
  semantic: {
    status: {
      verified: "#16A34A",
      review: "#EAB308",
      blocked: "#DC2626",
      pending: "#64748B",
    },
    risk: {
      elevated: "#DC2626",
      high: "#F97316",
      medium: "#EAB308",
      low: "#16A34A",
    },
    priority: {
      critical: "#DC2626",
      urgent: "#F97316",
      normal: "#3B82F6",
      low: "#64748B",
    },
  },
  colors: {
    primary: "#3B82F6",
    "primary-dark": "#2563EB",
    "background-light": "#f6f6f8",
    "background-dark": "#0E1116",
    "surface-dark": "#1A1F29",
    success: "#16A34A",
    danger: "#DC2626",
    warning: "#EAB308",
    citation: "#0EA5A9",
  },
} as const;

export type Tokens = typeof tokens;
export type RiskLevel = keyof typeof tokens.semantic.risk;
export type StatusLevel = keyof typeof tokens.semantic.status;
export type PriorityLevel = keyof typeof tokens.semantic.priority;
