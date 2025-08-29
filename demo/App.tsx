import * as React from "react";
import { useChatSubmit, type SubmitMode } from "../src";
import { ShortcutHintLabelStyle } from "../src/utils";

export function App() {
  const [messages, setMessages] = React.useState<string[]>([]);
  const [mode, setMode] = React.useState<SubmitMode>("enter");
  const [text, setText] = React.useState("");
  const testRef = React.useRef<HTMLTextAreaElement>(null);
  const [hintLabelStyle, setHintLabelStyle] =
    React.useState<ShortcutHintLabelStyle>("auto");

  const { getTextareaProps, triggerSubmit, shortcutHintLabels, isEnabled } =
    useChatSubmit({
      onSubmit: (value, ctx) => {
        setMessages((m) => [...m, value]);
        setText("");
        console.log("Submitted:", value, ctx);
      },
      mode,
      modKey: "auto",
      shortcutHintLabelStyle: hintLabelStyle,
    });

  const placeholder = React.useMemo(() => {
    if (shortcutHintLabels === undefined) return "";
    if (shortcutHintLabels.lineBreak.isUniqueBehavior) {
      return `${shortcutHintLabels.lineBreak.keys.join(" + ")} for a new line`;
    }
    if (shortcutHintLabels.submit.isUniqueBehavior) {
      return `${shortcutHintLabels.submit.keys.join(" + ")} to submit`;
    }

    return "Type your message";
  }, [shortcutHintLabels]);

  return (
    <div
      style={{
        maxWidth: 560,
        margin: "36px auto",
        paddingInline: "15px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 22, margin: "25px 0 0" }}>useChatSubmit</h1>
      <div
        style={{
          marginTop: 5,
        }}
      >
        <code
          style={{
            fontSize: 16,
          }}
        >
          use-submit-chat
        </code>
      </div>
      <div
        style={{
          display: "flex",
          gap: 9,
          marginTop: 5,
        }}
      >
        <a href="https://github.com/catnose99/use-chat-submit">GitHub</a>/
        <a href="https://www.npmjs.com/package/use-submit-chat">npm</a>/
        <a href="TODO:">Demo Code</a>
      </div>
      <div
        style={{
          background: "#f5f5f5",
          padding: 15,
          marginTop: 24,
          borderRadius: 15,
        }}
      >
        <h2
          style={{
            fontSize: 18,
            margin: 0,
          }}
        >
          Enter to
        </h2>
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 8,
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="radio"
              name="mode"
              value="enter"
              checked={mode === "enter"}
              onChange={() => setMode("enter")}
            />
            <strong>submit</strong>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="radio"
              name="mode"
              value="mod-enter"
              checked={mode === "mod-enter"}
              onChange={() => setMode("mod-enter")}
            />
            <strong>insert line break</strong>
          </label>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
            marginTop: 12,
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            {...getTextareaProps({
              ref: testRef,
              placeholder,
              rows: 5,
              style: { flex: 1, padding: 8, fontFamily: "inherit" },
            })}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 10,
            }}
          >
            <div
              style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}
            >
              {shortcutHintLabels && (
                <div style={{ color: "#666", fontSize: 12 }}>
                  Submit: {shortcutHintLabels.submit.keys.join("+")} / Line
                  break: {shortcutHintLabels.lineBreak.keys.join("+")}
                </div>
              )}
              <select
                value={hintLabelStyle}
                onChange={(e) =>
                  setHintLabelStyle(e.target.value as ShortcutHintLabelStyle)
                }
              >
                <option value="auto">auto</option>
                <option value="symbols">symbol</option>
                <option value="text">text</option>
              </select>
            </div>
            <button type="button" onClick={triggerSubmit}>
              Submit
            </button>
          </div>
        </div>
      </div>

      <ul style={{ padding: 0, listStyle: "none" }}>
        {messages.map((m, i) => (
          <li
            key={i}
            style={{
              padding: "8px 12px",
              background: "#f5f5f5",
              borderRadius: 8,
              margin: "8px 0",
            }}
          >
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}
