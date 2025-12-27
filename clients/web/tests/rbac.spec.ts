import { test, expect } from '@playwright/test';

// Mocking auth or bypassing it would be ideal, but for now assuming we can browse.
// If dev environment has unrestricted access or we need to login, we'd add that here.
// Assuming we are testing against a local dev build where we might be auto-logged in or using a seeded admin.

test.describe('RBAC Admin UI', () => {
  // Generate unique role name to avoid collisions
  const roleName = `test-role-${Date.now()}`;
  const roleDisplayName = `Test Role ${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err));

    let roles = [
        { id: 1, name: 'admin', displayName: 'Admin', hierarchy: 1, description: 'Admin role', isRestricted: false, isActive: true },
        { id: 2, name: 'player', displayName: 'Player', hierarchy: 10, description: 'Player role', isRestricted: false, isActive: true }
    ];

    // Mock GraphQL requests
    await page.route('**/graphql', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      console.log('Intercepted Op:', postData.operationName);
      
      if (postData.operationName === 'GetRoles') {
        return route.fulfill({
            json: {
                data: {
                    roles: roles
                }
            }
        });
      }
      
      if (postData.operationName === 'CreateRoleMutation') {
          const newRole = {
              id: roles.length + 1,
              name: postData.variables.name,
              displayName: postData.variables.displayName,
              description: postData.variables.description,
              hierarchy: postData.variables.hierarchy,
              isRestricted: false, isActive: true
          };
          roles.push(newRole);
          return route.fulfill({
              json: {
                  data: {
                      createRole: newRole
                  }
              }
          });
      }
      
       if (postData.operationName === 'GetRoleAndPermissions') {
           // Extract role name from somewhere or just return generic
           return route.fulfill({
               json: {
                   data: {
                       role: {
                           id: 3,
                           name: 'test-role',
                           displayName: 'Test Role',
                           description: 'Desc',
                           hierarchy: 5,
                           isRestricted: false,
                           isActive: true
                       },
                       rolePermissions: []
                   }
               }
           });
       }

       if (postData.operationName === 'AddPermission') {
           return route.fulfill({
               json: {
                   data: {
                       addPermissionToRole: true
                   }
               }
           });
       }

      // Default
      return route.continue();
    });
  });

  test('should create a new role', async ({ page }) => {
    await page.goto('/admin/roles');

    
    // Check if we are on the page
    await expect(page.getByRole('heading', { name: 'Role Management' })).toBeVisible();

    // Click Create Role
    await page.getByRole('link', { name: 'Create Role' }).click();
    await expect(page).toHaveURL(/\/admin\/roles\/new/);

    // Fill Form
    await page.getByLabel('Display Name').fill(roleDisplayName);
    await page.getByLabel('Internal Name (Slug)').fill(roleName);
    await page.getByLabel('Hierarchy (Priority)').fill('10');
    await page.getByLabel('Description').fill('Integration test role');

    // Submit
    await page.getByRole('button', { name: 'Create Role' }).click();

    // Should redirect back to list
    await expect(page).toHaveURL('/admin/roles');

    // Verify role is in list
    // Depending on pagination/list size, might need search.
    // Assuming list is small enough or we can find it.
    await expect(page.getByText(roleDisplayName)).toBeVisible();
    await expect(page.getByText(roleName)).toBeVisible();
  });

  test('should view role details and add permission', async ({ page }) => {
    // Navigate to the role we just created (or a known one if ordering uncertain)
    // Here we assume the previous test ran, but tests should be isolated.
    // Ideally we create a role via API first. For UI test flow, let's use a stable seeded role or chain steps carefully
    // (Playwright tests run in parallel by default, so reliance on state from another test is creating flake).
    
    // Better: Create a role FOR THIS TEST via UI or API. 
    // Let's create one via UI again for simplicity of this "whip up" request.
    
    const localRoleName = `perm-test-${Date.now()}`;
    
    // 1. Create Role
    await page.goto('/admin/roles/new');
    await page.getByLabel('Display Name').fill(localRoleName);
    await page.getByLabel('Internal Name (Slug)').fill(localRoleName);
    await page.getByLabel('Hierarchy (Priority)').fill('5');
    await page.getByRole('button', { name: 'Create Role' }).click();
    await expect(page).toHaveURL('/admin/roles');

    // 2. Go to Details
    // Find the edit button for this row
    // Row contains localRoleName.
    const row = page.getByRole('row', { name: localRoleName });
    await row.getByRole('link', { name: 'Edit' }).click();
    
    await expect(page).toHaveURL(new RegExp(`/admin/roles/${localRoleName}`));

    // 3. Add Permission
    await page.getByPlaceholder('e.g. roster').fill('scrims');
    await page.getByPlaceholder('e.g. manage').fill('create');
    await page.getByPlaceholder('e.g. own_team').fill('all');
    await page.getByRole('button', { name: 'Add' }).click();

    // 4. Verify in List
    // We expect a row in the permissions table
    await expect(page.getByRole('cell', { name: 'scrims' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'create' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'all' })).toBeVisible();
  });
});
