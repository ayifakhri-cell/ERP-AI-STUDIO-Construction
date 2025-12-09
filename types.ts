// Invoice Extraction Types
export interface InvoiceData {
  invoice_id: string | null;
  vendor_name: string | null;
  date_issued: string | null;
  total_amount: number | null;
  currency: string | null;
  suggested_gl_account: string | null;
  confidence_score: number; // 0.0 to 1.0
  line_items_count?: number;
}

// BIM Data Types
export interface BimElement {
  id: string;
  category: 'Structural Columns' | 'Walls' | 'Beams' | 'Slabs' | 'Windows';
  material: 'Concrete' | 'Steel' | 'Glass' | 'Brick';
  volume: number; // m3
  length: number; // m
  level: string;
}

// Risk Analysis Types
export interface RiskAnalysisResult {
  projectId: string;
  currentSpend: number;
  riskProbability: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  reasoning: string;
}

// Compliance Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isGrounded?: boolean;
}
