import React, { useEffect } from "react";
import styles from "./Message.module.css";
import { FaUser } from "react-icons/fa";
import { useAuthStore } from "../../stores/authStore";
import { IoSend } from "react-icons/io5";

interface ChatSidebarItemType {
  chatId: string;
  chatName: string;
  lastMessage: {
    role: "sender" | "receiver";
    content: string;
  };
}

interface ChatContentListType {
  role: "sender" | "receiver";
  message: string;
}

const Message = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [currentChat, setCurrentChat] = React.useState<Omit<
    ChatSidebarItemType,
    "lastMessage"
  > | null>(null);
  const [chatContent, setChatContent] = React.useState<ChatContentListType[]>([]);
  const [chatList, setChatList] = React.useState<ChatSidebarItemType[]>([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/chats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch chats");

        const data = await res.json();
        setChatList(data.chatList);
      } catch (error) {
        console.error(error);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    const fetchChatContent = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/chats/${currentChat?.chatId}/messages`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json", authorization: `Bearer ${accessToken}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch chat content");
        const data = await res.json();
        setChatContent(data.chatContent);
      } catch (error) {
        console.error(error);
      }
    };
    fetchChatContent();
  }, [currentChat]);

  return (
    <main className={styles["chat-body"]}>
      <section className={styles["chat-sidebar"]}>
        {chatList.length === 0 ? (
          <p className={styles["no-chats-available"]}>No chats available.</p>
        ) : (
          chatList.map((chat) => (
            <div
              key={chat.chatId}
              className={`${styles["chat-sidebar-item"]} ${
                currentChat?.chatId === chat.chatId ? styles["chat-active"] : ""
              }`}
              onClick={() => setCurrentChat({ chatId: chat.chatId, chatName: chat.chatName })}
            >
              <FaUser className={styles["chat-sidebar-item-icon"]} />
              <div className={styles["chat-sidebar-item-info"]}>
                <h2>{chat.chatName}</h2>
                <p>
                  {chat.lastMessage.role === "sender" ? "You: " : ""}
                  {chat.lastMessage.content}
                </p>
              </div>
            </div>
          ))
        )}
      </section>
      <section className={styles["message-content"]}>
        {currentChat ? (
          <>
            <div className={styles["message-header"]}>
              <h2>{currentChat?.chatName}</h2>
            </div>
            <ul className={styles["message-content-list"]}>
              {chatContent.map((chat, index) => (
                <li
                  key={index}
                  className={`${styles["message-item"]}
                 ${chat.role === "sender" ? styles["sender"] : styles["receiver"]}`}
                >
                  {chat.message}
                </li>
              ))}
            </ul>
            <form className={styles["message-form-section"]}>
              <input
                type="text"
                className={styles["message-input"]}
                placeholder="Type your message..."
              />
              <button type="submit" className={styles["message-send-button"]}>
                <IoSend />
              </button>
            </form>
          </>
        ) : (
          <p className={styles["no-chats-available"]}>Select a chat to start messaging.</p>
        )}
      </section>
    </main>
  );
};

export default Message;
