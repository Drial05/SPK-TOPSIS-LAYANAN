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

export interface BobotTopsis {
  id: number;
  id_criteria: number;
  min_value: number;
  max_value: number | null;
  score: number;
  criteria_name?: string;
  criteria_weight?: number;
  criteria_attribute?: "benefit" | "cost";
}

export interface CriteriaRendemen {
  id: number;
  name: string;
  min_value: number;
  max_value: number;
}

export interface Production {
  id: number;
  name: string;
  kuantum_gabah: number;
  kuantum_beras: number;
  rendemen: number;
}

export interface ScoreTopsis {
  id: number;
  alternative_id: number;
  alternative_name: string;
  criteria_id: number;
  criteria_name: string;
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
