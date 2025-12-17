export interface PrinterSettings {
    uuid: string;
    business_uuid: string;
    paper_width_mm: number;
    chars_per_line: number;
    encoding: string;
    feed_lines: number | null;
    cut_enabled: boolean | null;
    created_at?: string;
    updated_at?: string;
}

export interface CreatePrinterSettingsRequest {
    paper_width_mm: number;
    chars_per_line: number;
    encoding: string;
    feed_lines?: number;
    cut_enabled?: boolean;
}

export interface UpdatePrinterSettingsRequest {
    paper_width_mm?: number;
    chars_per_line?: number;
    encoding?: string;
    feed_lines?: number;
    cut_enabled?: boolean;
}
