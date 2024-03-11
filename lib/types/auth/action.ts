export enum AuthAction {
  Read = 'read',
  Write = 'write',
  Admin = 'admin',
}
export const toAuthAction = (x: string): AuthAction | null => {
  const entry = Object.entries(AuthAction).find(([, v]) => v === x);
  return entry[1] ?? null;
};

export const AuthActionImplicits: Record<AuthAction, AuthAction[]> = {
  [AuthAction.Read]: [],
  [AuthAction.Write]: [AuthAction.Read],
  [AuthAction.Admin]: [AuthAction.Write, AuthAction.Read],
};
