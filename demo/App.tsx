import * as React from "react";
import { EnabledOption, useChatSubmit, type SubmitMode } from "../src";
import { ShortcutHintLabelStyle } from "../src/utils";

export function App() {
  const [messages, setMessages] = React.useState<string[]>([]);
  const [mode, setMode] = React.useState<SubmitMode>("enter");
  const [text, setText] = React.useState("");
  const testRef = React.useRef<HTMLTextAreaElement>(null);
  const [hintLabelStyle, setHintLabelStyle] =
    React.useState<ShortcutHintLabelStyle>("auto");
  const [enabled, setEnabled] = React.useState<EnabledOption>("non-mobile");

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
      enabled,
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
        maxWidth: 500,
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
          use-chat-submit
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
        <a href="https://www.npmjs.com/package/use-chat-submit">npm</a>/
        <a href="https://github.com/catnose99/use-chat-submit/blob/main/demo/App.tsx">
          Demo Code
        </a>
      </div>
      <div
        style={{
          background: "#f5f5f5",
          padding: 15,
          marginTop: 42,
          borderRadius: 15,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          <h2
            style={{
              fontSize: 17,
              margin: 0,
            }}
          >
            Enter =
          </h2>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="radio"
              name="mode"
              value="enter"
              checked={mode === "enter"}
              onChange={() => setMode("enter")}
            />
            <strong>Submit</strong>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="radio"
              name="mode"
              value="mod-enter"
              checked={mode === "mod-enter"}
              onChange={() => setMode("mod-enter")}
            />
            <strong>Line break</strong>
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
                  <div>
                    <strong
                      style={{
                        display: "inline-flex",
                        width: 45,
                      }}
                    >
                      Submit
                    </strong>
                    : {shortcutHintLabels.submit.keys.join("+")}
                  </div>
                  <div
                    style={{
                      marginTop: 5,
                    }}
                  >
                    <strong
                      style={{
                        display: "inline-flex",
                        width: 45,
                      }}
                    >
                      Break
                    </strong>
                    : {shortcutHintLabels.lineBreak.keys.join("+")}
                  </div>
                </div>
              )}
            </div>
            <button type="button" onClick={triggerSubmit}>
              Submit
            </button>
          </div>
          <div>
            <h3
              style={{
                margin: "20px 0 0",
                fontSize: 16,
              }}
            >
              Options
            </h3>
            <OptionsRow
              id="hint-label-style"
              label={"hintLabelStyle"}
              options={["auto", "symbols", "text"]}
              value={hintLabelStyle}
              onChange={setHintLabelStyle}
            />
            <OptionsRow
              id="enabled"
              label={"enabled"}
              options={["true", "false", "non-mobile"]}
              value={enabled.toString() as "true" | "false" | "non-mobile"}
              onChange={(value) =>
                setEnabled(
                  value === "true" ? true : value === "false" ? false : value
                )
              }
            />
          </div>
        </div>
      </div>

      <ul style={{ padding: 0, listStyle: "none" }}>
        {[...messages].reverse().map((m, i) => (
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

function OptionsRow<T extends string>({
  label,
  options,
  value,
  onChange,
  id,
}: {
  label: string;
  options: T[];
  value: T;
  id: string;
  onChange: (value: T) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        marginTop: 8,
      }}
    >
      <label
        htmlFor={id}
        style={{
          fontSize: 13,
        }}
      >
        {label}:
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
