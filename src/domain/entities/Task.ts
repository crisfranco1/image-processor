export interface Image {
  resolution: string;
  path: string;
}

export interface Task {
  taskId?: string;
  status?: 'pending' | 'completed' | 'failed';
  price?: number;
  createdAt?: Date;
  updatedAt?: Date;
  originalPath?: string;
  images?: Image[];
}