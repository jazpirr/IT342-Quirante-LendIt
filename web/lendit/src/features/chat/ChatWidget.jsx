import React, { useState, useEffect, useRef, useCallback } from "react";
import EmojiPicker from "emoji-picker-react";
import { MessageCircle, X, Send, Smile, ArrowLeft, ChevronRight } from "lucide-react";
import "./ChatWidget.css";

const API = "http://localhost:8080/api/messages";

const timeAgo = (dt) => {
  if (!dt) return "";
  const diff = Date.now() - new Date(dt).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const ChatWidget = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("list");
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [contact, setContact] = useState(null);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef(null);
  const pollMsgRef = useRef(null);
  const pollConvRef = useRef(null);

  const token = localStorage.getItem("token");
  const headers = { "Authorization": `Bearer ${token}` };

  const fetchConversations = useCallback(() => {
    if (!token) return;
    fetch(`${API}/conversations`, { headers })
      .then(r => r.json())
      .then(setConversations)
      .catch(() => {});
  }, [token]);

  const fetchMessages = useCallback(() => {
    if (!contact || !token) return;
    fetch(`${API}/conversation/${contact.userId}?itemId=${contact.itemId}`, { headers })
      .then(r => r.json())
      .then(setMessages)
      .catch(() => {});
  }, [contact, token]);

  useEffect(() => {
    if (open) fetchConversations();
  }, [open, fetchConversations]);

  useEffect(() => {
    if (open) {
      pollConvRef.current = setInterval(fetchConversations, 5000);
    }
    return () => clearInterval(pollConvRef.current);
  }, [open, fetchConversations]);

  useEffect(() => {
    if (view === "thread" && contact) {
      fetchMessages();
      pollMsgRef.current = setInterval(fetchMessages, 3000);
    }
    return () => clearInterval(pollMsgRef.current);
  }, [view, contact, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handler = (e) => {
      const { userId, userName, itemId, itemName, itemImage } = e.detail;
      setContact({
        userId,
        userName: decodeURIComponent(userName),
        itemId,
        itemName: decodeURIComponent(itemName),
        itemImage: decodeURIComponent(itemImage),
      });
      setMessages([]);
      setView("thread");
      setOpen(true);
    };
    window.addEventListener("openChat", handler);
    return () => window.removeEventListener("openChat", handler);
  }, []);

  const openThread = (conv) => {
    setContact({
      userId: conv.contactId,
      userName: conv.contactName,
      itemId: conv.itemId,
      itemName: conv.itemName,
      itemImage: conv.itemImage,
    });
    setMessages([]);
    setView("thread");
  };

  const sendMessage = async () => {
    if (!text.trim() || !contact) return;
    const body = {
      recipientId: contact.userId,
      content: text.trim(),
      itemId: contact.itemId,
      itemName: contact.itemName,
      itemImage: contact.itemImage,
    };
    setText("");
    await fetch(`${API}/send`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    fetchMessages();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="cw-root">
      {/* Popup */}
      {open && (
        <div className="cw-popup">
          {/* Header */}
          <div className="cw-header">
            {view === "thread" ? (
              <>
                <button className="cw-back" onClick={() => { setView("list"); setContact(null); fetchConversations(); }}>
                  <ArrowLeft size={18} />
                </button>
                <div className="cw-header-info">
                  <span className="cw-header-name">{contact?.userName}</span>
                  <span className="cw-header-sub">{contact?.itemName}</span>
                </div>
              </>
            ) : (
              <span className="cw-header-name">Messages</span>
            )}
            <button className="cw-close" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          {view === "list" ? (
            <div className="cw-list">
              {conversations.length === 0 ? (
                <div className="cw-empty">No conversations yet.</div>
              ) : (
                conversations.map((conv) => (
                  <button key={`${conv.contactId}_${conv.itemId}`} className="cw-conv-item" onClick={() => openThread(conv)}>
                    <div className="cw-conv-avatar">
                      {conv.contactName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="cw-conv-info">
                      <div className="cw-conv-top">
                        <span className="cw-conv-name">{conv.contactName}</span>
                        <span className="cw-conv-time">{timeAgo(conv.lastTime)}</span>
                      </div>
                      <div className="cw-conv-item-label">{conv.itemName}</div>
                      <div className="cw-conv-preview">{conv.lastMessage}</div>
                    </div>
                    <ChevronRight size={14} className="cw-conv-chevron" />
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="cw-thread">
              {/* Item card */}
              {contact?.itemImage && (
                <div className="cw-item-card">
                  <img src={contact.itemImage} alt={contact.itemName} className="cw-item-card-img" />
                  <span className="cw-item-card-name">{contact.itemName}</span>
                </div>
              )}

              {/* Messages */}
              <div className="cw-messages">
                {messages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`cw-bubble-wrap ${isMe ? "me" : "them"}`}>
                      <div className={`cw-bubble ${isMe ? "cw-bubble-me" : "cw-bubble-them"}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="cw-input-area">
                {showEmoji && (
                  <div className="cw-emoji-picker">
                    <EmojiPicker
                      onEmojiClick={(e) => setText(t => t + e.emoji)}
                      emojiSize={20}
                      emojiButtonSize={30}
                      height={320}
                      width={300}
                      previewConfig={{ showPreview: false }}
                      skinTonesDisabled
                      lazyLoadEmojis
                    />
                  </div>
                )}
                <button className="cw-emoji-btn" onClick={() => setShowEmoji(s => !s)}>
                  <Smile size={18} />
                </button>
                <textarea
                  className="cw-input"
                  rows={1}
                  placeholder="Type a message..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={handleKey}
                />
                <button className="cw-send" onClick={sendMessage} disabled={!text.trim()}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button className="cw-toggle" onClick={() => setOpen(o => !o)}>
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};

export default ChatWidget;
