"use client";

import { Backspace, PaperPlaneTilt } from "@phosphor-icons/react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const STORE_NAME = "Rashmi Beauty Saloon";

export default function Root() {
  const [isStarted, setIsStarted] = useState<boolean>(false);

  return (
    <div className="h-full w-full drop-shadow-lg bg-white relative sm:w-[min(440px,_100%)] sm:h-[min(600px,_100%)] sm:rounded-2xl">
      {isStarted ? (
        <Chat
          reset={() => {
            setIsStarted(false);
          }}
        />
      ) : (
        <StartScreen setIsStarted={setIsStarted} />
      )}
    </div>
  );
}

export type Message =
  | string
  | { stage: "INFORMATION"; content: string }
  | {
      stage: "SCHEDULED";
      content: string;
      data: any;
    };

const stageLabels = {
  INFORMATION: "Information",
  SCHEDULED: "Scheduled",
};

type ChatProps = {
  reset: () => void;
};
function Chat({ reset }: ChatProps) {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const currentStage = useMemo(() => {
    return (
      (messages.filter((message) => typeof message !== "string") as any).at(-1)
        ?.stage ?? "INFORMATION"
    );
  }, [messages]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleMessage = useCallback(
    async (message: string, retry: boolean = true) => {
      setIsLoading(true);
      try {
        const response = await fetch("api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: [...messages, message] }),
        });

        const data = await response.json();
        const { output } = data;

        setMessages((prevMessages) => [...prevMessages, message, output]);
      } catch (error) {
        console.error(error);

        if (retry) {
          await handleMessage(message, false);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [messages],
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const formRef = e.currentTarget as HTMLFormElement;

    const formData = new FormData(formRef);
    const message = formData.get("message")?.toString();

    if (message) {
      await handleMessage(message);
      formRef.reset();
    }
  };

  const messagesDivRef = useRef<HTMLDivElement>(null);

  const ranOnesRef = useRef(false);

  useEffect(() => {
    if (messages.length && messagesDivRef.current) {
      messagesDivRef.current.scrollTo(0, messagesDivRef.current.scrollHeight);
    }
  }, [messages]);

  useEffect(() => {
    if (!ranOnesRef.current) {
      handleMessage("Hey!");

      ranOnesRef.current = true;
    }
  }, [handleMessage]);

  console.table(messages);

  return (
    <div className="flex flex-col items-stretch justify-start divide-y divide-blue-950/20 h-full">
      <div className="shrink-0 p-4 w-full flex flex-row items-center justify-center gap-2 relative">
        <button
          className="absolute left-4"
          onClick={() => {
            setMessages([]);
            reset();
          }}
        >
          <Backspace size={18} className="text-red-500 hover:opacity-50" />
        </button>
        <div className="flex flex-col items-center justify-center gap-1">
          <p className="text-sm/none font-bold uppercase">{STORE_NAME}</p>
          <p className="text-xs/none font-medium opacity-50">
            {stageLabels[currentStage as keyof typeof stageLabels] ?? "Unknown"}
          </p>
        </div>
      </div>

      <div
        ref={messagesDivRef}
        className="flex-1 p-4 overflow-y-auto flex flex-col items-stretch justify-start gap-2 scroll-smooth"
      >
        {messages.map((message, i) => {
          if (typeof message === "string") {
            return (
              <p
                key={i}
                className="text-sm px-3 py-1.5 rounded-xl border border-current/50 bg-green-50 text-green-500 w-3/4 ml-auto break-words"
              >
                {message}
              </p>
            );
          }

          return (
            <div
              key={i}
              className="text-sm px-3 py-1.5 rounded-xl border border-current/50 text-blue-500 w-3/4 break-words"
            >
              {message.stage === "INFORMATION" ? (
                message.content
              ) : message.stage === "SCHEDULED" ? (
                <span className="font-bold text-base">{message.content}</span>
              ) : null}
            </div>
          );
        })}
      </div>

      <form
        className="shrink-0 p-4 flex flex-row items-stretch justify-between gap-2"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          name="message"
          placeholder="Chat here..."
          className="flex-1 font-medium text-base/none py-2 px-4 rounded-xl bg-blue-50 text-blue-500 border border-current/50 transition-shadow focus:outline-none focus-visible:shadow-md placeholder:text-blue-950/50 disabled:opacity-75 disabled:cursor-not-allowed"
          autoFocus
          autoComplete="off"
          disabled={isLoading}
          required
        />
        <button
          type="submit"
          className="shrink-0 font-medium text-base/none py-2 px-4 rounded-xl bg-blue-500 text-blue-50 hover:scale-105 transition-transform disabled:opacity-75 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <PaperPlaneTilt size={16} />
        </button>
      </form>
    </div>
  );
}

type StartScreenProps = {
  setIsStarted: React.Dispatch<React.SetStateAction<boolean>>;
};
function StartScreen({ setIsStarted }: StartScreenProps) {
  return (
    <div className="flex flex-col items-stretch justify-center h-full gap-16 p-4">
      <h1 className="text-base/none uppercase text-center text-blue-950 font-black">
        Bot9 Demo
      </h1>

      <h2 className="text-6xl/none font-bold text-center text-pretty text-blue-950">
        {STORE_NAME}
      </h2>

      <div className="flex flex-row items-center justify-center gap-2 flex-wrap">
        <button
          onClick={() => setIsStarted(true)}
          className="font-medium text-lg/none py-2 px-4 rounded-xl bg-blue-50 text-blue-500 border border-current/50 hover:scale-105 transition-transform"
        >
          Chat
        </button>
      </div>
    </div>
  );
}
