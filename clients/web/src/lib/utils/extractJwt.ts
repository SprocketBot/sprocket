export const extractJwt = <T>(rawToken: string): T => JSON.parse(atob(rawToken.split('.')[1])) as T;
