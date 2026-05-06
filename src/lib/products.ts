export interface Product {
  id: string;
  name: string;
  collection: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  details: string[];
  dimensions: string;
  material: string;
  finish: string;
  images: string[];
  techSpecs: any;
  installation: string[];
}

export const categories = [
  { id: 'all', name: 'All Collections' },
  { id: 'floor', name: 'Floor Tiles' },
  { id: 'wall', name: 'Wall Tiles' },
  { id: 'bathroom', name: 'Bathroom & Light Tiles' },
  { id: 'spanish', name: 'Spanish Tiles' }
];
