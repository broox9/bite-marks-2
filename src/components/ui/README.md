# UI Form Components

Unstyled, composable form primitives for consistent theming and layout. Customize via your own CSS by targeting the stable class names and optional `data-size` / `data-variant` attributes.

## Primitives

| Component | Description |
|-----------|-------------|
| **Input** | Base text input. Supports `class`, `data-size`, `data-variant`, and all native input attributes. |
| **Button** | Button with optional content (text/icons). Default `type="button"`. |
| **SubmitButton** | Same as Button but always `type="submit"`. |
| **Checkbox** | Checkbox input with same layout/theming props. |
| **Search** | Input with `type="search"` (wraps Input). |
| **Password** | Input with `type="password"` (wraps Input). |
| **Label** | Label with optional content and `for`, `class`, `data-size`, `data-variant`. |

## Composition

| Component | Description |
|-----------|-------------|
| **InputGroup** | Wraps content with optional `leading` and `trailing` snippets (e.g. prefix icon, suffix button). Main content in default `children` snippet. |
| **ButtonGroup** | Wraps multiple buttons. Supports `data-orientation="horizontal" \| "vertical"`. |
| **InputWithButton** | Pairs an input snippet with an action snippet. Supports `data-order="input-action" \| "action-input"`. |

## Theming & layout

- Each component has a stable class: `ui-input`, `ui-button`, `ui-checkbox`, `ui-label`, etc.
- Optional attributes: `data-size` (`sm` \| `md` \| `lg`), `data-variant` (any string).
- Composition classes: `.ui-input-group`, `.ui-input-group__leading`, `.ui-input-group__input`, `.ui-input-group__trailing`, `.ui-button-group`, `.ui-input-with-button`, `.ui-input-with-button__input`, `.ui-input-with-button__action`.
- Add your styles in app CSS or a theme file; `ui.css` in this folder documents the hooks and adds no visual styles.

## Usage

Import from `$components/ui` or `$components/ui/index.ts`:

```svelte
<script>
  import { Input, Button, SubmitButton, Search, InputWithButton, InputGroup, Label } from '$components/ui';
</script>
```

### Example: Search input with submit button

```svelte
<InputWithButton>
  {#snippet input()}
    <Search placeholder="Search..." name="q" />
  {/snippet}
  {#snippet action()}
    <SubmitButton>Search</SubmitButton>
  {/snippet}
</InputWithButton>
```

### Example: Input group with leading addon

```svelte
<InputGroup>
  {#snippet leading()}<span aria-hidden="true">@</span>{/snippet}
  {#snippet children()}<Input type="email" placeholder="Email" />{/snippet}
</InputGroup>
```

### Example: Label + input

```svelte
<Label for="email">Email</Label>
<Input id="email" type="email" name="email" />
```

### Example: Button group

```svelte
<ButtonGroup data-orientation="horizontal">
  <Button>Cancel</Button>
  <SubmitButton>Save</SubmitButton>
</ButtonGroup>
```
