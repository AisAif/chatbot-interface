/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import fetchClient from "../libs/axios";

export const useUpdateChat = () =>
  useMutation({
    mutationFn: async ({ messages }: { messages: any[] }) =>
      (
        await fetchClient().post(
          `v1/chats/${localStorage.getItem("chatId")}`,
          {
            chat: {
              messages: messages,
            },
          }
        )
      ).data,
  });
