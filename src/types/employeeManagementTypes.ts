export interface Employee {
  id?: string;
  firstName: string;
  lastName: string;
  job_title: string;
  department: string;
  email: string;
  phone: string;
}

export const departments = ["IT", "HR & Finance", "Maintenance"] as const;
export const job_title = ["Fullstack Intern", "Frontend Developer"] as const;