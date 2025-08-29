/// <reference types="user-agent-data-types" />

import * as React from "react";

export type UserAgentSummary = {
  isAppleDevice: boolean;
  isMobile: boolean;
};

export function getUserAgentSummary(): undefined | UserAgentSummary {
  if (typeof window === "undefined") return undefined;

  const uaData = navigator.userAgentData;
  if (uaData) {
    const platform = uaData.platform.toLowerCase();
    return {
      isAppleDevice: ["macos", "ios"].includes(platform),
      isMobile: uaData.mobile,
    };
  }

  const ua: string = navigator.userAgent.toLowerCase();

  const isIos =
    /iphone|ipad/.test(ua) || (/mac os/.test(ua) && "ontouchend" in document);

  const isMac = /mac os x|macintosh/.test(ua);
  const isAppleDevice = isIos || isMac;
  const isMobile = isIos || /android/.test(ua);

  return { isAppleDevice, isMobile };
}

export function useUserAgentSummary(
  uaSummaryHint?: UserAgentSummary
): undefined | UserAgentSummary {
  const [uaSummary, setUaSummary] = React.useState<
    UserAgentSummary | undefined
  >(uaSummaryHint);

  React.useLayoutEffect(() => {
    setUaSummary((prev) => prev || getUserAgentSummary());
  }, []);

  return uaSummary;
}

export type ModKey = "meta" | "ctrl";

export type ShortcutHintLabelStyle = "auto" | "symbols" | "text";

export type BeautifyKeyTextInputKey = ModKey | "shift" | "enter";

export function beautifyKeyText({
  key,
  isApple,
  hintLabelStyle,
}: {
  key: BeautifyKeyTextInputKey;
  isApple: boolean;
  hintLabelStyle: ShortcutHintLabelStyle;
}): string {
  if (hintLabelStyle === "text") return key;
  switch (key) {
    case "meta":
      return isApple ? "⌘" : "Win";
    case "ctrl":
      return isApple ? "control" : "Ctrl";
    case "shift":
      return isApple && hintLabelStyle === "symbols" ? "⇧" : "Shift";
    case "enter":
      return isApple && hintLabelStyle === "symbols" ? "⏎" : "Enter";
    default: {
      const _exhaustiveCheck: never = key;
      return key;
    }
  }
}

export function beautifyKeyTextList({
  keys,
  isApple,
  hintLabelStyle,
}: {
  keys: BeautifyKeyTextInputKey[];
  isApple: boolean;
  hintLabelStyle: ShortcutHintLabelStyle;
}): string[] {
  return keys.map((key) => beautifyKeyText({ key, isApple, hintLabelStyle }));
}
