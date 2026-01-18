import { FaUser } from "react-icons/fa";
import type { ChatSidebarItemType } from "./Message";
import styles from "./Message.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

interface ChatSidebarProps {
  chatList: ChatSidebarItemType[];
  currentChatId?: string;
  setChatPage?: React.Dispatch<React.SetStateAction<number>>;
}
const MessageSidebar = ({ chatList, currentChatId, setChatPage }: ChatSidebarProps) => {
  const navigate = useNavigate();
  const fetchTrigger = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];

        if (target.isIntersecting && setChatPage) {
          setChatPage((prev) => prev + 1);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    if (fetchTrigger.current) observer.observe(fetchTrigger.current);

    return () => {
      if (observer) observer.disconnect();
    };
  }, [chatList, setChatPage]);

  return (
    <section className={styles["chat-sidebar"]}>
      {chatList.length === 0 ? (
        <p className={styles["no-chats-available"]}>No chats available.</p>
      ) : (
        <>
          {chatList.map((chat) => (
            <div
              key={chat.conversationId}
              className={`${styles["chat-sidebar-item"]} ${
                currentChatId === chat.conversationId ? styles["chat-active"] : ""
              }`}
              onClick={() => {
                navigate(`/messages/${chat.conversationId}`);
              }}
            >
              {chat.avatarUrl ? (
                <img
                  src={chat.avatarUrl}
                  alt={chat.username}
                  className={styles["chat-sidebar-item-avatar"]}
                />
              ) : (
                <FaUser className={styles["chat-sidebar-item-icon"]} />
              )}
              <div className={styles["chat-sidebar-item-info"]}>
                <h2>{chat.username}</h2>
                <p>
                  {chat.lastMessage.role === "sender" ? "You: " : chat.username + ": "}
                  {chat.lastMessage.content}
                </p>
              </div>
            </div>
          ))}
          {chatList.length >= 10 && <div ref={fetchTrigger} />}
        </>
      )}
    </section>
  );
};

export default MessageSidebar;
