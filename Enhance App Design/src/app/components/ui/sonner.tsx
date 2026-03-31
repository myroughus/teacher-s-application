"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      duration={5000}
      style={
        {
          "--normal-bg":      "rgba(8, 12, 24, 0.88)",
          "--normal-text":    "#e2e4ea",
          "--normal-border":  "rgba(99, 102, 241, 0.3)",
          "--success-bg":     "rgba(0, 18, 14, 0.88)",
          "--success-text":   "#00e0c7",
          "--success-border": "rgba(0, 224, 199, 0.3)",
          "--error-bg":       "rgba(20, 5, 5, 0.88)",
          "--error-text":     "#f85c5c",
          "--error-border":   "rgba(248, 92, 92, 0.3)",
          "--warning-bg":     "rgba(18, 14, 0, 0.88)",
          "--warning-text":   "#fbbf24",
          "--warning-border": "rgba(251, 191, 36, 0.3)",
          "--info-bg":        "rgba(5, 7, 20, 0.88)",
          "--info-text":      "#818cf8",
          "--info-border":    "rgba(99, 102, 241, 0.3)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

