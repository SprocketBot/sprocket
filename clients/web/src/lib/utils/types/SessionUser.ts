export interface SessionUser {
  userId: number;
  username: string;
  currentOrganizationId: number;
  orgTeams: number[];
}
