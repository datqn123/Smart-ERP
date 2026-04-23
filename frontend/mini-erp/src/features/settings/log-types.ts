export interface SystemLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;      // e.g., Create, Update, Delete
  module: string;      // e.g., Products, Orders
  description: string;
  severity: "Info" | "Warning" | "Error";
  ipAddress: string;
}
