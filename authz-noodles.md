# Sprocket AuthZ

## The Before

Sprocket v1 (here-by _legacy_) had a verbose schema for impelementing Authorization, but it was never fully realized.
The basis was _action_ based access control, where a _user_ could recieve _permission_ from a variety of sources.
The actions were never flushed out, and does not give us much to start with when doing a redesign, but the concept of
where permissions came from remains sound (imo)

In theory (because this was not implemented):

- The "Franchise Manager" "`FranchiseLeadershipRole`" could be created, with the permission to `ManageRoster`
- The "Team Captain" "`FranchiseStaffRole`" with the permission to `ManageRoster`

Some user `shuckle` could be a `Franchise Manager` (by the assignment of a `FranchiseLeadershipSeat`), and
would then be able to manage the roster for their Franchise

Some user `Nigel` could be a `Team Captain` (by the assignment of a `FranchiseStaffSeat`), and would then
be able to manage the roster for their Team

The context of the action could potentially be inferred from where the permission comes from,  
e.g.

1. Nigel is the Team Captain of the Grasshoppers Pro League Rocket league Team
   1. Nigel attempts to roster HardFault, a Pro League Rocket League player without a team
      1. We check that the roster is valid (e.g. skill league, game, and not currently rostered)
      2. We check that Nigel has permissions to manage the destination Roster
      3. This passes
   2. Nigel attempts to roster Zach, an Amateur League Rocket League player without a team
      1. The Grasshoppers do have a roster slot available in that league / game
      2. Nigel does not have permission to manage the destination Roster
      3. This fails

## The After

Sprocket v2 aims to reduce the complexity (or at least make it easier to deal with) compared to legacy Sprocket.
This means that the Authz model taken by v2 should satisfy this goal of being easy for newer developers, while 
still retaining the flexibility / power to accomodate the evolving needs of MLE

To that end, `casbin`, an authz library has been brought in, which defines a model, and executes policies against it. It primarily supports RBAC, but it does allow for dynamic roles.

The complexity now comes from creating the correct model, and the correct items to include in that model.

An example:
```conf
[request_definition]
r = subject, object, action, scope

[policy_definition]
p = subject, object, action, scope, effect

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.effect == allow)) && !some(where (p.effect == deny))

[matchers]
m = r.object == p.object && r.action == p.action && g(r.subject, p.subject) && r.scope == p.scope
```

