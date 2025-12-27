import { Field, ObjectType, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class Role {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  displayName: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  hierarchy: number;

  @Field()
  isActive: boolean;

  @Field()
  isRestricted: boolean;
}

@ObjectType()
export class Permission {
  @Field()
  role: string;

  @Field()
  resource: string;

  @Field()
  action: string;

  @Field()
  scope: string;

  @Field()
  effect: string;
}

@ObjectType()
export class UserRoleAssignment {
    @Field(() => ID)
    id: string;

    @Field(() => Int)
    userId: number;

    @Field()
    roleId: string;

    @Field(() => Role)
    role: Role;

    @Field({ nullable: true })
    scope?: string;

    @Field()
    assignedAt: Date;

    @Field({ nullable: true })
    assignedById?: number;
    
    @Field({ nullable: true })
    expiresAt?: Date;

    @Field()
    status: string;
}

@ObjectType()
export class PermissionAuditLog {
    @Field(() => ID)
    id: string;

    @Field({ nullable: true })
    actorId?: number;

    @Field()
    action: string;

    // JSONB details might need specific scalar or just stringified
    // For simplicity, returning ID or partial details
    // NestJS GQL can handle JSON scalar if configured, otherwise we'll stringify it in resolver or use simple fields
    // Let's assume we handle it or just skip details for MVP list view
    
    @Field()
    timestamp: Date;
    
    @Field({ nullable: true })
    reason?: string;
}
