import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendChatMessage } from "../../services/chatService";

const createGreeting = () => ({
    id: "welcome",
    role: "assistant",
    content: "Hi! I’m SupportAI. I can help with tickets, FAQs, and common support questions. What can I help you with?",
});

function SupportChatbox() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([createGreeting()]);
    const [draft, setDraft] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const messageEndRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading, isOpen]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const message = draft.trim();

        if (!message || isLoading) return;

        const history = messages
            .slice(-20)
            .map(({ role, content }) => ({ role, content }));

        setMessages((current) => [
            ...current,
            { id: `${Date.now()}-user`, role: "user", content: message },
        ]);
        setDraft("");
        setError("");
        setIsLoading(true);

        try {
            const reply = await sendChatMessage(message, history);
            setMessages((current) => [
                ...current,
                {
                    id: `${Date.now()}-assistant`,
                    role: "assistant",
                    content: reply || "I couldn’t find a response. Please try again.",
                },
            ]);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "I couldn’t reach support right now. Please try again in a moment."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
        ) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
        }
    };

    const startNewConversation = () => {
        setMessages([createGreeting()]);
        setError("");
        setDraft("");
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 sm:bottom-6 sm:right-6">
            {isOpen && (
                <section
                    id="support-chat-panel"
                    role="dialog"
                    aria-label="SupportAI chat"
                    className="fixed inset-x-4 bottom-20 flex h-[min(38rem,calc(100dvh-7rem))] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-white shadow-2xl sm:inset-x-auto sm:right-6 sm:w-[23rem]"
                >
                    <header className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400 font-bold text-slate-950">
                                S
                            </div>
                            <div>
                                <h2 className="font-semibold">SupportAI</h2>
                                <p className="text-xs text-slate-400">
                                    AI customer support
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={startNewConversation}
                                aria-label="Start a new conversation"
                                title="New conversation"
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 11a8.1 8.1 0 0 1-13.8 5.7L4 19l2.3-2.2A8 8 0 1 1 20 11Z" />
                                    <path strokeLinecap="round" d="M12 8v6m-3-3h6" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close chat"
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                                    <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
                                </svg>
                            </button>
                        </div>
                    </header>

                    <div
                        className="flex-1 space-y-4 overflow-y-auto bg-slate-950/70 p-4"
                        aria-live="polite"
                        aria-relevant="additions text"
                    >
                        <p className="text-center text-xs text-slate-500">
                            Ask about tickets, FAQs, or troubleshooting.
                        </p>
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <p
                                    className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                        message.role === "user"
                                            ? "rounded-br-md bg-teal-400 text-slate-950"
                                            : "rounded-bl-md border border-slate-800 bg-slate-900 text-slate-100"
                                    }`}
                                >
                                    {message.content}
                                </p>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start" role="status" aria-label="SupportAI is responding">
                                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-slate-800 bg-slate-900 px-4 py-3">
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400 [animation-delay:-0.2s]" />
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400 [animation-delay:-0.1s]" />
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400" />
                                    <span className="sr-only">SupportAI is typing</span>
                                </div>
                            </div>
                        )}
                        {error && (
                            <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                                {error}
                            </p>
                        )}
                        {messages.some((message) => message.role === "user") && (
                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => navigate("/customer/create-ticket", {
                                        state: {
                                            chatTranscript: messages
                                                .filter((message) => message.role === "user" || message.role === "assistant")
                                                .map((message) => `${message.role === "user" ? "Customer" : "SupportAI"}: ${message.content}`)
                                                .join("\n\n"),
                                            initialIssue: messages.find((message) => message.role === "user")?.content || "",
                                        },
                                    })}
                                    className="rounded-lg border border-teal-500/40 px-3 py-2 text-xs font-medium text-teal-300 transition hover:bg-teal-500/10"
                                >
                                    Still need help? Create a ticket
                                </button>
                            </div>
                        )}
                        <div ref={messageEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="border-t border-slate-800 bg-slate-900 p-3">
                        <label htmlFor="support-chat-message" className="sr-only">
                            Your message
                        </label>
                        <div className="flex items-end gap-2 rounded-xl border border-slate-700 bg-slate-950 p-2 focus-within:border-teal-400">
                            <textarea
                                id="support-chat-message"
                                value={draft}
                                onChange={(event) => setDraft(event.target.value)}
                                onKeyDown={handleKeyDown}
                                maxLength={4000}
                                rows={1}
                                placeholder="Write a message…"
                                disabled={isLoading}
                                className="max-h-28 min-h-10 flex-1 resize-y bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-60"
                            />
                            <button
                                type="submit"
                                disabled={!draft.trim() || isLoading}
                                aria-label="Send message"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-400 text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 14-7-4 14-3-6-7-1Zm7 1 7-8" />
                                </svg>
                            </button>
                        </div>
                        <p className="px-1 pt-2 text-center text-[11px] text-slate-500">
                            Enter to send · Shift+Enter for a new line
                        </p>
                    </form>
                </section>
            )}

            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
                aria-controls="support-chat-panel"
                aria-label={isOpen ? "Close SupportAI chat" : "Open SupportAI chat"}
                className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-400 text-slate-950 shadow-xl shadow-teal-950/40 transition hover:scale-105 hover:bg-teal-300 focus:outline-none focus:ring-4 focus:ring-teal-300/30"
            >
                {isOpen ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true">
                        <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 9h10M7 13h6m-1 8-4-4H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5l-4 4Z" />
                    </svg>
                )}
            </button>
        </div>
    );
}

export default SupportChatbox;
