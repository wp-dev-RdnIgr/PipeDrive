-- Pipedrive PostgreSQL Schema
-- Schema: pipedrive
-- 11 tables, 46 indexes

CREATE SCHEMA IF NOT EXISTS pipedrive;

-- ===================== REFERENCE TABLES =====================

CREATE TABLE pipedrive.users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(300),
  active BOOLEAN DEFAULT true,
  synced_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pipedrive.pipelines (
  id INTEGER PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  order_nr INTEGER,
  active BOOLEAN DEFAULT true,
  synced_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pipedrive.stages (
  id INTEGER PRIMARY KEY,
  pipeline_id INTEGER REFERENCES pipedrive.pipelines(id),
  name VARCHAR(200) NOT NULL,
  order_nr INTEGER,
  rotten_days INTEGER,
  synced_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_stages_pipeline ON pipedrive.stages(pipeline_id);

CREATE TABLE pipedrive.deal_fields (
  id INTEGER PRIMARY KEY,
  key VARCHAR(200) NOT NULL,
  name VARCHAR(300) NOT NULL,
  field_type VARCHAR(50),
  options JSONB,
  filtering_allowed BOOLEAN DEFAULT false,
  synced_at TIMESTAMP DEFAULT NOW()
);

-- ===================== DEALS (85 typed columns) =====================

CREATE TABLE pipedrive.deals (
  id INTEGER PRIMARY KEY,
  title VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  pipeline_id INTEGER REFERENCES pipedrive.pipelines(id) ON DELETE SET NULL,
  stage_id INTEGER REFERENCES pipedrive.stages(id) ON DELETE SET NULL,
  stage_order_nr INTEGER,
  owner_id INTEGER REFERENCES pipedrive.users(id) ON DELETE SET NULL,
  owner_name VARCHAR(200),
  creator_id INTEGER,
  creator_name VARCHAR(200),
  person_id_raw JSONB,
  person_name VARCHAR(300),
  org_id_raw JSONB,
  org_name VARCHAR(300),
  value NUMERIC(15,2),
  currency VARCHAR(10) DEFAULT 'UAH',
  weighted_value NUMERIC(15,2),
  weighted_value_currency VARCHAR(10),
  formatted_value VARCHAR(50),
  formatted_weighted_value VARCHAR(50),
  probability INTEGER,
  label VARCHAR(50),
  lost_reason VARCHAR(300),
  visible_to VARCHAR(10),
  add_time TIMESTAMP,
  update_time TIMESTAMP,
  stage_change_time TIMESTAMP,
  close_time TIMESTAMP,
  won_time TIMESTAMP,
  first_won_time TIMESTAMP,
  lost_time TIMESTAMP,
  expected_close_date DATE,
  next_activity_date DATE,
  next_activity_time VARCHAR(20),
  next_activity_id INTEGER,
  next_activity_subject VARCHAR(500),
  next_activity_type VARCHAR(100),
  next_activity_duration VARCHAR(20),
  next_activity_note TEXT,
  last_activity_date DATE,
  last_activity_id INTEGER,
  last_incoming_mail_time TIMESTAMP,
  last_outgoing_mail_time TIMESTAMP,
  cc_email VARCHAR(300),
  activities_count INTEGER DEFAULT 0,
  done_activities_count INTEGER DEFAULT 0,
  undone_activities_count INTEGER DEFAULT 0,
  email_messages_count INTEGER DEFAULT 0,
  files_count INTEGER DEFAULT 0,
  notes_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  participants_count INTEGER DEFAULT 0,
  products_count INTEGER DEFAULT 0,
  active BOOLEAN,
  deleted BOOLEAN,
  is_archived BOOLEAN,
  archive_time TIMESTAMP,
  person_hidden BOOLEAN,
  org_hidden BOOLEAN,
  origin VARCHAR(50),
  origin_id VARCHAR(100),
  channel VARCHAR(100),
  channel_id VARCHAR(100),
  sequence_enrollment VARCHAR(200),
  source_lead_id VARCHAR(100),
  rotten_time TIMESTAMP,
  local_won_date DATE,
  local_lost_date DATE,
  local_close_date DATE,
  mrr NUMERIC(15,2),
  mrr_currency VARCHAR(10),
  arr NUMERIC(15,2),
  arr_currency VARCHAR(10),
  acv NUMERIC(15,2),
  acv_currency VARCHAR(10),
  product_name VARCHAR(300),
  product_amount NUMERIC(15,2),
  product_quantity NUMERIC(15,2),
  -- Custom fields (readable aliases)
  c_project_name VARCHAR(500),
  c_lead_quality VARCHAR(50),
  c_client_position VARCHAR(50),
  c_tender_date DATE,
  c_control_date DATE,
  c_comment TEXT,
  c_expected_tender DATE,
  c_contact_date DATE,
  c_site_name VARCHAR(500),
  c_utm VARCHAR(500),
  c_source_form VARCHAR(200),
  c_transferred_cold VARCHAR(50),
  c_utm_source VARCHAR(500),
  c_utm_medium VARCHAR(500),
  c_utm_campaign VARCHAR(500),
  c_utm_term VARCHAR(500),
  c_utm_content VARCHAR(500),
  c_tech_field VARCHAR(50),
  c_site_page VARCHAR(1000),
  c_quality_date DATE,
  c_phone_webpromo VARCHAR(100),
  c_processed VARCHAR(50),
  c_kp_link VARCHAR(1000),
  c_kp_specialist JSONB,
  c_loss_comment TEXT,
  synced_at TIMESTAMP DEFAULT NOW()
);

-- Deals indexes (15)
CREATE INDEX idx_deals_status ON pipedrive.deals(status);
CREATE INDEX idx_deals_pipeline ON pipedrive.deals(pipeline_id);
CREATE INDEX idx_deals_stage ON pipedrive.deals(stage_id);
CREATE INDEX idx_deals_owner ON pipedrive.deals(owner_id);
CREATE INDEX idx_deals_owner_name ON pipedrive.deals(owner_name);
CREATE INDEX idx_deals_add_time ON pipedrive.deals(add_time);
CREATE INDEX idx_deals_update_time ON pipedrive.deals(update_time);
CREATE INDEX idx_deals_value ON pipedrive.deals(value);
CREATE INDEX idx_deals_label ON pipedrive.deals(label);
CREATE INDEX idx_deals_lead_quality ON pipedrive.deals(c_lead_quality);
CREATE INDEX idx_deals_pipeline_status ON pipedrive.deals(pipeline_id, status);
CREATE INDEX idx_deals_pipeline_stage ON pipedrive.deals(pipeline_id, stage_id);
CREATE INDEX idx_deals_status_add_time ON pipedrive.deals(status, add_time);
CREATE INDEX idx_deals_owner_status ON pipedrive.deals(owner_id, status);
CREATE INDEX idx_deals_synced ON pipedrive.deals(synced_at);

-- ===================== PERSONS (39 columns) =====================

CREATE TABLE pipedrive.persons (
  id INTEGER PRIMARY KEY,
  name VARCHAR(300),
  first_name VARCHAR(200),
  last_name VARCHAR(200),
  owner_id INTEGER,
  owner_name VARCHAR(200),
  org_id INTEGER,
  org_name VARCHAR(300),
  email JSONB,
  phone JSONB,
  primary_email VARCHAR(300),
  job_title VARCHAR(300),
  birthday DATE,
  label VARCHAR(50),
  visible_to VARCHAR(10),
  active_flag BOOLEAN DEFAULT true,
  add_time TIMESTAMP,
  update_time TIMESTAMP,
  delete_time TIMESTAMP,
  cc_email VARCHAR(300),
  open_deals_count INTEGER DEFAULT 0,
  closed_deals_count INTEGER DEFAULT 0,
  won_deals_count INTEGER DEFAULT 0,
  lost_deals_count INTEGER DEFAULT 0,
  activities_count INTEGER DEFAULT 0,
  done_activities_count INTEGER DEFAULT 0,
  undone_activities_count INTEGER DEFAULT 0,
  email_messages_count INTEGER DEFAULT 0,
  files_count INTEGER DEFAULT 0,
  notes_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  last_activity_id INTEGER,
  last_activity_date DATE,
  next_activity_id INTEGER,
  next_activity_date DATE,
  last_incoming_mail_time TIMESTAMP,
  last_outgoing_mail_time TIMESTAMP,
  custom_fields JSONB,
  synced_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_persons_owner ON pipedrive.persons(owner_id);
CREATE INDEX idx_persons_org ON pipedrive.persons(org_id);
CREATE INDEX idx_persons_name ON pipedrive.persons(name);
CREATE INDEX idx_persons_add_time ON pipedrive.persons(add_time);
CREATE INDEX idx_persons_active ON pipedrive.persons(active_flag);
CREATE INDEX idx_persons_email ON pipedrive.persons USING gin(email);
CREATE INDEX idx_persons_phone ON pipedrive.persons USING gin(phone);

-- ===================== ORGANIZATIONS (53 columns) =====================

CREATE TABLE pipedrive.organizations (
  id INTEGER PRIMARY KEY,
  name VARCHAR(500),
  owner_id INTEGER,
  owner_name VARCHAR(200),
  people_count INTEGER DEFAULT 0,
  active_flag BOOLEAN DEFAULT true,
  visible_to VARCHAR(10),
  label INTEGER,
  address VARCHAR(500),
  address_formatted_address VARCHAR(500),
  address_route VARCHAR(300),
  address_street_number VARCHAR(50),
  address_locality VARCHAR(200),
  address_postal_code VARCHAR(20),
  address_country VARCHAR(100),
  address_country_code VARCHAR(10),
  address_admin_area_level_1 VARCHAR(200),
  address_admin_area_level_2 VARCHAR(200),
  address_sublocality VARCHAR(200),
  address_subpremise VARCHAR(100),
  cc_email VARCHAR(300),
  company_id INTEGER,
  first_char VARCHAR(5),
  add_time TIMESTAMP,
  update_time TIMESTAMP,
  delete_time TIMESTAMP,
  open_deals_count INTEGER DEFAULT 0,
  closed_deals_count INTEGER DEFAULT 0,
  won_deals_count INTEGER DEFAULT 0,
  lost_deals_count INTEGER DEFAULT 0,
  related_open_deals_count INTEGER DEFAULT 0,
  related_closed_deals_count INTEGER DEFAULT 0,
  related_won_deals_count INTEGER DEFAULT 0,
  related_lost_deals_count INTEGER DEFAULT 0,
  activities_count INTEGER DEFAULT 0,
  done_activities_count INTEGER DEFAULT 0,
  undone_activities_count INTEGER DEFAULT 0,
  email_messages_count INTEGER DEFAULT 0,
  files_count INTEGER DEFAULT 0,
  notes_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  last_activity_id INTEGER,
  last_activity_date DATE,
  next_activity_id INTEGER,
  next_activity_date DATE,
  next_activity_time VARCHAR(20),
  website VARCHAR(500),
  linkedin VARCHAR(500),
  industry VARCHAR(300),
  employee_count VARCHAR(50),
  annual_revenue VARCHAR(100),
  custom_fields JSONB,
  synced_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orgs_owner ON pipedrive.organizations(owner_id);
CREATE INDEX idx_orgs_name ON pipedrive.organizations(name);
CREATE INDEX idx_orgs_add_time ON pipedrive.organizations(add_time);
CREATE INDEX idx_orgs_active ON pipedrive.organizations(active_flag);
CREATE INDEX idx_orgs_country ON pipedrive.organizations(address_country);

-- ===================== ACTIVITIES (54 columns) =====================

CREATE TABLE pipedrive.activities (
  id INTEGER PRIMARY KEY,
  type VARCHAR(100),
  type_name VARCHAR(200),
  subject VARCHAR(500),
  done BOOLEAN DEFAULT false,
  due_date DATE,
  due_time VARCHAR(20),
  duration VARCHAR(20),
  busy_flag BOOLEAN,
  add_time TIMESTAMP,
  update_time TIMESTAMP,
  marked_as_done_time TIMESTAMP,
  deal_id INTEGER,
  deal_title VARCHAR(500),
  person_id INTEGER,
  person_name VARCHAR(300),
  org_id INTEGER,
  org_name VARCHAR(300),
  user_id INTEGER,
  owner_name VARCHAR(200),
  assigned_to_user_id INTEGER,
  created_by_user_id INTEGER,
  company_id INTEGER,
  lead_id VARCHAR(100),
  lead_title VARCHAR(300),
  note TEXT,
  public_description TEXT,
  location VARCHAR(500),
  location_formatted_address VARCHAR(500),
  location_locality VARCHAR(200),
  location_country VARCHAR(100),
  private BOOLEAN DEFAULT false,
  active_flag BOOLEAN DEFAULT true,
  priority VARCHAR(20),
  attendees JSONB,
  participants JSONB,
  conference_meeting_client VARCHAR(200),
  conference_meeting_url VARCHAR(500),
  conference_meeting_id VARCHAR(200),
  is_recurring BOOLEAN,
  rec_rule VARCHAR(200),
  rec_master_activity_id INTEGER,
  series JSONB,
  original_start_time TIMESTAMP,
  source_timezone VARCHAR(100),
  reference_type VARCHAR(100),
  reference_id INTEGER,
  notification_language_id INTEGER,
  last_notification_time TIMESTAMP,
  last_notification_user_id INTEGER,
  deal_dropbox_bcc VARCHAR(300),
  person_dropbox_bcc VARCHAR(300),
  calendar_sync_include_context VARCHAR(200),
  synced_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_act_deal ON pipedrive.activities(deal_id);
CREATE INDEX idx_act_person ON pipedrive.activities(person_id);
CREATE INDEX idx_act_org ON pipedrive.activities(org_id);
CREATE INDEX idx_act_user ON pipedrive.activities(user_id);
CREATE INDEX idx_act_assigned ON pipedrive.activities(assigned_to_user_id);
CREATE INDEX idx_act_type ON pipedrive.activities(type);
CREATE INDEX idx_act_done ON pipedrive.activities(done);
CREATE INDEX idx_act_due_date ON pipedrive.activities(due_date);
CREATE INDEX idx_act_add_time ON pipedrive.activities(add_time);
CREATE INDEX idx_act_deal_done ON pipedrive.activities(deal_id, done);

-- ===================== PRODUCTS (19 columns) =====================

CREATE TABLE pipedrive.products (
  id INTEGER PRIMARY KEY,
  name VARCHAR(500),
  code VARCHAR(100),
  description TEXT,
  unit VARCHAR(50),
  tax NUMERIC(10,2),
  category VARCHAR(200),
  active_flag BOOLEAN DEFAULT true,
  selectable BOOLEAN DEFAULT true,
  visible_to VARCHAR(10),
  owner_id INTEGER,
  prices JSONB,
  product_variations JSONB,
  files_count INTEGER DEFAULT 0,
  add_time TIMESTAMP,
  update_time TIMESTAMP,
  billing_frequency VARCHAR(50),
  billing_frequency_cycles INTEGER,
  synced_at TIMESTAMP DEFAULT NOW()
);

-- ===================== NOTES (17 columns) =====================

CREATE TABLE pipedrive.notes (
  id INTEGER PRIMARY KEY,
  content TEXT,
  user_id INTEGER,
  user_name VARCHAR(200),
  deal_id INTEGER,
  person_id INTEGER,
  org_id INTEGER,
  lead_id VARCHAR(100),
  active_flag BOOLEAN DEFAULT true,
  add_time TIMESTAMP,
  update_time TIMESTAMP,
  last_update_user_id INTEGER,
  pinned_to_deal_flag BOOLEAN DEFAULT false,
  pinned_to_person_flag BOOLEAN DEFAULT false,
  pinned_to_organization_flag BOOLEAN DEFAULT false,
  pinned_to_lead_flag BOOLEAN DEFAULT false,
  synced_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notes_deal ON pipedrive.notes(deal_id);
CREATE INDEX idx_notes_person ON pipedrive.notes(person_id);
CREATE INDEX idx_notes_org ON pipedrive.notes(org_id);
CREATE INDEX idx_notes_user ON pipedrive.notes(user_id);
CREATE INDEX idx_notes_add_time ON pipedrive.notes(add_time);
CREATE INDEX idx_notes_content ON pipedrive.notes USING gin(to_tsvector('simple', content));

-- ===================== SYNC LOG =====================

CREATE TABLE pipedrive.sync_log (
  id SERIAL PRIMARY KEY,
  action VARCHAR(50),
  date_from DATE,
  date_to DATE,
  deals_count INTEGER,
  duration_ms INTEGER,
  api_markers_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
