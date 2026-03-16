export interface IActivities {
  id: number;
  title: string;
  description: string;
  job: number;
  created: string;
}

export enum JobStatus {
  NOT_STARTED = "Not Started",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
}

export interface Job {
  id: number;
  title: string;
  description: string;
  customer: string;
  address: string;
  time: string;
  status: JobStatus;
  priority: "High" | "Medium" | "Low";
  timeSlot?: string;
  preferedDate?: string;
  startDate: string;
  endDate: string;
  customerRating: number;
  customerFeedback: string;
  customerId: string;
  firstName: string;
  lastName: string;
  city: string;
  contactNo: string;
  contactEmail: string;
  address1: string;
  address2: string;
  signatureUrl?: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  time: string;
}

export interface PerformanceStats {
  period: string;
  completed: number;
  rating: number;
}

export interface INotification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: "success" | "warning" | "error" | "info";
  isRead: boolean;
}
