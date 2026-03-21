# Figma Template Workflow (Designer Friendly)

Goal: allow designers to build report cards in Figma without hand-editing SVG.

## 1) Naming convention in Figma
Use this pattern in the **layer name** for any element that should be dynamic:

```
sprocket__<type>__<varPath>__<optKey>=<optVal>__<optKey>=<optVal>
```

Types:
- `text` / `number` / `fill` / `stroke` / `image`

Common options:
- `h` or `h-align` = `left|center|right`
- `v` or `v-align` = `top|center|bottom`
- `truncate` or `truncate-to` = `as-is|<number>`
- `case` = `upper|lower|as-is`
- `rescale` or `rescaleOn` = `height|width` (for images)

Examples:
```
sprocket__text__game.title__h=right__v=center__case=upper__truncate=as-is
sprocket__fill__team_primary_color
sprocket__image__organization.logo_url__rescale=height
```

## 2) Export SVG from Figma
Export the frame as SVG (single file).

## 3) Compile the template (adds data-sprocket bindings)
From `sprocket_dev/microservices/image-generation-service`:

```
npm run compile:figma -- --in path/to/template.svg --out path/to/template.compiled.svg
```

The compiled SVG is what the image-generation service expects.

## Notes
- Only elements with IDs starting with `sprocket__` are modified.
- Existing `data-sprocket` attributes are preserved as-is.
- The default image rescale is `height` if not provided.
