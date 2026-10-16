"use client";

import { useState, type ComponentProps } from "react";
import dynamic from "next/dynamic";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const ThemeMenu = dynamic(() => import("./theme-menu").then((mod) => mod.ThemeMenu), {
  ssr: false,
  loading: () => <ThemeButton disabled />,
});

function ThemeButton(props: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9 rounded-full"
      aria-label="Toggle theme"
      aria-haspopup="menu"
      {...props}
    >
      <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function ThemeSwitcher() {
  const [activated, setActivated] = useState(false);
  const trigger = (
    <ThemeButton
      onClick={activated ? undefined : () => setActivated(true)}
      onKeyDown={
        activated
          ? undefined
          : (event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                setActivated(true);
              }
            }
      }
    />
  );
  return activated ? <ThemeMenu trigger={trigger} /> : trigger;
}
