import { Chat } from "@/types/chat";

const ChatList = ({
  chats,
  onChatId,
  setOnChatId,
}: {
  chats: Chat[];
  onChatId: string | undefined;
  setOnChatId: React.Dispatch<React.SetStateAction<string | undefined>>;
}) => {
  return (
    <div className="flex flex-col justify-start items-center border-2 bg-[#FFFFFF] rounded-md h-full w-1/4 p-8 gap-8 overflow-auto">
      <h1 className="text-lg font-bold text-slate-600">ChatList</h1>
      <button
        onClick={() => setOnChatId(undefined)}
        className="bg-slate-800 text-white rounded-md w-full py-2"
      >
        Create Chat
      </button>
      <div className="border-b-2 w-full" />
      <div className="flex flex-col w-full">
        {chats?.map((chat) => (
          <button
            key={chat.id}
            onClick={() => setOnChatId(chat.id)}
            className={`flex flex-row items-center gap-4 ${
              onChatId === chat.id ? "bg-blue-100" : ""
            } rounded-md p-4 font-bold text-slate-600 text-start`}
          >
            {chat.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
