import type { LucideIcon } from 'lucide-react';

export interface NavChild {
  title: string;
  href: string;
}

export interface NavSection {
  title: string;
  href: string;
  children: NavChild[];
}

export interface ParamDoc {
  name: string;
  type: string;
  required: boolean;
  description: string;
  in: 'query' | 'body' | 'path';
}

export interface EndpointDoc {
  slug: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  title: string;
  description: string;
  auth: 'session' | 'app-proxy' | 'admin-api-key' | 'partner-token' | 'none';
  authNote: string;
  params: ParamDoc[];
  requestExample?: string;
  responseExample: string;
  liveTestable: boolean;
}

export interface EndpointGroup {
  slug: string;
  title: string;
  description: string;
  endpoints: EndpointDoc[];
}

export interface AppDoc {
  slug: string;
  name: string;
  color: string;
  icon: LucideIcon;
  tagline: string;
  plans: string[];
  overview: string;
  keyFeatures: string[];
  configuration: string[];
  storefrontBehavior: string;
}

export interface FeatureDoc {
  slug: string;
  title: string;
  tagline: string;
  icon: LucideIcon;
  color: string;
  sections: { title: string; content: string; bullets?: string[] }[];
}

export interface WorkflowStep {
  name: string;
  detail: string;
}

export interface WorkflowDoc {
  slug: string;
  title: string;
  file: string;
  trigger: string;
  description: string;
  jobs: {
    name: string;
    runsOn: string;
    steps: WorkflowStep[];
  }[];
}
