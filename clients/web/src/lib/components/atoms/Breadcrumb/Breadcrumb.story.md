# Breadcrumbs

The breadcrumb component is used to show the user where they are in the app.
Crumbs are provided via the `BREADCRUMB_CONTEXT_KEY` context; as an array of `ICrumb`.

Whenever you need to add a crumb (i.e. in a `+layout.svelte`), you can use the `addCrumb` helper function.
`addCrumb` uses context under the hood, and must be called in the root of a component.

If dynamic information is needed in a layout, consider using a `load` function.
