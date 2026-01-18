import { IoSend } from "react-icons/io5";
import styles from "./Message.module.css";
import { useEffect, useRef, useState } from "react";
import { fetchWithAuth } from "../../api/fetchWithAuth";
import type { ChatSidebarItemType } from "./Message";
import { Toast } from "../../stores/toastStore";
import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface MessageWindowProps {
  currentChat: ChatSidebarItemType | undefined;
  chatContent: {
    role: "sender" | "receiver";
    content: string;
  }[];
  setChatContent: React.Dispatch<
    React.SetStateAction<
      {
        role: "sender" | "receiver";
        content: string;
      }[]
    >
  >;
  draftMode?: boolean;
}

const MessageWindow = ({
  currentChat,
  chatContent,
  setChatContent,
  draftMode,
}: MessageWindowProps) => {
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatContent, currentChat]);

  const handleInputMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleMessageSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChat) return;
    if (!inputMessage.trim()) return;

    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/messages/${currentChat?.conversationId}/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: inputMessage }),
        },
      );

      if (!res.ok) {
        Toast({ type: "error", message: "Failed to send message." });
        return;
      }

      const data = await res.json();

      if (draftMode) {
        navigate(`/messages/${data.conversationId}`);
      }

      setChatContent((prevContent) => [...prevContent, { role: "sender", content: inputMessage }]);
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
            <img
              src={currentChat.avatarUrl}
              alt={currentChat.username}
              className={styles["message-header-avatar"]}
            />
            <h2>{currentChat.username}</h2>
          </div>
          <ul className={styles["message-content-list"]}>
            {chatContent.map((chat, index) => {
              const prevChat = chatContent[index - 1];
              const isNewGroup = !prevChat || prevChat.role !== chat.role;

              return (
                <li
                  key={index}
                  className={`${styles["message-item"]}
                 ${chat.role === "sender" ? styles["sender"] : styles["receiver"]}
                 ${isNewGroup ? styles["new-group"] : ""}`}
                >
                  {chat.role === "receiver" && currentChat?.avatarUrl ? (
                    <img
                      src={currentChat.avatarUrl}
                      alt={currentChat.username}
                      className={`${styles["message-item-avatar"]} ${!isNewGroup ? styles["new-group-image"] : ""}`}
                    />
                  ) : (
                    chat.role === "receiver" && (
                      <FaUser
                        className={`${styles["message-item-avatar"]} ${!isNewGroup ? styles["new-group-image"] : ""}`}
                      />
                    )
                  )}
                  <div className={styles["message-item-content-container"]}>
                    {chat.role === "receiver" && isNewGroup && (
                      <div className={styles["message-item-username"]}>{currentChat.username}</div>
                    )}
                    <div
                      className={`${styles["message-item-content"]}
                 ${chat.role === "sender" ? styles["sender"] : styles["receiver"]}`}
                    >
                      {chat.content}
                    </div>
                  </div>
                </li>
              );
            })}
            {scrollRef.current && <div ref={scrollRef} />}
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
