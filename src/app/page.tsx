"use client";

import { Backspace, PaperPlaneTilt } from "@phosphor-icons/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useChat } from "ai/react";

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

const stageLabels = {
  INFORMATION: "Information",
  SCHEDULED: "Scheduled",
};

type ChatProps = {
  reset: () => void;
};
function Chat({ reset }: ChatProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    append,
  } = useChat({
    api: "/api/chat",
    async experimental_onToolCall(chatMessages, toolCalls) {
      const tool = toolCalls.at(0);

      if (
        tool &&
        typeof tool !== "string" &&
        tool.function.name === "schedule_appointment"
      ) {
        localStorage.setItem(
          "appointments",
          JSON.stringify([
            JSON.parse(tool.function.arguments),
            ...JSON.parse(localStorage.getItem("appointments") ?? "[]"),
          ]),
        );
      }

      return {
        messages: [...chatMessages],
      };
    },
  });

  const currentStage = useMemo(() => {
    const last = messages.at(-1)!;
    return last?.tool_calls && last.tool_calls.length
      ? "SCHEDULED"
      : "INFORMATION";
  }, [messages]);

  const messagesDivRef = useRef<HTMLDivElement>(null);

  const ranOnesRef = useRef(false);

  useEffect(() => {
    if (messages.length && messagesDivRef.current) {
      messagesDivRef.current.scrollTo(0, messagesDivRef.current.scrollHeight);
    }
  }, [messages]);

  useEffect(() => {
    if (!ranOnesRef.current) {
      append({
        role: "user",
        content: "Hey!",
      });

      ranOnesRef.current = true;
    }
  }, [append]);

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
          if (message.role === "user") {
            return (
              <p
                key={i}
                className="text-sm px-3 py-1.5 rounded-xl border border-current/50 bg-green-50 text-green-500 w-3/4 ml-auto break-words"
              >
                {message.content}{" "}
              </p>
            );
          }

          if (message.tool_calls) {
            const tool = message.tool_calls.at(0);

            if (
              tool &&
              typeof tool !== "string" &&
              tool.function.name === "schedule_appointment"
            ) {
              return (
                <p
                  key={i}
                  className="text-base font-medium px-3 py-1.5 rounded-xl border border-current/50 text-blue-500 w-full break-words"
                >
                  Your appointment has been scheduled successfully!
                </p>
              );
            }
          }

          return (
            <p
              key={i}
              className="text-sm px-3 py-1.5 rounded-xl border border-current/50 text-blue-500 w-3/4 break-words"
            >
              {message.content}
            </p>
          );
        })}
      </div>

      <form
        className="shrink-0 p-4 flex flex-row items-stretch justify-between gap-2"
        onSubmit={handleSubmit}
      >
        <fieldset
          disabled={isLoading || currentStage === "SCHEDULED"}
          className="contents"
        >
          <input
            type="text"
            name="message"
            placeholder="Chat here..."
            className="flex-1 font-medium text-base/none py-2 px-4 rounded-xl bg-blue-50 text-blue-500 border border-current/50 transition-shadow focus:outline-none focus-visible:shadow-md placeholder:text-blue-950/50 disabled:opacity-75 disabled:cursor-not-allowed"
            autoFocus
            autoComplete="off"
            required
            onChange={handleInputChange}
            value={input}
          />
          <button
            type="submit"
            className="shrink-0 font-medium text-base/none py-2 px-4 rounded-xl bg-blue-500 text-blue-50 hover:scale-105 transition-transform disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <PaperPlaneTilt size={16} />
          </button>
        </fieldset>
      </form>
    </div>
  );
}
type StartScreenProps = {
  setIsStarted: React.Dispatch<React.SetStateAction<boolean>>;
};
function StartScreen({ setIsStarted }: StartScreenProps) {
  const [appointments, setAppointments] = useState<any[]>([]);

  useLayoutEffect(() => {
    setAppointments(JSON.parse(localStorage.getItem("appointments") ?? "[]"));
  }, []);

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
          Chat & Book
        </button>
      </div>

      <div className="overflow-auto flex flex-col items-stretch justify-start gap-4 border-t border-blue-950/20 pt-4 border-dashed">
        <p className="font-semibold text-sm/none uppercase text-blue-500 text-center">
          Prev. Appointments
        </p>

        {appointments.length ? (
          appointments.map((appointment, i) => {
            return (
              <div
                key={i}
                className="flex flex-col items-stretch justify-start gap-2 px-4 py-2 border border-blue-950/5 rounded-lg"
              >
                <p className="text-sm/none font-medium">{appointment.name}</p>
                <p className="text-sm/none">
                  {appointment.plan} → {appointment.date_time}
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-blue-950/50 text-xs/none font-medium text-center">
            None
          </p>
        )}
      </div>
    </div>
  );
}
