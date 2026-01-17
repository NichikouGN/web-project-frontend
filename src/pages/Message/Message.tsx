import { useEffect, useState } from "react";
import styles from "./Message.module.css";
import { useAuthStore } from "../../stores/authStore";
import MessageSidebar from "./MessageSidebar";
import MessageWindow from "./MessageWindow";
import { useParams } from "react-router-dom";
import { fetchWithAuth } from "../../api/fetchWithAuth";

export interface ChatSidebarItemType {
  conversationId: string;
  chatName: string;
  lastMessage: {
    role: "sender" | "receiver";
    content: string;
  };
}

export interface ChatContentType {
  role: "sender" | "receiver";
  message: string;
}

const chatListDummyData: ChatSidebarItemType[] = [
  {
    conversationId: "1",
    chatName: "Alice",
    lastMessage: {
      role: "receiver",
      content: "See you later!",
    },
  },
  {
    conversationId: "2",
    chatName: "Bob",
    lastMessage: {
      role: "sender",
      content: "Don't forget the meeting tomorrow.",
    },
  },
];

const chatContentDummyData: ChatContentType[] = [
  {
    role: "receiver",
    message: "Hello! How are you?",
  },
  {
    role: "sender",
    message: "I'm good, thanks! And you?",
  },
  {
    role: "receiver",
    message: "Doing well, thank you!",
  },
];

const Message = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { conversationId } = useParams<string>();

  const [chatPage, setChatPage] = useState<number>(1);
  const [chatList, setChatList] = useState<ChatSidebarItemType[]>(chatListDummyData);
  const [chatContent, setChatContent] = useState<ChatContentType[]>(chatContentDummyData);

  useEffect(() => {
    const fetchSidebarChats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/chats?page=${chatPage}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch chats");

        const data = await res.json();
        setChatList((prev) => [...prev, ...data.chats]);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSidebarChats();
  }, [accessToken, chatPage]);

  useEffect(() => {
    if (!conversationId) {
      setChatContent([]);
      return;
    }

    const fetchChatContent = async () => {
      try {
        const res = await fetchWithAuth(
          `${import.meta.env.VITE_API_URL}/messages/${conversationId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch chat content");

        const data = await res.json();
        setChatContent(data.messages);
      } catch (error) {
        setChatContent([]);
        console.error(error);
      }
    };
    fetchChatContent();
  }, [conversationId, accessToken]);

  return (
    <main className={styles["chat-body"]}>
      <MessageSidebar
        chatList={chatList}
        currentChatId={conversationId}
        setChatPage={setChatPage}
      />
      <MessageWindow
        currentChat={chatList.find((chat) => chat.conversationId === conversationId)}
        chatContent={chatContent}
        setChatContent={setChatContent}
      />
    </main>
  );
};

export default Message;
