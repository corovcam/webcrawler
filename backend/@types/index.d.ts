export interface WebsiteRecordDB {
  record_id: number;
  url: string;
  boundary_regexp: string;
  periodicity: number;
  label: string;
  is_active: boolean;
  is_being_crawled: boolean;
  tags: string[] | string;
  crawled_data: string;
  request_do_crawl: boolean;
}

export interface ExecutionDB {
  execution_id: number;
  status: boolean;
  start_time: string;
  end_time: string;
  sites_crawled_count: number;
  record_id: number;
}

export interface WebNode {
  url: string;
  title: string;
  crawlTime: number;
  wasCrawled: boolean;
  executionId: number;
  nodes: WebNode[];
}

export interface AddRecordResponse {
  recordId: number;
  message: string;
}
