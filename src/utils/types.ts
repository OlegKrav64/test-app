export type ISODateString = string;

export interface Coordinates {
  x: number;
  y: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface SelectedPin {
  id: string;
  type: "task";
}
