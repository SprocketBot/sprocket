Given a policy definition:
```
p = subject, object, action, scope, effect
```

Where `scope` can be `all` or `own`
Where `effect` can be `allow` or `deny`

We can have some declared policies:

```
p, franchise_manager, franchise, manage_roster, own, allow
p, team_captain, team, manage_roster, own, allow
p, league_operations, franchise, manage_roster, all, allow

g, pete, franchise_manager
g, jack, team_captain
g, adam, team_captain
g, sally, league_operations
```

We have some knowledge from the database:
`pete` and `jack` are both on the `Jets`
`jack` is in `Academy League`, and is the captain for `Academy League`
`adam` is in `Master League`, but is the captain for `Champion League`