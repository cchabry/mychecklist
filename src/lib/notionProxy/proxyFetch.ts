
// Since we can't access the full file, I'll create a function to properly extend Error
// This should be added to the file wherever the error with status is created

// Custom error class with status property
export class NotionError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'NotionError';
    this.status = status;
  }
}

// Use this function instead of creating a plain Error with status property
export function createNotionError(message: string, status?: number): NotionError {
  return new NotionError(message, status);
}
