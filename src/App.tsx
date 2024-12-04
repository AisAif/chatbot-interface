/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";
import { useGetChat } from "./features/queries";
import { useEffect, useState } from "react";
import { useUpdateChat } from "./features/mutations";
import delay from "./helpers/delay";

function App() {
  const { data, isLoading, refetch } = useGetChat();
  const { mutate: updateChat } = useUpdateChat();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<any>({
    role: "user",
    content: "",
  });
  const [onSend, setOnSend] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    if (data) {
      setMessages(data.chat.messages);
    }
  }, [data]);

  useEffect(() => {
    if (messages.length > 0 && onSend === "done") {
      updateChat({ messages }, { onSuccess: refetch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    console.log({ onSend });

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
    <div className="bg-gray-100 max-w-screen max-h-screen h-screen p-8 flex justify-center items-center">
      <MainContainer className="rounded-md py-4 px-0  max-w-[500px] max-h-full">
        <ChatContainer>
          <MessageList>
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
                          message.role === "assistant"
                            ? "incoming"
                            : "outgoing",
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
    </div>
  );
}

export default App;
