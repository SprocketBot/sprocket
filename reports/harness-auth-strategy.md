# Harness Auth Strategy

Updated: March 12, 2026

## Question

How should the release harness authenticate against hosted environments without depending on a human admin bearer token that expires every few hours?

## Recommendation

Do **not** make a human admin access token the steady-state solution.

Use this in stages:

1. **Immediate bridge**: support admin refresh-token based auth for local operators
2. **Near-term target**: create a dedicated internal harness operator identity
3. **Best steady state**: exchange a long-lived machine secret for short-lived scoped harness tokens

## Why Human Admin Access Tokens Are the Wrong Primitive

They are bad for harness automation because they are:

- short-lived,
- tied to a specific person,
- easy to forget to refresh,
- hard to rotate cleanly,
- and operationally ambiguous when used by multiple people.

They are acceptable only as a bootstrap mechanism.

## Stage 1: Practical Bridge

The fastest usable improvement is:

- stop requiring `HARNESS_ADMIN_BEARER_TOKEN`
- allow `HARNESS_ADMIN_REFRESH_TOKEN`
- have the harness mint a fresh access token automatically by calling `/refresh`

This changes the manual burden from:

- every run

to:

- roughly once per refresh-token lifetime

Based on the current code, that appears to be around 7 days rather than a few hours.

This is still not ideal, but it is much better than per-run manual refresh.

## Stage 2: Dedicated Harness Operator

Create a dedicated internal Sprocket account for harness execution.

Properties:

- not a personal identity
- not used for day-to-day product access
- granted only the permissions needed for harness execution
- allowed to impersonate or mint short-lived user test tokens if necessary

Then store only that account's refresh token or machine secret in the operator's local secret manager or in managed secrets for CI.

This is the minimum durable model.

## Stage 3: Machine Auth

The best long-term solution is a dedicated machine-auth flow.

Recommended shape:

1. add an internal-only auth exchange endpoint or mutation
2. protect it with a static secret stored in Vault/Doppler
3. issue a short-lived JWT with a narrow scope such as:
   - `harness:run`
   - `harness:impersonate`
4. optionally restrict which users or orgs may be impersonated

Then the harness flow becomes:

1. use machine secret
2. get short-lived harness admin token
3. mint short-lived actor token via `loginAsUser` or a harness-specific impersonation endpoint
4. run smoke
5. discard token

This is much cleaner than storing any human token at all.

## Best Design for Sprocket

For this codebase, I think the best steady-state design is:

1. **machine secret** in Vault/Doppler
2. **internal harness auth exchange**
3. **short-lived admin-scoped token**
4. **short-lived actor tokens minted from that**

That matches the way the current harness already wants to work:

- one admin-like identity
- short-lived impersonated actor tokens
- explicit environment targeting

## Security Constraints

If we add machine auth, it should be restricted:

- only enabled in trusted environments
- only for explicitly configured internal clients
- only for whitelisted orgs or test users where possible
- short expiry
- auditable logs for every impersonation event

This should never become a general-purpose backdoor login path.

## Concrete Recommendation

I would solve this in order:

1. extend the harness to accept `HARNESS_ADMIN_REFRESH_TOKEN`
2. use that as the short-term operator path
3. add a dedicated harness operator identity
4. then add a machine-auth exchange flow so the harness stops depending on human credentials entirely

## Immediate Next Change

The next auth-related harness change should be:

- add refresh-token support to the Tier 1 scripts and token helper

That gives us the biggest usability gain with the smallest code change.
