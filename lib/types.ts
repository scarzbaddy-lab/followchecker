export type CarPart = {
  id: number;
  part_number: string;
  name: string;
  description: string | null;
  manufacturer: string | null;
  compatible_models: string[];
};
