/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import { useGetChat } from "./features/queries";
import { useEffect, useState } from "react";
import { useSendMessage, useUpdateChat } from "./features/mutations";

function App() {
  const { data, isLoading, refetch } = useGetChat();
  const { mutate: updateChat } = useUpdateChat();
  const { mutate, isPending } = useSendMessage();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<any>({
    role: "user",
    content: "",
  });

  useEffect(() => {
    if (data) {
      setMessages(data.chat.messages);
    }
  }, [data, refetch]);

  useEffect(() => {
    if (messages.length > 0) updateChat({ messages }, { onSuccess: refetch });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);
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
          {isPending && (
            <TypingIndicator content="Typing..." />
          )}
          {!isLoading && (
            <MessageInput
              value={newMessage?.content}
              onChange={(e) =>
                setNewMessage({
                  ...newMessage,
                  content: e,
                })
              }
              onSend={() =>
                mutate(
                  { messages: [...messages, newMessage] },
                  {
                    onSuccess: (data) => {
                      setMessages([
                        ...messages,
                        newMessage,
                        {
                          role: data.choices[0].message.role,
                          content: data.choices[0].message.content,
                          model: "gpt-4",
                          modelName: "Binabakat Model",
                        },
                      ]);
                      setNewMessage({
                        role: "user",
                        content: "",
                      });
                    },
                  }
                )
              }
              placeholder="Type message here"
            />
          )}
        </ChatContainer>
      </MainContainer>
    </div>
  );
}

export default App;
