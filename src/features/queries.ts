import { useQuery } from "@tanstack/react-query";
import fetchClient from "../libs/axios";
import { Chat } from "@/types/chat";

export const useGetChats = () =>
  useQuery({
    queryKey: ["chat"],
    queryFn: async () =>
      (await fetchClient().get<Chat[]>(`v1/chats/`))
        .data,
  });

export const useGetChat = (id: string) =>
  useQuery({
    queryKey: ["chat", id],
    queryFn: async () =>
      (await fetchClient().get(`v1/chats/${id}`))
        .data,
    enabled: !!id,
  });
