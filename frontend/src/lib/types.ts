export interface Team {
  id: number;
  name: string;
  slug: string;
  plan: string;
  settings?: Record<string, unknown>;
}

export interface User {
  id: number;
  team_id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'counsellor' | 'agent';
  is_active: boolean;
  referral_code?: string;
  team?: Team;
}

export interface WhatsappAccount {
  id: number;
  team_id: number;
  instance_name: string;
  phone_number?: string;
  display_name?: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'banned';
  qr_code?: string;
  connected_at?: string;
}

export interface Contact {
  id: number;
  team_id: number;
  phone: string;
  name?: string;
  email?: string;
  place?: string;
  avatar?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
  notes?: string;
  source?: string;
  assigned_to?: number;
  assigned_user?: User;
  created_at: string;
}

export interface LeadStage {
  id: number;
  pipeline_id: number;
  name: string;
  color: string;
  sort_order: number;
  leads?: Lead[];
}

export interface Lead {
  id: number;
  team_id: number;
  contact_id: number;
  stage_id: number;
  assigned_to?: number;
  title?: string;
  value?: number;
  course_interest?: string;
  budget?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'won' | 'lost';
  notes?: string;
  contact?: Contact;
  stage?: LeadStage;
  assigned_user?: User;
  created_at: string;
}

export interface Conversation {
  id: number;
  team_id: number;
  whatsapp_account_id: number;
  contact_id: number;
  assigned_to?: number;
  folder: 'new_leads' | 'interested' | 'follow_up' | 'converted' | 'closed';
  status: 'open' | 'pending' | 'resolved';
  last_message?: string;
  last_message_at?: string;
  is_unread: boolean;
  unread_count: number;
  contact?: Contact;
  assigned_user?: User;
  whatsapp_account?: WhatsappAccount;
}

export interface Message {
  id: number;
  conversation_id: number;
  contact_id?: number;
  user_id?: number;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'sticker' | 'button' | 'list' | 'template';
  direction: 'inbound' | 'outbound';
  body?: string;
  media?: { url?: string; mime_type?: string; filename?: string };
  metadata?: Record<string, unknown>;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  is_from_bot: boolean;
  sent_at?: string;
  created_at: string;
}

export interface Flow {
  id: number;
  team_id: number;
  name: string;
  description?: string;
  trigger_type: 'keyword' | 'new_contact' | 'webhook' | 'manual';
  trigger_keywords?: string[];
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  is_active: boolean;
  executions_count: number;
  created_at: string;
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Campaign {
  id: number;
  team_id: number;
  whatsapp_account_id: number;
  name: string;
  description?: string;
  type: 'text' | 'image' | 'video' | 'document' | 'button' | 'list';
  message_body?: string;
  media?: Record<string, unknown>;
  buttons?: Record<string, unknown>[];
  recipients?: number[];
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';
  scheduled_at?: string;
  created_at: string;
}

export interface KeywordAutomation {
  id: number;
  team_id: number;
  keyword: string;
  match_type: 'exact' | 'contains' | 'starts_with';
  response_type: 'text' | 'image' | 'document' | 'flow';
  response_text?: string;
  response_media?: Record<string, unknown>;
  flow_id?: number;
  is_active: boolean;
  triggered_count: number;
}

export interface FollowUpSequence {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  steps?: FollowUpStep[];
  enrollments_count?: number;
}

export interface FollowUpStep {
  id: number;
  delay_days: number;
  delay_hours: number;
  message_type: string;
  message_body: string;
  media?: Record<string, unknown>;
}

export interface LandingPage {
  id: number;
  title: string;
  slug: string;
  template: string;
  description?: string;
  content?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  whatsapp_number?: string;
  pre_filled_message?: string;
  is_published: boolean;
  views_count: number;
  clicks_count: number;
}

export interface WaLink {
  id: number;
  name: string;
  short_code: string;
  whatsapp_number: string;
  pre_filled_message?: string;
  clicks_count: number;
}

export interface DashboardStats {
  leads_today: number;
  messages_today: number;
  conversion_rate: number;
  active_conversations: number;
  unread_messages: number;
  active_campaigns: number;
  total_contacts: number;
}
