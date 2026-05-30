import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface Project {
    id: number;
    title: string;
    proxy_source_url: string | null;
    status: string;
    final_estimated_hours: number | null;
    created_at: string;
    updated_at: string;
    wbs_components?: WbsComponent[];
}

export interface DelphiVote {
    id: number;
    wbs_component_id: number;
    developer_name: string;
    voted_hours: number;
    created_at: string;
    updated_at: string;
}

export interface DeveloperProfile {
    id: number;
    name: string;
    role: string;
    weekly_loc_capacity: number;
    capability_multiplier: string | number;
    created_at: string;
    updated_at: string;
}

export interface WbsComponent {
    id: number;
    project_id: number;
    name: string;
    component_type: string;
    best_case_hours: number;
    most_likely_hours: number;
    worst_case_hours: number;
    computed_pert_effort: string;
    created_at: string;
    updated_at: string;
    delphi_votes?: DelphiVote[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
