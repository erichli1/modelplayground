import * as React from "react";

import { cn } from "@/lib/utils";

const useAutoResizeTextarea = (
  ref: React.ForwardedRef<HTMLTextAreaElement>
) => {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useImperativeHandle(ref, () => textAreaRef.current!);

  React.useEffect(() => {
    const ref = textAreaRef?.current;

    const updateTextareaHeight = () => {
      if (ref) {
        ref.style.height = "auto";
        // add 5px to the scrollHeight to prevent the textarea from scrolling
        ref.style.height = ref?.scrollHeight + 5 + "px";
      }
    };

    updateTextareaHeight();

    ref?.addEventListener("input", updateTextareaHeight);

    return () => ref?.removeEventListener("input", updateTextareaHeight);
  }, []);

  return { textAreaRef };
};

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoSize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoSize, ...props }, ref) => {
    const { textAreaRef } = useAutoResizeTextarea(ref);

    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={autoSize ? textAreaRef : ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
