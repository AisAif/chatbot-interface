/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import fetchClient from "../libs/axios";

export const useSendMessage = () =>
  useMutation({
    mutationFn: async ({ messages }: { messages: any[] }) => {
      const result = (
        await fetchClient().post(`chat/completions`, {
          model: "gpt-4",
          chat_id: sessionStorage.getItem("chatId"),
          messages: messages.map((message: any) => ({
            content: message.content,
            role: message.role,
          })),
        })
      ).data;

      return result;
    },
  });

export const useUpdateChat = () =>
  useMutation({
    mutationFn: async ({ messages }: { messages: any[] }) =>
      (
        await fetchClient().post(
          `v1/chats/${sessionStorage.getItem("chatId")}`,
          {
            chat: {
              messages: messages,
            },
          }
        )
      ).data,
  });
