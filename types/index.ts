export type QuestionType = "rating" | "short_text" | "paragraph" | "multiple_choice";

export interface QuestionOption {
  id: string;
  option_text: string;
  display_order: number;
}

export interface QuestionVersion {
  id: string;
  version: number;
  question_text: string;
  question_type: QuestionType;
  configuration: Record<string, unknown> | null;
  options: QuestionOption[];
}

export interface Question {
  id: string;
  section_id: string | null;
  section_title: string | null;
  question_type: QuestionType;
  display_order: number;
  required: boolean;
  active: boolean;
  include_in_overall_score: boolean;
  retired_at: string | null;
  current_version: QuestionVersion | null;
}

export interface Section {
  id: string;
  title: string;
  display_order: number;
  active: boolean;
  questions: Question[];
}

export interface PublicSettings {
  form_name: string;
  form_description: string;
  accept_responses: boolean;
  show_thank_you: boolean;
  thank_you_message: string;
}

export interface RobotInfo {
  id: string;
  name: string;
  robot_code: string;
  robot_version: string;
  location: { id: string; name: string; code: string };
}

export interface AnswerInput {
  question_id: string;
  question_version_id: string;
  rating_value?: number;
  text_value?: string;
  selected_option_id?: string;
}

// Admin types
export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface StarBucket {
  star: number;
  count: number;
  percent: number;
}

export interface QuestionSummary {
  question_id: string;
  question_text: string;
  question_type: QuestionType;
  average: number | null;
  response_count: number;
  distribution: StarBucket[];
  needs_attention: boolean;
  text_samples: string[];
}

export interface OverallSummary {
  total_responses: number;
  overall_average: number | null;
  overall_distribution: StarBucket[];
  question_summaries: QuestionSummary[];
}

export interface AnswerOut {
  id: string;
  question_id: string;
  question_version_id: string;
  question_text: string;
  question_type: QuestionType;
  rating_value: number | null;
  text_value: string | null;
  selected_option_text: string | null;
}

export interface IndividualResponse {
  id: string;
  submitted_at: string;
  robot_name: string;
  robot_code: string;
  robot_version: string;
  location_name: string;
  answers: AnswerOut[];
}

export interface PaginatedResponses {
  total: number;
  page: number;
  page_size: number;
  items: IndividualResponse[];
}

export interface AppSettings {
  id: number;
  form_name: string;
  form_description: string;
  accept_responses: boolean;
  allow_multiple_submissions: boolean;
  show_thank_you: boolean;
  thank_you_message: string;
  rating_scale: number;
  rating_display: string;
  needs_attention_threshold: number;
  store_submission_timestamp: boolean;
  audit_logging_enabled: boolean;
  updated_at: string;
  // Admin role permissions
  perm_view_responses: boolean;
  perm_export_responses: boolean;
  perm_view_questions: boolean;
  perm_add_edit_questions: boolean;
  perm_retire_questions: boolean;
  perm_reorder_questions: boolean;
  perm_manage_categories: boolean;
  perm_change_settings: boolean;
  perm_view_audit_log: boolean;
  perm_view_robots_locations: boolean;
}

export interface AuditLogEntry {
  id: string;
  admin_user_id: string | null;
  admin_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface Robot {
  id: string;
  name: string;
  robot_code: string;
  location_id: string;
  location_name: string;
  active: boolean;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  active: boolean;
}
