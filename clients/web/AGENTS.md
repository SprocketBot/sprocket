# Web Client Agent Instructions

## Service Overview

**Workspace:** `clients/web/`
**Type:** SvelteKit Application
**Port:** 8080 (dev), 3000 (prod)
**Health Endpoint:** `http://localhost:8080`
**Framework:** SvelteKit with TypeScript

## Component Structure

### Directory Layout

```
clients/web/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── atoms/        # Basic UI elements (Button, Card, Modal)
│   │   │   ├── molecules/    # Composite components (Forms, Lists)
│   │   │   ├── organisms/    # Complex components (ScrimQueue, SubmissionFlow)
│   │   │   └── abstract/     # Base classes, utilities
│   │   ├── stores/           # Svelte stores (state management)
│   │   ├── graphql/          # GraphQL queries/mutations
│   │   └── utils/            # Helper functions
│   ├── routes/               # SvelteKit routes
│   │   ├── __layout.svelte   # Root layout
│   │   ├── index.svelte      # Home page
│   │   ├── league/           # League-related pages
│   │   └── scrims/           # Scrim-related pages
│   └── app.html              # HTML template
├── static/                   # Static assets
└── config/                   # Application config
```

### Component Hierarchy

**Atoms** (basic building blocks):
- `Button.svelte` - Reusable button component
- `Card.svelte` - Content container
- `Modal.svelte` - Dialog/popup
- `Input.svelte` - Form input

**Molecules** (composite components):
- `LoginForm.svelte` - Login form with validation
- `ScrimCard.svelte` - Scrim information display
- `SubmissionForm.svelte` - Replay submission form

**Organisms** (complex, feature-specific):
- `ScrimQueue.svelte` - Full scrim queue interface
- `SubmissionFlow.svelte` - Multi-step submission process
- `LeagueStandings.svelte` - Standings table with sorting

## State Management

### Svelte Stores

```typescript
// src/lib/stores/user.store.ts
import { writable } from 'svelte/store';

export interface User {
  id: string;
  displayName: string;
  email: string;
}

export const user = writable<User | null>(null);

export const userActions = {
  login: (userData: User) => user.set(userData),
  logout: () => user.set(null),
  update: (userData: Partial<User>) => user.update(u => ({ ...u, ...userData })),
};
```

### GraphQL Integration (URQL)

```typescript
// src/lib/graphql/queries/organization.query.ts
import { gql } from 'urql';

export const GetOrganization = gql`
  query GetOrganization($id: String!) {
    organization(id: $id) {
      id
      name
      slug
      members {
        id
        displayName
      }
    }
  }
`;

// Usage in component
<script lang="ts">
  import { query } from '$lib/graphql/client';
  import { GetOrganization } from '$lib/graphql/queries/organization.query';
  
  let result = query(GetOrganization, { id: 'org-id' });
</script>
```

## Test Patterns

### Location
- Component tests: `clients/web/src/lib/components/**/__tests__/`
- Route tests: `clients/web/src/routes/**/__tests__/`
- Smoke tests: `clients/web/tests/smoke/`

### Component Testing

```typescript
// src/lib/components/atoms/Button.svelte.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import Button from './Button.svelte';

describe('Button', () => {
  it('renders with label', () => {
    const { getByText } = render(Button, {
      props: { label: 'Click me' },
    });
    
    expect(getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const { getByText } = render(Button, {
      props: { 
        label: 'Click me',
        onClick: handleClick,
      },
    });
    
    await fireEvent.click(getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Running Tests

```bash
# All web tests
npm run test --workspace=clients/web

# Specific test file
npm run test --workspace=clients/web -- src/lib/components/atoms/Button.svelte.test.ts

# With coverage
npm run test --workspace=clients/web -- --coverage

