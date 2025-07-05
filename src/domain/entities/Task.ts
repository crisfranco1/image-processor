export interface Task {
  taskId?: string;
  status: 'pending' | 'completed' | 'failed';
  price: number;
  images: {
    resolution: string;
    path: string;
  }[];
}