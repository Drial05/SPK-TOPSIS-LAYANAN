export type Bobot = {
  id: number;
  id_criteria: number;
  min_value: number;
  max_value: number | null;
  score: number;
  criteria_name: string;
  criteria_weight: number;
  criteria_attribute: "benefit" | "cost";
};

export type GroupedBobot = {
  criteria_name: string;
  criteria_weight: number;
  criteria_attribute: "benefit" | "cost";
  children: Bobot[];
};

export type CriteriaRendemen = {
  id: number;
  name: string;
  min_value: number;
  max_value: number | null;
};

export type Production = {
  id: number;
  name: string;
  kuantum_gabah: number;
  kuantum_beras: number | null;
  rendemen: number;
};