# UI smoke tests (Playwright)
npm run test:smoke --workspace=clients/web
```

## Common Pitfalls

### ❌ Anti-Patterns

1. **Direct API calls in components**
   ```svelte
   <!-- BAD: API call in component -->
   <script lang="ts">
     let data;
     
     // ❌ Don't do this
     fetch('/api/data').then(r => r.json()).then(d => data = d);
   </script>
   ```

2. **Prop drilling through many levels**
   ```svelte
   <!-- BAD: Too many levels of props -->
   <Parent user={user} onLogout={handleLogout}>
     <Child {user} {onLogout}>
       <Grandchild {user} {onLogout}>
         <!-- Use store instead -->
       </Grandchild>
     </Child>
   </Parent>
   ```

3. **Business logic in components**
   ```svelte
   <!-- BAD: Business logic in component -->
   <script lang="ts">
     // ❌ Don't do this
     function calculateScore(a, b, c) {
       return ((a * 2) + (b * 3) + c) / 10;
     }
   </script>
   ```

### ✅ Best Practices

1. **Use GraphQL client for data fetching**
   ```svelte
   <!-- GOOD: Use URQL client -->
   <script lang="ts">
     import { query } from '$lib/graphql/client';
     import { GetData } from '$lib/graphql/queries/data.query';
     
     let result = query(GetData);
   </script>
   ```

2. **Use stores for shared state**
   ```svelte
   <!-- GOOD: Use store -->
   <script lang="ts">
     import { user } from '$lib/stores/user.store';
   </script>
   
   {$user ? <LoggedIn /> : <LoggedOut />}
   ```

3. **Keep components focused**
   ```svelte
   <!-- GOOD: Component does one thing -->
   <script lang="ts">
     export let label: string;
     export let onClick: () => void;
     // Simple, focused component
   </script>
   
   <button on:click={onClick}>{label}</button>
   ```

## Architectural Rules

### Component Design
- ✅ Single responsibility per component
- ✅ Props clearly typed with TypeScript interfaces
- ✅ Events documented with JSDoc
- ✅ Slots used for content projection
- ❌ Components larger than 300 lines (extract sub-components)
- ❌ More than 5 props (consider splitting component)

### State Management
- ✅ Svelte stores for global state
- ✅ Local state for component-specific data
- ✅ GraphQL cache for server data
- ❌ Prop drilling more than 2 levels
- ❌ Multiple sources of truth

### API Integration
- ✅ GraphQL for all data fetching
- ✅ URQL client for GraphQL operations
- ✅ Error boundaries for failed queries
- ❌ Direct fetch calls (use GraphQL client)
- ❌ Hardcoded API endpoints

## Configuration

### Client vs Server Config

**Client Config** (exposed to users):
```json
{
  "client": {
    "apiUrl": "https://api.sprocket.mlesports.gg",
    "features": {
      "scrims": true,
      "leagues": true
    }
  }
}
```

**Server Config** (not exposed):
```json
{
  "server": {
    "internalApiUrl": "http://core:3001"
  }
}
```

**Secrets** (in .txt files, injected by infra):
```
# config/secret/jwt_secret.txt
super-secret-jwt-key
```

## Debugging Commands

```bash
# View web logs
npm run dev:logs -- web

# Check web health
curl http://localhost:8080

# Run dev server
npm run dev --workspace=clients/web

# Build for production
npm run build --workspace=clients/web

# Type check
npm run check --workspace=clients/web

# Lint
npm run lint --workspace=clients/web
```

## Common Tasks

### Adding a New Page

1. Create route directory: `src/routes/my-page/`
2. Add `+page.svelte` component
3. Add `+page.ts` for load function (if needed)
4. Update navigation component
5. Add tests

### Adding a New Component

1. Choose level (atom/molecule/organism)
2. Create component: `src/lib/components/<level>/MyComponent.svelte`
3. Add TypeScript interface for props
4. Add tests: `src/lib/components/<level>/__tests__/MyComponent.svelte.test.ts`
5. Export from `src/lib/components/index.ts`

### Adding GraphQL Query

1. Create query file: `src/lib/graphql/queries/my-query.ts`
2. Define GraphQL query with `gql`
3. Use in component with `query()` from URQL client
4. Add TypeScript types for response

## Testing Requirements

### For All Components
- [ ] Props are typed
- [ ] Events are documented
- [ ] Basic rendering test
- [ ] Interaction tests (if applicable)

### For Pages
- [ ] Load function tested
- [ ] Error states covered
- [ ] Loading states tested

### For UI Changes
- [ ] Visual regression tests (if applicable)
- [ ] Accessibility check (basic)
- [ ] Mobile responsive check

## Related Documentation

- **Root AGENTS.md:** `../../AGENTS.md`
- **Task Protocol:** `../../reports/agent-task-protocol.md`
- **Harness Charter:** `../../reports/agent-harness-charter.md`
- **Local Runtime:** `../../reports/agent-harness-local-runtime.md`
- **Service Manifest:** `../../scripts/harness/service-manifest.json`
- **Config Guide:** `config/README.md`
