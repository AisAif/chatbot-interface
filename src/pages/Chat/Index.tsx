import { useGetChats } from "@/features/queries";
import ChatList from "./ChatList";
import Conversation from "./Conversation";
import { useState } from "react";

function Chat() {
  const { data: chats, isLoading: isChatLoading, refetch: refetchChats } = useGetChats();
  const [onChatId, setOnChatId] = useState<string | undefined>();

  return (
    <div className="bg-gray-100 max-w-screen max-h-screen h-screen p-8 flex justify-between items-start">
      {isChatLoading ? (
        <div>Loading...</div>
      ) : (
        chats && (
          <>
            <ChatList {...{ chats, onChatId, setOnChatId }} />
            <Conversation {...{ onChatId, setOnChatId, refetchChats }} />
          </>
        )
      )}
    </div>
  );
}

export default Chat;
