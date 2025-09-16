import * as React from "react";
import {
  BeautifyKeyTextInputKey,
  beautifyKeyTextList,
  ModKey,
  ShortcutHintLabelStyle,
  UserAgentSummary,
  useUserAgentSummary,
} from "./utils";

export type SubmitMode = "mod-enter" | "enter";
export type ModKeyOption = ModKey | "auto";
export type EnabledOption = boolean | "non-mobile";

export type UseChatSubmitOptions = {
  /** Callback invoked on submit (required) */
  onSubmit: (value: string, ctx: { target: HTMLTextAreaElement }) => void;
  /** Submit mode (default: "mod-enter") */
  mode?: SubmitMode;
  /** Mod key selection, Cmd/Ctrl (default: "auto") */
  modKey?: ModKeyOption;
  /** Allow empty string submission (default: false) */
  allowEmptySubmit?: boolean;
  /** Stop event propagation on Enter submit (default: false) */
  stopPropagation?: boolean;
  /**
   * Enable/disable control (default: true)
   * - true/false: always enabled/disabled
   * - "non-mobile": enabled only on non-mobile devices (enabled while UA is undetermined)
   */
  enabled?: EnabledOption;
  /**
   * Display style for shortcut hints (default: "auto")
   * - "auto": choose symbols/text automatically by platform for clarity
   * - "symbols": use symbols like ⌘/⇧/⏎
   * - "text": use text labels like Ctrl/Shift/Enter
   */
  shortcutHintLabelStyle?: ShortcutHintLabelStyle;
  /**
   * Hint for UA detection. When UA is unavailable on initial render (e.g., SSR),
   * passing this allows correct shortcut hints to be shown immediately.
   * If omitted, it is inferred on the client.
   */
  userAgentHint?: UserAgentSummary;
};

export type ShortcutHintLabels = {
  submit: {
    /** Example: false for Enter submit; true for Cmd/Ctrl+Enter submit */
    isUniqueBehavior: boolean;
    /** Currently active keys e.g. ["⌘","enter"] | ["ctrl","enter"] */
    keys: string[];
  };
  lineBreak: {
    isUniqueBehavior: boolean;
    /** e.g. ["⇧","enter"] | ["shift","enter"] */
    keys: string[];
  };
};

export type UseChatSubmitReturn = {
  /**
   * Prop getter: accepts user props and returns composed props
   * - onKeyDown / onComposition* are composed in order: user → library
   * - If event.defaultPrevented or event.isPropagationStopped() is true, internal handling is skipped
   * - ref is merged with the internal textareaRef
   */
  getTextareaProps: (
    userProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
      ref?: React.Ref<HTMLTextAreaElement>;
    }
  ) => React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    ref: React.Ref<HTMLTextAreaElement>;
  };

  /** textarea ref (read-only) */
  textareaRef: React.RefObject<null | HTMLTextAreaElement>;

  /** Manual submit trigger */
  triggerSubmit: () => void;

  /** UI hint labels */
  shortcutHintLabels: undefined | ShortcutHintLabels;
  /**
   * Whether it is enabled (internal state)
   */
  isEnabled: boolean;
};

function callUserThenLib<
  T extends { defaultPrevented: boolean; isPropagationStopped: () => boolean }
>(user: ((e: T) => void) | undefined, lib: (e: T) => void) {
  return (e: T) => {
    // Invoke user handler first
    user?.(e);

    if (e.defaultPrevented || e.isPropagationStopped()) {
      // Do nothing if preventDefault or stopPropagation was already called
      return;
    }
    lib(e);
  };
}

function composeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (node) => {
    const cleanups: Array<() => void> = [];
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        const maybeCleanup = ref(node);
        if (typeof maybeCleanup === "function") cleanups.push(maybeCleanup);
      } else {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
    if (cleanups.length > 0) {
      return () => {
        for (const c of cleanups) c();
      };
    }
    return;
  };
}

function resolveModKey(
  modKey: ModKeyOption,
  isApple: undefined | boolean
): undefined | ModKey {
  if (modKey === "meta" || modKey === "ctrl") return modKey;
  if (isApple === undefined) return undefined;
  return isApple ? "meta" : "ctrl";
}

function isModPressed(
  e: React.KeyboardEvent,
  resolved: undefined | ModKey
): undefined | boolean {
  if (resolved === undefined) return undefined;
  return resolved === "meta" ? e.metaKey : e.ctrlKey;
}

function getSubmitKeys(
  mode: SubmitMode,
  resolved: ModKey
): BeautifyKeyTextInputKey[] {
  if (mode === "enter") return ["enter"];
  if (resolved === "ctrl") return ["ctrl", "enter"];
  return [resolved === "meta" ? "meta" : "ctrl", "enter"];
}

function getLineBreakKeys(mode: SubmitMode): BeautifyKeyTextInputKey[] {
  if (mode === "enter") return ["shift", "enter"];
  return ["enter"]; // mod-enter
}

