<h1 align="center">
useChatSubmit
</h1>

<div align="center">

<img src="https://raw.githubusercontent.com/catnose99/use-chat-submit/c0b2bd2127b2e0eb77c2124a7a1e30dd1d7bf590/demo.gif" alt="use-chat-submit" width="520" />

</div>


A small React Hook that brings the chat input behavior you’d expect:
1. `Enter` inserts a line break; `Cmd/Ctrl` + `Enter` submits
2. `Shift` + ` Enter` inserts a line break; `Enter` submits

It prevents accidental submissions while using an IME, works seamlessly with your own handlers, and normalizes `Cmd` vs. `Ctrl` differences across platforms.

[**Demo**](https://catnose.me/use-chat-submit)

## Features
- Switch between submit/line-break keys based on user preference
- Works smoothly with IME languages (e.g., Japanese, Chinese)
- Zero dependencies
- Supports React 19+
- Just 1.5 KB gzipped 🚀


## Installation

```bash
pnpm add use-chat-submit
# or
npm i use-chat-submit
# or
yarn add use-chat-submit
```


## Quick Start

```tsx
import * as React from "react";
import { useChatSubmit } from "use-chat-submit";

export function ChatBox() {
  const [text, setText] = React.useState("");

  const { getTextareaProps } =
    useChatSubmit({
      onSubmit: (value) => {
        console.log("submit:", value);
        setText(""); // clear input after submit
      },
      mode: "mod-enter", // switch behavior based on user preference
    });

  return (
    <textarea
      {...getTextareaProps({
        value: text,
        onChange: (e) => setText(e.target.value),
      })}
    />
  );
}
```

`getTextareaProps()` only attaches `onKeyDown` and `ref`, so you can freely pass any other props yourself.

```tsx
// Equivalent behavior
<textarea
  {...getTextareaProps()}
  value={text}
  onChange={(e) => setText(e.target.value)}
/>
```

## Key Behavior (Modes)

| `options.mode` | Enter   | Shift+Enter | Cmd/Ctrl+Enter |
| -------------- | ------- | ----------- | -------------- |
| `mod-enter`    | Line break | Line break  | Submit         |
| `enter`        | Submit  | Line break   | Submit         |

- Never submits while an IME is composing (two-step check with `KeyboardEvent.isComposing` on keydown/keyup).
- `<textarea>` does not submit forms implicitly on Enter, so you don’t need to block default form behavior.
- For languages that rely heavily on IME (like Chinese or Japanese), using `mod-enter` is recommended.

## Why It Helps

- Safely composes with your handlers (user → library). Respects `event.defaultPrevented` and `event.isPropagationStopped()`.
- Smooths out differences between Safari and Chrome in IME composition handling. Detects reliably using native keydown/keyup events.
- Normalizes Cmd vs. Ctrl with `modKey: "auto"`. Also exposes platform-aware shortcut hints for your UI.


## API

### useChatSubmit

#### Options (`UseChatSubmitOptions`)

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `onSubmit(value, ctx)` | `(value: string, ctx: { target: HTMLTextAreaElement }) => void` | — (required) | Called on submit. Access the underlying textarea via `ctx.target`. |
| `mode` | `"mod-enter" | "enter"` | `"mod-enter"` | Key mapping behavior for Enter/Shift+Enter/Cmd/Ctrl+Enter. |
| `modKey` | `"meta" | "ctrl" | "auto"` | `"auto"` (recommended) | Which modifier counts as “mod”. Auto = Cmd (⌘) on macOS, Ctrl elsewhere. |
| `allowEmptySubmit` | `boolean` | `false` | Allow submitting an empty string. |
| `stopPropagation` | `boolean` | `false` | Call `e.stopPropagation()` when submitting. |
| `enabled` | `boolean | "non-mobile"` | `true` | Enable the behavior. `"non-mobile"` enables only on non‑mobile devices. |
| `shortcutHintLabelStyle` | `"auto" | "symbols" | "text"` | `"auto"` | Style for shortcut hint labels. |
| `userAgentHint` | `string` | — | Optional UA string for SSR to reduce detection lag. |

### Return Value (`UseChatSubmitReturn`)

| Property | Type | Description |
| --- | --- | --- |
| `getTextareaProps(userProps?)` | `(userProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: React.Ref<HTMLTextAreaElement> }) => React.TextareaHTMLAttributes<HTMLTextAreaElement>` | Safely composes props for `<textarea>`. You may pass a `ref`. |
| `textareaRef` | `React.RefObject<HTMLTextAreaElement>` | Read-only ref to the textarea element. |
| `triggerSubmit()` | `() => void` | Programmatic submit trigger. |
| `shortcutHintLabels` | `{ submit: string; lineBreak: string } \| undefined` | UI-ready labels. `undefined` until the platform is detected. See the [demo](https://catnose.me/use-chat-submit). |
| `isEnabled` | `boolean` | Whether the hook is currently enabled. |


### Implementation Notes

- Handler composition is “user → library”. If the user calls `preventDefault()`, internal logic does not run.
- Leave line breaks to the browser’s default behavior (no manual `"\n"` insertion).
- In `enter` mode, `preventDefault()` repurposes Enter for submit (Shift+Enter still inserts a line break).
- Does not submit when `disabled`, `readOnly`, or when the value is empty with `allowEmptySubmit=false` and `value.trim()===""`.


## Limitations & Support

- Only `<textarea>` is supported (`<input>` doesn’t allow multi-line input)
- React 19+ (peer dependency)


## License

MIT
