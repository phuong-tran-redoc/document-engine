/**
 * Dynamic Field interface
 */
export interface DynamicFieldItem {
  id: string;
  label: string;
  description?: string;
}

export interface DynamicFieldCategory {
  key: string;
  label: string;
  description?: string;
  fields: DynamicFieldItem[];
}

