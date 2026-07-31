export type ToolCategory =
  | "converters"
  | "pickers"
  | "gradients"
  | "palettes"
  | "libraries"
  | "accessibility"
  | "image"
  | "css-generators"
  | "inspiration"
  | "learning"
  | "text-tools"
  | "developer-tools"
  | "web-tools"
  | "social-tools"
  | "utility-tools";

export interface ToolDefinition {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  keywords: string[];
  category: ToolCategory;
  icon: string;
  featured?: boolean;
  popular?: boolean;
  related?: string[];
}

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  name: string;
  href: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  publishedAt: string;
  updatedAt?: string;
  category: string;
  readingTime: string;
}
