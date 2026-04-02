"use client";
import dynamic from "next/dynamic";

// Lazy-load ChatWidget: không block render lúc tải trang, tăng LCP/CWV score
const ChatWidget = dynamic(() => import("./ChatWidget"), {
  ssr: false,
  loading: () => null,
});

export default function ChatWidgetLoader() {
  return <ChatWidget />;
}
