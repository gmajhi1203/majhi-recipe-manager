
export enum Department {
  FOOD = 'Food',
  LIQUOR = 'Liquor',
  CRAFTBEER = 'Craftbeer',
  SOFTDRINKS = 'Soft Drinks',
  OTHER = 'Other'
}

export enum UOM {
  KG = 'KG',
  GM = 'GM',
  LTR = 'LTR',
  ML = 'ML',
  PCS = 'PCS',
  PKT = 'PKT',
  BOX = 'BOX'
}

export interface Item {
  id: string;
  itemCode: string;
  itemName: string;
  brandName: string;
  packagingSize: number;
  uom: UOM;
  netContent: number;
  pricePerPackage: number;
  yieldPercent: number; // Raw material usable percentage
}

export interface MenuItem {
  id: string;
  menuCode: string;
  menuName: string;
  department: Department;
  portionSize: string;
  sellingPrice: number;
  yieldPercent: number; // Recipe processing yield
  isBaseRecipe: boolean;
}

export interface RecipeIngredient {
  id: string; // Refers to Item.id or MenuItem.id (if base recipe)
  type: 'item' | 'base_recipe';
  quantity: number;
}

export interface Recipe {
  menuItemId: string;
  ingredients: RecipeIngredient[];
}
