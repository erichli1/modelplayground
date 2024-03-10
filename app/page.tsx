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
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Message } from "@/lib/sync";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import Image from "next/image";

type ModelsToCompareType = Array<
  (typeof api.myFunctions.getModels)["_returnType"][0] & { uuid: string }
>;

export default function Home() {
  const providers = useQuery(api.myFunctions.getProviders);
  const models = useQuery(api.myFunctions.getModels);

  const [apiKeys, setApiKeys] = useState<
    Array<{ provider: Doc<"providers">; key: string }>
  >([]);

  const [messages, setMessages] = useState<Array<Message & { id: string }>>([
    {
      role: "system",
      content: "",
      id: uuidv4(),
    },
    {
      role: "user",
      content: "",
      id: uuidv4(),
    },
  ]);

  const [modelsToCompare, setModelsToCompare] = useState<ModelsToCompareType>(
    []
  );

  useEffect(() => {
    if (providers)
      setApiKeys(providers.map((provider) => ({ provider, key: "" })));
  }, [providers]);

  if (providers === undefined || models === undefined)
    return (
      <div className="flex items-center justify-center h-screen mx-auto">
        Loading models...
      </div>
    );

  const runTests = () => {
    console.log(apiKeys);
    console.log(messages);
    console.log(modelsToCompare);
  };

  return (
    <>
      <main className="h-screen flex flex-col">
        <header className="px-4 py-2 border-b">which model?</header>
        <ResizablePanelGroup direction="horizontal" className="w-full">
          <ResizablePanel defaultSize={15} className="flex flex-col">
            <APIKeysPanel providers={providers} setApiKeys={setApiKeys} />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            defaultSize={50}
            className="flex flex-col justify-between"
          >
            <div className="h-full overflow-auto">
              <PromptPanel messages={messages} setMessages={setMessages} />
            </div>
            <div className="px-4 py-2 border-t flex justify-end">
              <Button onClick={() => runTests()}>Run</Button>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={35}>
            <ComparePanel
              models={models}
              modelsToCompare={modelsToCompare}
              setModelsToCompare={setModelsToCompare}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </>
  );
}

function APIKeysPanel({
  providers,
  setApiKeys,
}: {
  providers: Array<Doc<"providers">>;
  setApiKeys: Dispatch<
    SetStateAction<
      {
        provider: Doc<"providers">;
        key: string;
      }[]
    >
  >;
}) {
  const [showKeys, setShowKeys] = useState<boolean>(false);

  return (
    <ScrollArea className="h-full p-4 overflow-auto">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-1 items-center">
          <p className="font-bold">Add API keys</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowKeys(!showKeys)}
            className="h-full"
          >
            {showKeys ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
        </div>
        {providers.map((provider) => (
          <div
            className="grid w-full items-center gap-1.5 px-0.5"
            key={`api-key-provider-${provider._id}`}
          >
            <Label>{provider.name}</Label>
            <Input
              type={showKeys ? "text" : "password"}
              onChange={(e) =>
                setApiKeys((prev) =>
                  prev.map((p) =>
                    p.provider._id === provider._id
                      ? { ...p, key: e.target.value }
                      : p
                  )
                )
              }
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function PromptPanel({
  messages,
  setMessages,
}: {
  messages: Array<Message & { id: string }>;
  setMessages: Dispatch<
    SetStateAction<
      (Message & {
        id: string;
      })[]
    >
  >;
}) {
  const changeMessageRole = ({
    id,
    newRole,
  }: {
    id: string;
    newRole: Message["role"];
  }) => {
    const newMessages = messages.map((message) =>
      message.id === id
        ? {
            ...message,
            role: newRole,
          }
        : message
    );

    setMessages(newMessages);
  };

  return (
    <ScrollArea className="h-full pt-4 px-4 overflow-auto">
      <div className="flex flex-col gap-4 overflow-auto">
        <p className="font-bold">Add prompt</p>
        <div className="flex flex-col gap-2">
          {messages.map((message) => (
            <div
              className="grid grid-cols-12 gap-2"
              key={`message-${message.id}`}
            >
              <div className="col-span-3 justify-start">
                <Button
                  variant="ghost"
                  className={`text-xs ${
                    message.role === "system" ? "pointer-events-none" : ""
                  }`}
                  onClick={
                    message.role === "system"
                      ? undefined
                      : () =>
                          changeMessageRole({
                            id: message.id,
                            newRole:
                              message.role === "user" ? "assistant" : "user",
                          })
                  }
                >
                  {message.role.toUpperCase()}
                </Button>
              </div>

              <Textarea
                autoSize
                className="resize-none col-span-8"
                onChange={(e) => {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === message.id
                        ? { ...m, content: e.target.value }
                        : m
                    )
                  );
                }}
              />

              {message.role !== "system" && (
                <div className="col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setMessages(
                        messages.filter(
                          (oldMessage) => oldMessage.id !== message.id
                        )
                      )
                    }
                  >
                    <CircleMinus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="col-span-12">
                <Separator />
              </div>
            </div>
          ))}
          <Button
            variant="ghost"
            className="flex justify-start"
            onClick={() => {
              setMessages([
                ...messages,
                {
                  role:
                    messages.slice(-1)[0].role === "user"
                      ? "assistant"
                      : "user",
                  content: "",
                  id: uuidv4(),
                },
              ]);
            }}
          >
            <CirclePlus className="h-4 w-4 mr-2" />
            New Message
          </Button>

          <div></div>
        </div>
      </div>
    </ScrollArea>
  );
}

function ComparePanel({
  models,
  modelsToCompare,
  setModelsToCompare,
}: {
  models: (typeof api.myFunctions.getModels)["_returnType"];
  modelsToCompare: ModelsToCompareType;
  setModelsToCompare: Dispatch<SetStateAction<ModelsToCompareType>>;
}) {
  const [selectedModel, setSelectedModel] = useState<string>("");

  return (
    <ScrollArea className="h-full p-4 overflow-auto">
      <div className="flex flex-col gap-4">
        <p className="font-bold">Select models</p>
        <div className="flex flex-col gap-2">
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
                    <SelectItem value={model._id} key={model._id}>
                      <div className="flex flex-row gap-2 items-center">
                        <Image
                          src={`/${model.provider.name}.png`}
                          height={10}
                          width={10}
                          alt={`${model.provider.name} logo`}
                          className="h-4 w-4 rounded-[2px]"
                          unoptimized
                        />
                        {`(${model.provider.name}) ${model.llm}`}
                      </div>
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
                  (model) => selectedModel === model._id
                );
                if (foundModel) {
                  setModelsToCompare([
                    ...modelsToCompare,
                    { ...foundModel, uuid: uuidv4() },
                  ]);
                  setSelectedModel("");
                }
              }}
            >
              <CirclePlus className="h-4 w-4" />
            </Button>
          </div>

          {modelsToCompare.map((model) => (
            <Card key={model.uuid}>
              <CardContent className="text-sm p-4">
                <div className="flex flex-row justify-between items-center">
                  <div className="flex flex-row gap-2 items-center">
                    <Image
                      src={`/${model.provider.name}.png`}
                      height={10}
                      width={10}
                      alt={`${model.provider.name} logo`}
                      className="h-4 w-4 rounded-[2px]"
                      unoptimized
                    />
                    <p className="font-bold">{`(${model.provider.name}) ${model.llm}`}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5"
                    onClick={() =>
                      setModelsToCompare(
                        modelsToCompare.filter((m) => m.uuid !== model.uuid)
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
      </div>
    </ScrollArea>
  );
}
