import { useQuery } from "@tanstack/react-query";
import fetchClient from "../libs/axios";

export const useGetChat = () =>
  useQuery({
    queryKey: ["chat"],
    queryFn: async () =>
      (await fetchClient().get(`v1/chats/${sessionStorage.getItem("chatId")}`))
        .data,
  });
