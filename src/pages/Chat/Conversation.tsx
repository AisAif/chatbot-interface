/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";
import { useGetChat } from "@/features/queries";
import { useCreateChat, useUpdateChat } from "@/features/mutations";
import { useEffect, useState } from "react";
import delay from "@/helpers/delay";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { Chat } from "@/types/chat";

const Conversation = ({
  onChatId,
  setOnChatId,
  refetchChats,
}: {
  onChatId: string | undefined;
  setOnChatId: React.Dispatch<React.SetStateAction<string | undefined>>;
  refetchChats: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<Chat[], Error>>;
}) => {
  const { data, isLoading, refetch } = useGetChat(onChatId || "");
  const { mutate: createChat } = useCreateChat();
  const { mutate: updateChat } = useUpdateChat();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<any>({
    role: "user",
    content: "",
  });
  const [onSend, setOnSend] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    if (onChatId) {
      refetch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setOnChatId]);

  useEffect(() => {
    if (data) {
      setMessages(data.chat.messages);
    }
  }, [data]);

  useEffect(() => {
    if (!onChatId) {
      setMessages([]);
    }
  }, [onChatId]);

  useEffect(() => {
    if (messages.length > 0 && onSend === "done") {
      if (onChatId) {
        updateChat({ id: onChatId, messages }, { onSuccess: refetch });
      } else {
        createChat(
          {
            title:
              (messages[0].content as string)
                .split(" ")
                .slice(0, 3)
                .join(" ") || "New Chat",
            messages,
          },
          {
            onSuccess: async (data) => {
              setOnChatId(data?.id);
              refetchChats();
            },
          }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    if (onSend === "done") {
      setOnSend("idle");
    }

    if (onSend !== "loading") return;
    const handleFetch = async () => {
      const response = await fetch(
        import.meta.env.VITE_PUBLIC_API_ENDPOINT + `chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            chat_id: localStorage.getItem("chatId"),
            messages: messages.map((message: any) => ({
              content: message.content,
              role: message.role,
            })),
            stream: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const stream = response.body?.getReader();
      if (!stream) return;
      setMessages([
        ...messages,
        {
          role: "assistant",
          content: "",
          model: "gpt-4",
          modelName: "Binabakat Model",
        },
      ]);
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await stream.read();
        done = readerDone;
        let remValue = "";
        if (value) {
          const chunk = decoder.decode(value, { stream: true }).split("\n");
          for (let line of chunk) {
            if (line === "data: [DONE]") return;

            if (!line.startsWith("data: ")) {
              line = remValue + line;
            }
            try {
              const message = JSON.parse(line.replace("data: ", ""));
              const chars = (
                (message.choices[0].delta.content || "") as string
              ).split("");
              for (const char of chars) {
                await delay(10);
                setMessages((prev) => {
                  return prev.map((msg, index) => {
                    if (index === prev.length - 1) {
                      return {
                        ...msg,
                        content: msg.content + char,
                      };
                    }
                    return msg;
                  });
                });
              }

              remValue = "";

              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
              remValue = line;
            }
          }
        }
      }
    };

    handleFetch().then(() => {
      setOnSend("done");
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSend]);
  return (
    <MainContainer className="rounded-md py-4 px-0 w-[70%] max-h-full">
      <ChatContainer>
        <MessageList>
          {messages.length === 0 && (
            <p className="flex justify-center items-center text-xl font-bold text-slate-600 h-full">
              You can start a conversation here
            </p>
          )}

          {!isLoading &&
            messages.map(
              (message: any, index: number) =>
                message.content !== "" && (
                  <Message
                    key={index}
                    model={{
                      type: "html",
                      message: message.content,
                      sender: message.modelName || "You",
                      direction:
                        message.role === "assistant" ? "incoming" : "outgoing",
                      position: "first",
                    }}
                  />
                )
            )}
        </MessageList>
        {!isLoading && (
          <MessageInput
            value={newMessage?.content}
            onChange={(e) =>
              setNewMessage({
                ...newMessage,
                content: e,
              })
            }
            onSend={() => {
              if (newMessage.content === "") return;
              setMessages([...messages, newMessage]);
              setNewMessage({
                role: "user",
                content: "",
              });
              setOnSend("loading");
            }}
            placeholder="Type message here"
          />
        )}
      </ChatContainer>
    </MainContainer>
  );
};

export default Conversation;