export function useChatSubmit(
  options: UseChatSubmitOptions
): UseChatSubmitReturn {
  const {
    onSubmit,
    mode = "mod-enter",
    modKey = "auto",
    allowEmptySubmit = false,
    stopPropagation = false,
    enabled = "non-mobile",
    shortcutHintLabelStyle = "auto",
    userAgentHint,
  } = options;

  const uaSummary = useUserAgentSummary(userAgentHint);
  const isApple = uaSummary?.isAppleDevice;
  const isMobile = uaSummary?.isMobile;
  const resolvedMod = resolveModKey(modKey, isApple);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const composingRef = React.useRef(false);

  const isEnabled = React.useMemo(() => {
    if (enabled === "non-mobile") {
      // When UA is undetermined, keep it enabled for now
      return isMobile === undefined ? true : !isMobile;
    }
    return enabled;
  }, [enabled, isMobile]);

  const instrumentedRef = React.useCallback<
    React.RefCallback<HTMLTextAreaElement>
  >(
    (node) => {
      if (!node) return;
      if (!isEnabled) return;

      const onNativeKeyDown = (e: KeyboardEvent) => {
        // Chrome: compositionstart may occur after keyup; detect composing at keydown
        if (e.isComposing || (e as any).key === "Process") {
          composingRef.current = true;
        }
      };

      const onNativeKeyUp = (e: KeyboardEvent) => {
        // Safari: compositionend may fire earlier; confirm isComposing=false at keyup
        if (!e.isComposing) {
          composingRef.current = false;
        }
      };

      const onNativeCompositionStart = () => {
        composingRef.current = true;
      };

      const clearComposition = () => {
        // IME may skip keyup before compositionend; ensure we always reset
        composingRef.current = false;
      };

      // keydown handling: detect IME state early when compositionstart is delayed
      node.addEventListener("keydown", onNativeKeyDown);
      // keyup handling: fallback to reset after physical key release (Safari quirk)
      node.addEventListener("keyup", onNativeKeyUp);
      // compositionstart: guaranteed signal when IME begins (covers virtual keyboards)
      node.addEventListener("compositionstart", onNativeCompositionStart);
      // compositionend: primary reset when IME commits the text
      node.addEventListener("compositionend", clearComposition);
      // compositioncancel: ensure reset even if composition is aborted
      node.addEventListener("compositioncancel", clearComposition);

      // React 19: return cleanup from ref callback
      return () => {
        node.removeEventListener("keydown", onNativeKeyDown);
        node.removeEventListener("keyup", onNativeKeyUp);
        node.removeEventListener("compositionstart", onNativeCompositionStart);
        node.removeEventListener("compositionend", clearComposition);
        node.removeEventListener("compositioncancel", clearComposition);
      };
    },
    [isEnabled]
  );

  const doSubmit = React.useCallback(() => {
    /**
     * allow submit even when isEnabled is false
     */
    const el = textareaRef.current;
    if (!el) return;
    if (el.disabled || el.readOnly) return;
    const value = el.value ?? "";
    if (!allowEmptySubmit && value.trim() === "") return;
    onSubmit(value, { target: el });
  }, [allowEmptySubmit, onSubmit]);

  const onKeyDownLib = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!isEnabled) return;
      if (e.repeat) return; // avoid repeated firing on key hold
      if (composingRef.current) return;
      // do not submit during IME composition

      if (e.key !== "Enter") return;

      const el = e.currentTarget;
      if (el.disabled || el.readOnly) return;

      if (mode === "enter") {
        // Shift+Enter inserts a line break; Enter alone submits
        if (e.shiftKey) return; // line break (default behavior)
        e.preventDefault();
        if (stopPropagation) e.stopPropagation();
        doSubmit();
        return;
      }

      // mod-enter: submit with Mod+Enter
      if (isModPressed(e, resolvedMod)) {
        e.preventDefault();
        if (stopPropagation) e.stopPropagation();
        doSubmit();
      }
    },
    [doSubmit, mode, resolvedMod, stopPropagation, isEnabled]
  );

  const getTextareaProps = React.useCallback<
    UseChatSubmitReturn["getTextareaProps"]
  >(
    (userProps) => {
      const {
        onKeyDown: onKeyDownUser,
        ref: userRef,
        ...rest
      } = userProps ?? {};

      if (!isEnabled) {
        // When disabled, return user props as-is and only merge ref (no wrappers)
        return {
          ...rest,
          onKeyDown: onKeyDownUser,
          ref: composeRefs(userRef, textareaRef),
        };
      }

      const onKeyDown = callUserThenLib(onKeyDownUser, onKeyDownLib);

      return {
        ...rest,
        onKeyDown,
        ref: composeRefs(userRef, textareaRef, instrumentedRef),
      };
    },
    [onKeyDownLib, isEnabled, instrumentedRef]
  );

  const shortcutHintLabels = React.useMemo<
    ShortcutHintLabels | undefined
  >(() => {
    const submitIsUnique = mode === "mod-enter"; // Cmd/Ctrl+Enter is unique
    const lineBreakIsUnique = mode === "enter"; // Shift+Enter is unique
    if (!resolvedMod) return undefined;
    const submitKeys = getSubmitKeys(mode, resolvedMod);
    const lineBreakKeys = getLineBreakKeys(mode);
    if (shortcutHintLabelStyle === "text") {
      return {
        submit: {
          isUniqueBehavior: submitIsUnique,
          keys: submitKeys,
        },
        lineBreak: {
          isUniqueBehavior: lineBreakIsUnique,
          keys: lineBreakKeys,
        },
      };
    }
    if (isApple === undefined) return undefined;
    return {
      submit: {
        isUniqueBehavior: submitIsUnique,
        keys: beautifyKeyTextList({
          keys: submitKeys,
          isApple,
          hintLabelStyle: shortcutHintLabelStyle,
        }),
      },
      lineBreak: {
        isUniqueBehavior: lineBreakIsUnique,
        keys: beautifyKeyTextList({
          keys: lineBreakKeys,
          isApple,
          hintLabelStyle: shortcutHintLabelStyle,
        }),
      },
    };
  }, [mode, resolvedMod, isApple, shortcutHintLabelStyle]);

  return {
    getTextareaProps,
    textareaRef,
    triggerSubmit: doSubmit,
    shortcutHintLabels,
    isEnabled,
  };
}

export default useChatSubmit;
