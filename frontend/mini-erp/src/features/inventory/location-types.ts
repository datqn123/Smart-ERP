export interface WarehouseLocation {
  id: number;
  locationCode: string; // e.g., AREA-A-01
  area: string;       // e.g., Area A
  shelf: string;      // e.g., Shelf 01
  capacity: number;   // max items
  currentStock: number;
  status: "Active" | "Full" | "Inactive";
  description?: string;
}
