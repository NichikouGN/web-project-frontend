import { IoSend } from "react-icons/io5";
import styles from "./Message.module.css";
import { useEffect, useRef, useState } from "react";
import { fetchWithAuth } from "../../api/fetchWithAuth";
import { Toast } from "../../stores/toastStore";
import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import type { ChatSidebarItemType } from "./Message";

interface MessageWindowProps {
  conversationId?: string;
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
  draftModeCurrentChat?: ChatSidebarItemType;
  draftMode?: boolean;
}

const MessageWindow = ({
  conversationId,
  chatContent,
  setChatContent,
  draftModeCurrentChat,
  draftMode,
}: MessageWindowProps) => {
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState<string>("");
  const scrollRef = useRef<HTMLLIElement | null>(null);
  const [chatMeta, setChatMeta] = useState<{
    username: string;
    avatarUrl: string;
  } | null>(null);

  useEffect(() => {
    const fetchCurrentChat = async () => {
      if (draftMode && draftModeCurrentChat) {
        setChatMeta({
          username: draftModeCurrentChat.username,
          avatarUrl: draftModeCurrentChat.avatarUrl,
        });
        return;
      }

      if (!conversationId) return;

      try {
        const res = await fetchWithAuth(
          `${import.meta.env.VITE_API_URL}/api/messages/${conversationId}/meta`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!res.ok) throw new Error("Failed to fetch chat info");

        const data = await res.json();
        setChatMeta({
          username: data.username,
          avatarUrl: data.avatarUrl,
        });
      } catch (error) {
        console.error("Failed to fetch current chat info:", error);
      }
    };

    fetchCurrentChat();
  }, [conversationId, draftMode, draftModeCurrentChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatContent, conversationId]);

  const handleInputMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleMessageSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      if (draftMode) {
        console.log("Sending message in draft mode");
        const res = await fetchWithAuth(
          `${import.meta.env.VITE_API_URL}/api/messages/new/${draftModeCurrentChat?.conversationId.split("/")[1]}/send`,
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

        navigate(`/messages/${data.conversationId}`);

        setChatContent((prevContent) => [
          ...prevContent,
          { role: "sender", content: inputMessage },
        ]);
        setInputMessage("");
        return;
      }

      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/messages/${conversationId}/send`,
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

      setChatContent((prevContent) => [...prevContent, { role: "sender", content: inputMessage }]);
      setInputMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <section className={styles["message-content"]}>
      {chatMeta ? (
        <>
          <div className={styles["message-header"]}>
            {chatMeta.avatarUrl ? (
              <img
                src={chatMeta.avatarUrl}
                alt={chatMeta.username}
                className={styles["message-header-avatar"]}
              />
            ) : (
              <FaUser className={styles["message-header-icon"]} />
            )}
            <h2>{chatMeta.username}</h2>
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
                  {chat.role === "receiver" && chatMeta?.avatarUrl ? (
                    <img
                      src={chatMeta.avatarUrl}
                      alt={chatMeta.username}
                      className={`${styles["message-item-avatar"]} ${!isNewGroup ? styles["new-group-image"] : ""}`}
                    />
                  ) : (
                    chat.role === "receiver" && (
                      <FaUser
                        className={`${styles["message-item-icon"]} ${!isNewGroup ? styles["new-group-image"] : ""}`}
                      />
                    )
                  )}
                  <div className={styles["message-item-content-container"]}>
                    {chat.role === "receiver" && isNewGroup && (
                      <div className={styles["message-item-username"]}>{chatMeta.username}</div>
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
            <li ref={scrollRef} />
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
