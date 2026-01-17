import { IoSend } from "react-icons/io5";
import styles from "./Message.module.css";
import { useState } from "react";
import { fetchWithAuth } from "../../api/fetchWithAuth";
import type { ChatSidebarItemType } from "./Message";
import { Toast } from "../../stores/toastStore";

interface MessageWindowProps {
  currentChat: ChatSidebarItemType | undefined;
  chatContent: {
    role: "sender" | "receiver";
    message: string;
  }[];
  setChatContent: React.Dispatch<
    React.SetStateAction<
      {
        role: "sender" | "receiver";
        message: string;
      }[]
    >
  >;
}

const MessageWindow = ({ currentChat, chatContent, setChatContent }: MessageWindowProps) => {
  const [inputMessage, setInputMessage] = useState<string>("");

  const handleInputMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleMessageSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChat) return;
    if (!inputMessage.trim()) return;

    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/messages/${currentChat?.conversationId}/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: inputMessage }),
        }
      );

      if (!res.ok) {
        Toast({ type: "error", message: "Failed to send message." });
        return;
      }

      setChatContent((prevContent) => [...prevContent, { role: "sender", message: inputMessage }]);
      setInputMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
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
          <form className={styles["message-form-section"]} onSubmit={handleMessageSend}>
            <input
              type="text"
              className={styles["message-input"]}
              placeholder="Type your message..."
              value={inputMessage}
              onChange={handleInputMessageChange}
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
  );
};

export default MessageWindow;
