"use client"

import PageLayout from "@/components/page-layout"
import { MessageCircle, Mail, HelpCircle, Plus } from "lucide-react"
import { useState } from "react"

export default function SupportPage() {
  const [activeTicket, setActiveTicket] = useState<string | null>(null)

  const tickets = [
    {
      id: "TK-001",
      subject: "Order #10258 not delivered",
      status: "Open",
      date: "Nov 4, 2023",
      message: "I haven't received the likes for my order yet.",
    },
    {
      id: "TK-002",
      subject: "Payment issue",
      status: "In Review",
      date: "Nov 3, 2023",
      message: "My payment was declined, can you help?",
    },
    {
      id: "TK-003",
      subject: "Account verification",
      status: "Resolved",
      date: "Nov 1, 2023",
      message: "Successfully verified account.",
    },
  ]

  return (
    <PageLayout title="Support Center">
      <div className="space-y-6">
        {/* Quick Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 text-center">
            <MessageCircle className="mx-auto text-green-600 mb-4" size={32} />
            <h3 className="font-bold text-slate-900 mb-2">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-4">Chat with our support team in real-time</p>
            <button className="w-full bg-green-500 text-slate-900 font-semibold py-2 rounded-lg hover:bg-green-600 transition-colors">
              Start Chat
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 text-center">
            <Mail className="mx-auto text-green-600 mb-4" size={32} />
            <h3 className="font-bold text-slate-900 mb-2">Email Support</h3>
            <p className="text-sm text-gray-600 mb-4">Send us an email with your issue</p>
            <button className="w-full bg-green-500 text-slate-900 font-semibold py-2 rounded-lg hover:bg-green-600 transition-colors">
              Send Email
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 text-center">
            <HelpCircle className="mx-auto text-green-600 mb-4" size={32} />
            <h3 className="font-bold text-slate-900 mb-2">FAQ</h3>
            <p className="text-sm text-gray-600 mb-4">Browse frequently asked questions</p>
            <button className="w-full bg-green-500 text-slate-900 font-semibold py-2 rounded-lg hover:bg-green-600 transition-colors">
              View FAQ
            </button>
          </div>
        </div>

        {/* Support Tickets */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Your Tickets</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-slate-900 rounded-lg hover:bg-green-600 transition-colors font-semibold">
              <Plus size={18} />
              New Ticket
            </button>
          </div>

          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border border-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setActiveTicket(activeTicket === ticket.id ? null : ticket.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-900">{ticket.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {ticket.id} • {ticket.date}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.status === "Open"
                        ? "bg-red-100 text-red-700"
                        : ticket.status === "In Review"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>

                {activeTicket === ticket.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-700">{ticket.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
