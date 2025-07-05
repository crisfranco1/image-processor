export interface Task {
  id?: string;
  status: 'pending' | 'completed' | 'failed';
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
  originalPath: string;
  images: {
    resolution: string;
    path: string;
  }[];
}