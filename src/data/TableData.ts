export interface TableData {
    id: number;
    name?: string;
    code?: string;
    size_name?: string;
    description?: string;
    style_name?: string;
    operation_name?: string;
    machine_type?: string;
    defect_name?: string;
    updated_at: string;
    created_at: string;
  }
  
  export const colorData: TableData[] = [
    { id: 1, name: "Red", code: "#FF0000", updated_at: "2025-03-01", created_at: "2025-02-25" },
    { id: 2, name: "Green", code: "#00FF00", updated_at: "2025-03-02", created_at: "2025-02-26" },
    { id: 3, name: "Blue", code: "#0000FF", updated_at: "2025-03-03", created_at: "2025-02-27" }
  ];
  
  export const sizeData: TableData[] = [
    { id: 1, size_name: "Small", description: "Small size", updated_at: "2025-03-01", created_at: "2025-02-25" },
    { id: 2, size_name: "Medium", description: "Medium size", updated_at: "2025-03-02", created_at: "2025-02-26" },
    { id: 3, size_name: "Large", description: "Large size", updated_at: "2025-03-03", created_at: "2025-02-27" }
  ];
  
  export const styleData: TableData[] = [
    { id: 1, style_name: "Casual", description: "Casual wear", updated_at: "2025-03-01", created_at: "2025-02-25" },
    { id: 2, style_name: "Formal", description: "Formal wear", updated_at: "2025-03-02", created_at: "2025-02-26" },
    { id: 3, style_name: "Sports", description: "Sportswear", updated_at: "2025-03-03", created_at: "2025-02-27" }
  ];
  
  export const operationData: TableData[] = [
    { id: 1, operation_name: "Stitching", machine_type: "Sewing Machine", updated_at: "2025-03-01", created_at: "2025-02-25" },
    { id: 2, operation_name: "Cutting", machine_type: "Cutting Machine", updated_at: "2025-03-02", created_at: "2025-02-26" },
    { id: 3, operation_name: "Packing", machine_type: "Manual", updated_at: "2025-03-03", created_at: "2025-02-27" }
  ];
  
  export const defectData: TableData[] = [
    { id: 1, defect_name: "Loose Stitch", description: "Stitch is not tight", updated_at: "2025-03-01", created_at: "2025-02-25" },
    { id: 2, defect_name: "Color Mismatch", description: "Different color shade", updated_at: "2025-03-02", created_at: "2025-02-26" },
    { id: 3, defect_name: "Broken Button", description: "Button is broken", updated_at: "2025-03-03", created_at: "2025-02-27" }
  ];
  