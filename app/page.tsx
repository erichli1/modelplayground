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
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  ChevronDown,
  ChevronUp,
  CircleMinus,
  CirclePlus,
  Eraser,
  Eye,
  EyeOff,
  Info,
  SquareRadical,
} from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { Message, ModelOutput } from "@/convex/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PossibleBenchmarks, benchmarks } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMedia } from "react-use";

type ModelsToCompareType = Array<
  (typeof api.myFunctions.getModels)["_returnType"][0] & {
    uuid: string;
    output?: ModelOutput;
  }
>;

const defaultMessages: Array<Message & { id: string }> = [
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
];

export default function Home() {
  const isWide = useMedia("(min-width: 640px)", true);
  const [displaySmallWarning, setDisplaySmallWarning] =
    useState<boolean>(false);

  const providers = useQuery(api.myFunctions.getProviders);
  const models = useQuery(api.myFunctions.getModels);
  const runModel = useAction(api.myActions.runModel);
  const trackUsageStats = useMutation(api.myFunctions.trackUsageStats);

  const [apiKeys, setApiKeys] = useState<
    Array<{ provider: Doc<"providers">; key: string }>
  >([]);

  const [messages, setMessages] =
    useState<Array<Message & { id: string }>>(defaultMessages);

  const [modelsToCompare, setModelsToCompare] = useState<ModelsToCompareType>(
    []
  );

  useEffect(() => {
    if (models)
      setModelsToCompare(
        models
          .filter((model) => model.default)
          .map((model) => ({ ...model, uuid: uuidv4() }))
      );
  }, [models]);

  useEffect(() => {
    if (providers)
      setApiKeys(providers.map((provider) => ({ provider, key: "" })));
  }, [providers]);

  const updateModelOutput = ({
    modelToCompareUuid,
    output,
  }: {
    modelToCompareUuid: string;
    output: ModelOutput;
  }) => {
    setModelsToCompare((prev) => {
      const updatedModels = prev.map((model) =>
        model.uuid === modelToCompareUuid ? { ...model, output } : model
      );
      return updatedModels;
    });
  };

  useEffect(() => {
    setDisplaySmallWarning(!isWide);
  }, [isWide]);

  if (displaySmallWarning)
    return (
      <div className="flex flex-col items-center text-center justify-center h-screen mx-auto px-2 gap-2">
        <p>
          model playground is a tool to help you compare model outputs across
          different LLMs and providers based on quality, speed, and cost.
          Unfortunately, it doesn&apos;t work quite right on smaller screens so
          please use a larger one! Here&apos;s a quick demo though :)
        </p>
        <video
          src="/modelplayground.mp4"
          autoPlay
          playsInline
          className="w-full"
          controls
          muted
        />
      </div>
    );

  if (providers === undefined || models === undefined)
    return (
      <div className="flex items-center justify-center h-screen mx-auto">
        Loading models...
      </div>
    );

  const runTests = async () => {
    await trackUsageStats({
      modelStrings: modelsToCompare.map((m) => `(${m.provider.name}) ${m.llm}`),
    }).catch(console.error);
    await Promise.all(
      modelsToCompare.map((model) => {
        const identifiedApiKey = apiKeys.find(
          (apiKey) => apiKey.provider._id === model.provider._id
        )?.key;
        if (identifiedApiKey === undefined) return Promise.resolve();

        updateModelOutput({
          modelToCompareUuid: model.uuid,
          output: "loading",
        });

        return runModel({
          providerId: model.provider._id,
          modelId: model._id,
          messages: messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          apiKey: identifiedApiKey,
        }).then((output) => {
          updateModelOutput({ modelToCompareUuid: model.uuid, output });
        });
      })
    );
  };

  return (
    <>
      <main className="h-screen flex flex-col">
        <header className="px-4 py-2 border-b">
          <div className="flex flex-row justify-between items-center">
            <p className="font-bold">model playground</p>
            <Dialog>
              <DialogTrigger>
                <Button variant="outline" className="h-7 shadow-md">
                  <Info className="h-4 w-4 mr-2" />
                  Instructions
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>model playground instructions</DialogTitle>
                  <DialogDescription>
                    <p>
                      Hi! I&apos;m Eric, a CS student who built this because I
                      wanted a way to easily compare different LLMs hosted on
                      different providers based on output quality, speed, and
                      cost. Here&apos;s how it works:
                    </p>
                    <br />
                    <ol className="list-decimal ml-8">
                      <li>
                        Add API keys (we never store this! all our code is
                        public{" "}
                        <a
                          href="https://github.com/erichli1/llmcompare"
                          target="_blank"
                          className="underline text-blue-500"
                        >
                          here
                        </a>
                        ).
                      </li>
                      <li>
                        <span>
                          Add prompts (or choose from one of our suggested
                          multiple choice
                        </span>
                        <Brain className="h-3.5 inline" />
                        <span>or math reasoning</span>
                        <SquareRadical className="h-3.5 inline" />
                        <span>benchmarks)</span>
                      </li>
                      <li>Select models to compare</li>
                      <li>Hit &quot;Run&quot; at the bottom!</li>
                    </ol>
                    <br />
                    <p>
                      P.S. I&apos;m working on a more robust webapp to help you
                      iterate and test prompts so stay tuned for that!
                    </p>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </header>
        <ResizablePanelGroup direction="horizontal" className="w-full">
          <ResizablePanel defaultSize={15} className="flex flex-col">
            <APIKeysPanel
              // providers={providers}
              apiKeys={apiKeys}
              setApiKeys={setApiKeys}
            />
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
              <Button
                onClick={() => {
                  runTests().catch(console.error);
                }}
              >
                Run
              </Button>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={35}>
            <ComparePanel
              models={models}
              modelsToCompare={modelsToCompare}
              setModelsToCompare={setModelsToCompare}
              apiKeys={apiKeys}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </>
  );
}

