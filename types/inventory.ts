export interface InventoryItem {
    _id: string;
    name: string;
    description: string;
    category: string;
    quantity: number;
    minQuantity: number;
    unit: string;
    location: string;
    status: string;
    condition: string;
  }