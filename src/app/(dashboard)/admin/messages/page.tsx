'use client'

import { useState, useRef, useEffect } from 'react'
import { useConversations, useMessageThread, useSendMessage } from '@/hooks/use-messages'
import { useUsers } from '@/hooks/use-users'
import { MessageSquare, Send, Search, Plus } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { getRoleLabel } from '@/lib/auth-utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function AdminMessagesPage() {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [search, setSearch] = useState('')
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: conversationsData, isLoading: loadingConversations } = useConversations()
  const { data: threadData, isLoading: loadingThread } = useMessageThread(selectedUserId)
  const sendMessage = useSendMessage()
  const { data: usersData } = useUsers({ search: userSearch, pageSize: 10 })

  const conversations = conversationsData?.data ?? []
  const messages = threadData?.items ?? []
  const users = usersData?.items ?? []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const filteredConversations = conversations.filter((conv: { otherUser: { name: string; email: string } }) => {
    if (!search) return true
    const q = search.toLowerCase()
    return conv.otherUser.name?.toLowerCase().includes(q) || conv.otherUser.email?.toLowerCase().includes(q)
  })

  const handleSend = () => {
    if (!messageInput.trim() || !selectedUserId) return
    sendMessage.mutate(
      { recipientId: selectedUserId, content: messageInput.trim() },
      { onSuccess: () => setMessageInput('') },
    )
  }

  const handleStartConversation = (userId: string) => {
    setSelectedUserId(userId)
    setShowNewConversation(false)
    setUserSearch('')
  }

  const selectedConversation = conversations.find(
    (c: { otherUser: { id: string } }) => c.otherUser.id === selectedUserId,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <p className="text-slate-500">Communicate with tenants and landlords</p>
        </div>
        <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Conversation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full rounded-md border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {users.map((user: { id: string; name: string; email: string; role: string }) => (
                  <button
                    key={user.id}
                    onClick={() => handleStartConversation(user.id)}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-slate-100"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-medium text-violet-700">
                      {getInitials(user.name || 'U')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                    <span className="text-xs text-slate-400">{getRoleLabel(user.role)}</span>
                  </button>
                ))}
                {users.length === 0 && (
                  <p className="py-4 text-center text-sm text-slate-500">No users found</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex h-[calc(100vh-220px)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {/* Left panel - Conversations */}
        <div className="flex w-80 flex-col border-r">
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full rounded-md border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border-b p-4">
                  <div className="h-12 animate-pulse rounded bg-slate-200" />
                </div>
              ))
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-12">
                <MessageSquare className="h-12 w-12 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map(
                (conv: {
                  otherUser: { id: string; name: string; email: string; role: string }
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
                        <span className="flex-shrink-0 text-xs text-slate-400">
                          {formatDateTime(conv.lastMessage?.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                          conv.otherUser.role === 'TENANT'
                            ? 'bg-green-100 text-green-700'
                            : conv.otherUser.role === 'LANDLORD'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-violet-100 text-violet-700'
                        }`}>
                          {getRoleLabel(conv.otherUser.role)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {conv.lastMessage?.content ?? 'No messages yet'}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                        {conv.unreadCount}
                      </span>
                    )}
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
              <p className="text-sm">Choose a conversation from the left panel to start messaging</p>
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
                    selectedConversation?.otherUser?.role === 'TENANT'
                      ? 'bg-green-100 text-green-700'
                      : selectedConversation?.otherUser?.role === 'LANDLORD'
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
