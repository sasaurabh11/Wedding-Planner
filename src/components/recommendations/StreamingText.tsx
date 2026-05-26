"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface StreamingTextProps {
  text: string;
  className?: string;
  isComplete?: boolean;
}

export function StreamingText({ text, className, isComplete = true }: StreamingTextProps) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  return (
    <span className={cn("inline", className)}>
      {displayText}
      {!isComplete && (
        <span className="inline-block w-0.5 h-4 bg-amber-500 ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  );
}
