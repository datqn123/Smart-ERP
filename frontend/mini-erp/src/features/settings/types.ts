export interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  role: "Admin" | "Staff";
  status: "Active" | "Inactive";
  joinedDate: string;
  avatar?: string;
}