This policy authorizes based on a `subject` (e.g. the user's ID), an `object` (e.g. `FRANCHISE`), `action` (e.g. `MANAGER_ROSTER`), `scope` (e.g. `OWN_ROSTER`) and `effect` (e.g. allow/deny)

This is a flexible system, as it allows for very specific / dynamic policies:
e.g.
```
p, franchise_manager, roster, manage, OWN_FRANCHISE, allow
p, team_captain, roster, manage, OWN_TEAM, allow

g, shuckle, franchise_manager
g, Nigel, team_captain
```

The code is responsible for ensuring that the `scope` is accurate, but requests would look like this:

```
# Nigel attempts to roster HardFault (see above), determined to be OWN_TEAM scope
r, Nigel, roster, manage, OWN_TEAM # Passes

# Nigel attempts to roster Zach (see above), determined to be OWN_FRANCHISE scope
r, Nigel, roster, manage, OWN_FRANCHISE # Fails
```

## Examples

### Scheduling

Scheduling in this instance refers specifically to player availability, and finding
times in which both teams in a fixture can field a full roster.

The actions that need to be taken are:
- Default nobody can read or write schedules
- Players can see their own schedule
    - Should this be set per schedule group?
- Team leadership can see their team's detailed schedule
- Team leadership can see their opponents obfuscated schedule **during the schedule group for a fixture**
- League Operations can see all detailed schedules


#### Policy Example
```
# Default deny
p, everybody, schedule, read, all, deny
p, everybody, schedule, write, all, deny

# Allow writing their own schedule
p, everybody, schedule, read, own, allow
p, everybody, schedule, write, own, allow

# How to distinguish between details and obfuscated?
p, team_leadership, schedule, read, own_team, allow
p, team_leadership, schedule, read, opponent, allow

p, league_operations, schedule, read, all, allow
```

#### Hanging Questions
- What should the allow / deny inheritance look like
    - e.g. `everybody` is denied read-all schedule access, but `league_operations` is granted it
    - Should specificity matter? (e.g. `allow all` beats `deny all`, but `allow all` loses to `deny own`)
    - Does this change if the default to _everything_ is deny?
      - e.g. the first 2 lines of this policy are no longer relevant, and `league_operations` `read all`   
      does not conflict with anything
- How do we want to handle differing levels of detail?
    - e.g. should we have both `schedule` and `schedule:detail`?
      - If so, should `schedule:detail` default to whatever `schedule` is, unless manually specified?
      - How would we implement something like this?

### Rostering

Rostering refers to the same example as noted for `legacy` Sprocket

Actions that need to be taken:
 - Offering players a spot on the roster
 - Withdrawing an extended offer
 - Manually assigning players a roster spot (e.g. without offering)
 - Removing players from the roster

#### Policy Example
```
p, player, roster:offer, accept, own, allow

p, franchise_leadership, roster:offer, create, own_franchise, allow # Make Offer
p, franchise_leadership, roster:offer, delete, own_franchise, allow # Withdraw Offer
p, franchise_leadership, roster:spot, delete, own_franchise, allow # Remove Player

p, team_leadership, roster:offer, create, own_team, allow # Make Offer
p, team_leadership, roster:offer, delete, own_team, allow # Withdraw offer
p, team_leadership, roster:spot, delete, own_team, allow # Remove Player

p, league_operations, roster:spot, create, all, allow
p, league_operations, roster:spot, delete, all, allow
```

### Scrims

Scrims are a complex topic, because of the management stories involved  
Note that the replay submission / ratification process is not covered here, instead it is in [submissions](#submissions)

Actions that need to be taken:
- Participate in scrims
- Listing scrims w/o detailed information
    - e.g. when looking for scrims to join
- Listing scrims w/ detailed information
    - e.g. when managing scrims
- Listing scrim participation metrics
- Cancelling a scrim
- Manually modifying a scrim's state
    - This may not be something we actually want to support
- Applying a scrim ban to a player

#### Policy Example

```
p, player, scrim, participate, own_skill_group, allow
p, player, scrim, read, own_skill_group, allow
p, player, scrim:metrics, read, all, allow

p, support, scrim, read, all, allow
p, support, scrim, read, all, allow

# Read all scrim details except their own
p, support, scrim:detail, read, all, allow
p, support, scrim:detail, read, own, deny

p, admin, scrim, read, all, allow

# Read all scrim details including their own
p, admin, scrim:detail, read, all, allow
```

### Submissions

# Additional stories to write:
> Do all of these actually live in AuthZ or are some of these just basic application flows?  
> What level of configurability do we actually care about here?  
> Can these be reduced into the default application state, and then an AuthZ action to override it?

- Scheduling
    - By default nobody can see any schedules
    - Each player can see their own schedule
    - Team leadership (incl. franchise) can see their team's whole schedule
    - Team leadership (incl. franchise) can see their opponents schedule **during a fixture**
    - League Operations can always ee everybody's schedule

- Scrims
    - Players can view basic metadata about all scrims
        - Mode, Stage, Number of Players
    - Players can view detailed information about their own scrim
        - Specific players (post-pop only)
    - Support can view details about all scrims _except their own_
    - Admins can view details about all scrims _including their own_

- Submissions
    - Everybody can see the submission status of all submissions
    - Team leadership can create submissions for their team's fixtures
    - Team leadership can ratify submissions they did not create for their team's fixtures
    - Players can create submissions for their current scrim
    - Players can ratify submissions they did not create for their current scrim
    - League Operations, Support, Admins can reset submissions