// src/types/index.d.ts
export interface AlternativeTopsis {
  id?: number;
  name: string;
}

export interface CriteriaTopsis {
  id: number;
  name: string;
  weight: number;
  attribute: "benefit" | "cost";
}

export interface ScoreTopsis {
  alternative_id: number;
  criteria_id: number;
  value: number;
}

export interface Ranking {
  id: number;
  alternative_id: number;
  total_score: number;
  ranking: number;
}

export interface ExportTopsisResults {
  id: number;
  alternative_id: number;
  alternative_name: string;
  total_score: number;
  ranking: number;
}
