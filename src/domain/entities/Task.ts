export interface Task {
  id?: string;
  status: 'pending' | 'completed' | 'failed'; // Using a union type for status
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
  originalPath: string;
  images: {
    resolution: string;
    path: string;
  }[];
}