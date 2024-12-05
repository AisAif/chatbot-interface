/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import fetchClient from "../libs/axios";

export const useCreateChat = () =>
  useMutation({
    mutationFn: async ({ title, messages }: { title?: string; messages: any[] }) =>
      (
        await fetchClient().post(`v1/chats/new`, {
          chat: {
            title: title || "New Chat",
            models: ["gpt-4"],
            messages: messages,
          },
        })
      ).data,
  });

export const useUpdateChat = () =>
  useMutation({
    mutationFn: async ({ id, messages }: { id: string; messages: any[] }) =>
      (
        await fetchClient().post(`v1/chats/${id}`, {
          chat: {
            messages: messages,
          },
        })
      ).data,
  });
