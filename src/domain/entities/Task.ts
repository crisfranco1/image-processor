export interface Task {
  taskId?: string;
  status?: 'pending' | 'completed' | 'failed';
  price?: number;
  createdAt?: Date;
  updatedAt?: Date;
  originalPath?: string;
  images?: {
    resolution: string;
    path: string;
  }[];
}