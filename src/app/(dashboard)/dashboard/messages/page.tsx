'use client'

import { useState, useRef, useEffect } from 'react'
import { useConversations, useMessageThread, useSendMessage } from '@/hooks/use-messages'
import { MessageSquare, Send } from 'lucide-react'
import { formatDateTime, getInitials } from '@/lib/utils'
import { getRoleLabel } from '@/lib/auth-utils'
import { Button } from '@/components/ui/button'

export default function TenantMessagesPage() {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: conversationsData, isLoading: loadingConversations } = useConversations()
  const { data: threadData, isLoading: loadingThread } = useMessageThread(selectedUserId)
  const sendMessage = useSendMessage()

  const conversations = conversationsData?.data ?? []
  const messages = threadData?.items ?? []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!messageInput.trim() || !selectedUserId) return
    sendMessage.mutate(
      { recipientId: selectedUserId, content: messageInput.trim() },
      { onSuccess: () => setMessageInput('') },
    )
  }

  const selectedConversation = conversations.find(
    (c: { otherUser: { id: string } }) => c.otherUser.id === selectedUserId,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-500">Your conversations</p>
      </div>

      <div className="flex h-[calc(100vh-220px)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {/* Left panel - Conversations */}
        <div className="flex w-72 flex-col border-r">
          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border-b p-4">
                  <div className="h-12 animate-pulse rounded bg-slate-200" />
                </div>
              ))
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-12">
                <MessageSquare className="h-12 w-12 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">No conversations yet</p>
              </div>
            ) : (
              conversations.map(
                (conv: {
                  otherUser: { id: string; name: string; role: string }
                  lastMessage: { content: string; createdAt: string }
                  unreadCount: number
                }) => (
                  <button
                    key={conv.otherUser.id}
                    onClick={() => setSelectedUserId(conv.otherUser.id)}
                    className={`flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                      selectedUserId === conv.otherUser.id ? 'bg-violet-50' : ''
                    }`}
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-medium text-violet-700">
                      {getInitials(conv.otherUser.name || 'U')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm font-medium text-slate-900">
                          {conv.otherUser.name}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                        conv.otherUser.role === 'LANDLORD'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-violet-100 text-violet-700'
                      }`}>
                        {getRoleLabel(conv.otherUser.role)}
                      </span>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {conv.lastMessage?.content ?? 'No messages yet'}
                      </p>
                    </div>
                  </button>
                ),
              )
            )}
          </div>
        </div>

        {/* Right panel - Thread */}
        <div className="flex flex-1 flex-col">
          {!selectedUserId ? (
            <div className="flex flex-1 flex-col items-center justify-center text-slate-400">
              <MessageSquare className="h-16 w-16" />
              <p className="mt-4 text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a conversation to start messaging</p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-3 border-b px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-medium text-violet-700">
                  {getInitials(selectedConversation?.otherUser?.name || 'U')}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedConversation?.otherUser?.name ?? 'User'}
                  </p>
                  <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    selectedConversation?.otherUser?.role === 'LANDLORD'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-violet-100 text-violet-700'
                  }`}>
                    {getRoleLabel(selectedConversation?.otherUser?.role ?? '')}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {loadingThread ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-200" />
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-slate-400">
                    <p className="text-sm">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...messages].reverse().map(
                      (msg: {
                        id: string
                        content: string
                        senderId: string
                        senderName: string
                        createdAt: string
                      }) => {
                        const isOwnMessage = msg.senderId !== selectedUserId
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isOwnMessage
                                  ? 'bg-violet-600 text-white'
                                  : 'bg-slate-100 text-slate-900'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p
                                className={`mt-1 text-[10px] ${
                                  isOwnMessage ? 'text-violet-200' : 'text-slate-400'
                                }`}
                              >
                                {formatDateTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        )
                      },
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 rounded-md border border-slate-200 px-4 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!messageInput.trim() || sendMessage.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
