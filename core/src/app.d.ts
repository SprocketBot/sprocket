declare global {
  namespace Express {
    export interface User {
      username: string;
    }
  }
}

export {};
