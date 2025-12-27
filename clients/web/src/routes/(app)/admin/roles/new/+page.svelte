<script lang="ts">
  import { graphql } from '$houdini';
  
  const createRole = graphql(`
      mutation CreateRoleMutation($name: String!, $displayName: String!, $description: String, $hierarchy: Int) {
          createRole(name: $name, displayName: $displayName, description: $description, hierarchy: $hierarchy) {
              id
              name
          }
      }
  `);

  let name = '';
  let displayName = '';
  let description = '';
  let hierarchy = 0;

  async function handleSubmit() {
      try {
          await createRole.mutate({
              name,
              displayName,
              description: description || undefined,
              hierarchy: parseInt(String(hierarchy))
          });
          // Redirect
          window.location.href = '/admin/roles';
      } catch (e) {
          console.error(e);
          alert('Failed to create role');
      }
  }
</script>

<div class="container mx-auto p-4 space-y-4">
    <div class="flex items-center gap-2 text-sm text-gray-500">
        <a href="/admin/roles" class="hover:underline">Roles</a>
        <span>/</span>
        <span>New</span>
    </div>

    <h1 class="h1">Create New Role</h1>

    <div class="card p-6 w-full max-w-lg">
        <form class="space-y-4" on:submit|preventDefault={handleSubmit}>
            <label class="label">
                <span>Display Name</span>
                <input class="input" type="text" bind:value={displayName} required placeholder="e.g. Moderator" />
            </label>
            <label class="label">
                <span>Internal Name (Slug)</span>
                <input class="input" type="text" bind:value={name} required placeholder="e.g. moderator" />
            </label>
            <label class="label">
                <span>Hierarchy (Priority)</span>
                <input class="input" type="number" bind:value={hierarchy} required min="0" />
            </label>
             <label class="label">
                <span>Description</span>
                <textarea class="textarea" bind:value={description} rows="3" placeholder="Description of the role..."></textarea>
            </label>
            
            <div class="flex justify-end gap-2 pt-4">
                <a href="/admin/roles" class="btn variant-ghost-secondary">Cancel</a>
                <button type="submit" class="btn variant-filled-primary">Create Role</button>
            </div>
        </form>
    </div>
</div>
