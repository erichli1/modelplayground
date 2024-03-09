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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CircleMinus, CirclePlus, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const API_PROVIDERS = [
  { label: "OpenAI", keyName: "OPENAI_API_KEY" },
  {
    label: "Anthropic",
    keyName: "ANTHROPIC_API_KEY",
  },
];

const MODELS = [
  {
    llm: "gpt-4-turbo-0125",
    provider: "OpenAI",
  },
  {
    llm: "claude-3-opus",
    provider: "Anthropic",
  },
];

type Model = {
  llm: string;
  provider: string;
};

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
          <ResizablePanel defaultSize={40} className="flex flex-col">
            <div className="flex-grow"></div>
            <div className="px-4 py-2 border-t flex justify-end">
              <Button>Run</Button>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={40}>
            <ComparePanel models={MODELS} />
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
          <span className="font-semibold">Add API keys</span>
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

function ComparePanel({ models }: { models: Array<Model> }) {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [modelsToCompare, setModelsToCompare] = useState<
    Array<Model & { id: string }>
  >([]);

  return (
    <ScrollArea className="h-full p-4 overflow-auto">
      <div className="flex flex-col gap-2">
        <p className="font-semibold">Select models</p>
        <div className="p-0.5 flex flex-row gap-1">
          <Select
            value={selectedModel}
            onValueChange={(newVal) => setSelectedModel(newVal)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {models.map((model) => (
                  <SelectItem
                    value={`${model.provider}-${model.llm}`}
                    key={`selectModelToAdd-${model.provider}-${model.llm}`}
                  >
                    {`${model.llm} (${model.provider})`}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            size="icon"
            variant="ghost"
            disabled={selectedModel === ""}
            onClick={() => {
              const foundModel = models.find(
                (model) => selectedModel === `${model.provider}-${model.llm}`
              );
              if (foundModel) {
                setModelsToCompare([
                  ...modelsToCompare,
                  { ...foundModel, id: uuidv4() },
                ]);
                setSelectedModel("");
              }
            }}
          >
            <CirclePlus className="h-4 w-4" />
          </Button>
        </div>

        {modelsToCompare.map((model, index) => (
          <Card key={`modelCompare-${model.provider}-${model.llm}-${index}`}>
            <CardContent className="text-sm p-4">
              <div className="flex flex-row justify-between items-center">
                <p className="font-bold">{`${model.llm} (${model.provider})`}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5"
                  onClick={() =>
                    setModelsToCompare(
                      modelsToCompare.filter((m) => m.id !== model.id)
                    )
                  }
                >
                  <CircleMinus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
