export interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  role: "Admin" | "Manager" | "Staff" | "Warehouse";
  status: "Active" | "Inactive";
  joinedDate: string;
  avatar?: string;
}
