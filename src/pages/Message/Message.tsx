import { useCallback, useEffect, useState } from "react";
import styles from "./Message.module.css";
import { useAuthStore } from "../../stores/authStore";
import MessageSidebar from "./MessageSidebar";
import MessageWindow from "./MessageWindow";
import { useParams } from "react-router-dom";
import { fetchWithAuth } from "../../api/fetchWithAuth";

export interface ChatSidebarItemType {
  conversationId: string;
  username: string;
  avatarUrl: string;
  lastMessage?: {
    content: string;
    role: "sender" | "receiver";
  };
}

export interface ChatContentType {
  role: "sender" | "receiver";
  content: string;
}

const Message = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { conversationId, userId } = useParams<string>();
  const draftMode = Boolean(userId);

  const [chatPage, setChatPage] = useState<number>(1);
  const [chatList, setChatList] = useState<ChatSidebarItemType[]>([]);
  const [chatContent, setChatContent] = useState<ChatContentType[]>([]);

  useEffect(() => {
    const fetchSidebarChats = async () => {
      try {
        const res = await fetchWithAuth(
          `${import.meta.env.VITE_API_URL}/api/messages?page=${chatPage}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${accessToken}`,
            },
          },
        );
        if (!res.ok) throw new Error("Failed to fetch chats");

        const data = await res.json();
        const chatList = data.chatList;

        console.log("Fetched sidebar chats:", chatList);

        if (draftMode) {
          const userRes = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!userRes.ok) throw new Error("Failed to fetch user profile");

          const userData = await userRes.json();

          const draftSidebarChat = {
            conversationId: "new/" + userId,
            username: userData.username,
            avatarUrl: userData.avatarUrl || "",
          };

          setChatList((prev) =>
            chatPage === 1 ? [draftSidebarChat, ...chatList] : [...prev, ...chatList],
          );
        } else {
          setChatList((prev) => (chatPage === 1 ? chatList : [...prev, ...chatList]));
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchSidebarChats();
  }, [accessToken, chatPage, draftMode, userId]);

  const fetchChatContent = useCallback(async () => {
    if (!conversationId) return;

    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/messages/${conversationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch chat content");

      const data = await res.json();
      console.log("Fetched chat content:", data.messages);
      setChatContent(data.messages);
    } catch (error) {
      setChatContent([]);
      console.error(error);
    }
  }, [conversationId, accessToken]);

  useEffect(() => {
    if (!conversationId) {
      setChatContent([]);
      return;
    }

    fetchChatContent();
  }, [fetchChatContent, conversationId]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchChatContent();
    }, 5000);
    return () => clearInterval(timer);
  }, [fetchChatContent]);

  return (
    <main className={styles["chat-body"]}>
      <MessageSidebar
        chatList={chatList}
        currentChatId={conversationId}
        setChatPage={setChatPage}
      />
      <MessageWindow
        conversationId={conversationId}
        chatContent={chatContent}
        setChatContent={setChatContent}
        draftModeCurrentChat={chatList.find((chat) => chat.conversationId === "new/" + userId)}
        draftMode={draftMode}
      />
    </main>
  );
};

export default Message;