function APIKeysPanel({
  apiKeys,
  setApiKeys,
}: {
  apiKeys: Array<{ provider: Doc<"providers">; key: string }>;
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
        <div className="flex flex-row gap-2 items-center">
          <p className="font-bold">Add API keys</p>

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowKeys(!showKeys)}
                  className="h-full w-full"
                >
                  {showKeys ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{showKeys ? "Hide API keys" : "Show API keys"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {apiKeys.map((apiKey) => (
          <div
            className="grid w-full items-center gap-1.5 px-0.5"
            key={`api-key-provider-${apiKey.provider._id}`}
          >
            <Label>
              <div className="flex flex-row gap-1 items-center">
                <Image
                  src={`/${apiKey.provider.name}.png`}
                  height={10}
                  width={10}
                  alt={`${apiKey.provider.name} logo`}
                  className="h-4 w-4 rounded-[2px]"
                  unoptimized
                />
                {apiKey.provider.name}
              </div>
            </Label>
            <Input
              type={showKeys ? "text" : "password"}
              value={apiKey.key}
              onChange={(e) =>
                setApiKeys((prev) =>
                  prev.map((p) =>
                    p.provider._id === apiKey.provider._id
                      ? { ...p, key: e.target.value }
                      : p
                  )
                )
              }
            />
          </div>
        ))}
        <p className="text-xs">
          We never store these! All our code is public{" "}
          <a
            href="https://github.com/erichli1/llmcompare"
            target="_blank"
            className="underline text-blue-500"
          >
            here
          </a>{" "}
          :)
        </p>
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
  const [benchmark, setBenchmark] = useState<PossibleBenchmarks | "">("");
  const [benchmarkAnswer, setBenchmarkAnswer] = useState<string>("");

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

  const tryBenchmark = (benchmark: PossibleBenchmarks | "") => {
    if (benchmark !== "") {
      const selectedBenchmarkQA =
        benchmarks[benchmark].qa[
          Math.floor(Math.random() * benchmarks[benchmark].qa.length)
        ];

      const benchmarkMessages: Array<Message & { id: string }> = [
        {
          role: "system",
          content: benchmarks[benchmark].system,
          id: uuidv4(),
        },
        {
          role: "user",
          content: selectedBenchmarkQA.q,
          id: uuidv4(),
        },
      ];

      setBenchmark(benchmark);
      setMessages(benchmarkMessages);
      setBenchmarkAnswer(selectedBenchmarkQA.a);
    } else {
      setBenchmark("");
      setBenchmarkAnswer("");
    }
  };

  const TryBenchmarkIcon = ({
    benchmark,
  }: {
    benchmark: PossibleBenchmarks;
  }) => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>
          <Button
            variant="ghost"
            size="icon"
            className="h-full w-full"
            onClick={() => {
              tryBenchmark(benchmark);
            }}
          >
            {benchmark === "MMLU" && <Brain className="h-4 w-4" />}
            {benchmark === "GSM8K" && <SquareRadical className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Try an example from the {benchmark} benchmark dataset</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <ScrollArea className="h-full pt-4 px-4 overflow-auto">
      <div className="flex flex-col gap-4 overflow-auto">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-2 items-center">
            <p className="font-bold">Add prompt</p>
            <TryBenchmarkIcon benchmark="MMLU" />
            <TryBenchmarkIcon benchmark="GSM8K" />
          </div>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-full w-full"
                  onClick={() => {
                    setMessages(defaultMessages);
                    tryBenchmark("");
                  }}
                >
                  <Eraser className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear prompts</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {benchmark !== "" && (
          <p className="text-sm">
            You&apos;re using the {benchmark} benchmark. The answer to this
            example question is {benchmarkAnswer}
          </p>
        )}
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
                      : () => {
                          changeMessageRole({
                            id: message.id,
                            newRole:
                              message.role === "user" ? "assistant" : "user",
                          });
                          tryBenchmark("");
                        }
                  }
                >
                  {message.role.toUpperCase()}
                </Button>
              </div>

              <Textarea
                autoSize
                className="resize-none col-span-8"
                value={message.content}
                placeholder={
                  message.role === "system"
                    ? "You are a helpful assistant."
                    : `Enter the ${message.role} message here.`
                }
                onChange={(e) => {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === message.id
                        ? { ...m, content: e.target.value }
                        : m
                    )
                  );
                  tryBenchmark("");
                }}
              />

              {message.role !== "system" && (
                <div className="col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setMessages(
                        messages.filter(
                          (oldMessage) => oldMessage.id !== message.id
                        )
                      );
                      tryBenchmark("");
                    }}
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
              tryBenchmark("");
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
  apiKeys,
}: {
  models: (typeof api.myFunctions.getModels)["_returnType"];
  modelsToCompare: ModelsToCompareType;
  setModelsToCompare: Dispatch<SetStateAction<ModelsToCompareType>>;
  apiKeys: Array<{ provider: Doc<"providers">; key: string }>;
}) {
  return (
    <ScrollArea className="h-full p-4 overflow-auto">
      <div className="flex flex-col gap-4">
        <p className="font-bold">Select models</p>
        <div className="flex flex-col gap-2">
          <div className="p-0.5 flex flex-row gap-1">
            <DropdownMenu
            // value={selectedModel}
            // onValueChange={(newVal) => setSelectedModel(newVal)}
            >
              <DropdownMenuTrigger className="w-full">
                <Button variant="outline" className="w-full shadow-md">
                  <CirclePlus className="mr-2 h-4 w-4" />
                  Add model for comparison
                </Button>
                {/* <SelectValue placeholder="Select a model" /> */}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* <SelectGroup> */}
                {models.map((model) => (
                  <DropdownMenuItem
                    // value={model._id}
                    key={model._id}
                    onClick={() => {
                      setModelsToCompare([
                        ...modelsToCompare,
                        {
                          ...model,
                          uuid: uuidv4(),
                        },
                      ]);
                    }}
                    className="cursor-pointer"
                  >
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
                  </DropdownMenuItem>
                ))}
                {/* </SelectGroup> */}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* <Button
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
            </Button> */}
          </div>

          {modelsToCompare.map((model) => (
            <ModelCard
              key={model.uuid}
              model={model}
              apiKeys={apiKeys}
              onDeleteClick={() =>
                setModelsToCompare(
                  modelsToCompare.filter((m) => m.uuid !== model.uuid)
                )
              }
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}

function ModelCard({
  model,
  apiKeys,
  onDeleteClick,
}: {
  model: ModelsToCompareType[0];
  apiKeys: Array<{ provider: Doc<"providers">; key: string }>;
  onDeleteClick: () => void;
}) {
  const identifiedProviderKey = apiKeys.find(
    (apiKey) => apiKey.provider._id === model.provider._id
  );

  const [shorten, setShorten] = useState<boolean>(false);

  return (
    <Card
      key={model.uuid}
      className={identifiedProviderKey?.key === "" ? "border-red-600" : ""}
    >
      <CardContent className="text-sm p-4 flex flex-col gap-2">
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
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger className="cursor-default">
                  <p className="font-bold">{`(${model.provider.name}) ${model.llm}`}</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {model.contextWindow.toLocaleString()} context; $
                    {toFixedIfNotInteger(model.inputCostPerMillionTokens, 2)}/M
                    tokens input; $
                    {toFixedIfNotInteger(model.outputCostPerMillionTokens, 2)}/M
                    tokens output
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-row gap-1 items-center">
            {model.output && (
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={() => setShorten((prev) => !prev)}
              >
                {shorten ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-5 w-5"
              onClick={() => onDeleteClick()}
            >
              <CircleMinus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {(identifiedProviderKey?.key === "" || model.notes) && (
          <p className="italic">
            {identifiedProviderKey?.key === "" && (
              <span className="text-red-600">
                Please enter your {model.provider.name} API key.{" "}
              </span>
            )}
            {model.notes}
          </p>
        )}
        {model.output &&
          (model.output === "loading" ? (
            <p>Running model...</p>
          ) : (
            !shorten && (
              <>
                <p>
                  {(model.output.speed / 1000).toFixed(2)}s, ~$
                  {model.output.cost.toFixed(6)}
                </p>
                <p className="whitespace-pre-wrap">{model.output.output}</p>
              </>
            )
          ))}
      </CardContent>
    </Card>
  );
}

const toFixedIfNotInteger = (num: number, toFixed: number) =>
  Number.isInteger(num) ? num : num.toFixed(toFixed);
