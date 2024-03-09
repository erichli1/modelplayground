"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";

const API_PROVIDERS = [
  { label: "OpenAI", keyName: "OPENAI_API_KEY" },
  {
    label: "Anthropic",
    keyName: "ANTHROPIC_API_KEY",
  },
];
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function Home() {
  return (
    <>
      <main className="h-screen flex flex-col">
        <header className="px-4 py-2 border-b">which model?</header>
        <ResizablePanelGroup direction="horizontal" className="w-full">
          <ResizablePanel defaultSize={20} className="flex flex-col">
            <APIKeysPanel providers={API_PROVIDERS} />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50} className="flex flex-col">
            <div className="flex-grow"></div>
            <div className="px-4 py-2 border-t">
              <Button>Run</Button>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={30}>
            <div className="flex h-[200px] items-center justify-center p-6">
              <span className="font-semibold">One</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </>
  );
}

function APIKeysPanel({
  providers,
}: {
  providers: Array<{ label: string; keyName: string }>;
}) {
  const [showKeys, setShowKeys] = useState<boolean>(false);

  return (
    <ScrollArea className="h-full p-4 overflow-auto">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-1 items-center">
          <span className="font-semibold">API Keys</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowKeys(!showKeys)}
          >
            {showKeys ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
        </div>
        {providers.map((provider, index) => (
          <div
            className="grid w-full items-center gap-1.5 px-0.5"
            key={`api-key-provider-${index}`}
          >
            <Label>{provider.label}</Label>
            <Input type={showKeys ? "text" : "password"} />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
