// src/app/dashboard/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTicketModal } from "@/components/tickets/create-ticket-modal";

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  creator: {
    firstName: string;
    lastName: string;
  };
}

type BadgeVariant = "default" | "destructive" | "outline" | "secondary";

export default function DashboardPage() {
  const router = useRouter();

  const {
    data: tickets = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Ticket[]>({
    queryKey: ["tickets"],
    queryFn: async () => {
      const token = localStorage.getItem("helpdesk_token");
      if (!token) {
        router.push("/login");
        throw new Error("Unauthorized");
      }
      return apiFetch("/tickets");
    },
  });

  if (
    error instanceof Error &&
    (error.message.includes("Unauthorized") || error.message.includes("token"))
  ) {
    localStorage.removeItem("helpdesk_token");
    router.push("/login");
  }

  const getStatusBadgeVariant = (status: string): BadgeVariant => {
    switch (status) {
      case "OPEN":
        return "destructive";
      case "IN_PROGRESS":
        return "default";
      case "RESOLVED":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading tickets...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <button
            onClick={() => {
              localStorage.removeItem("helpdesk_token");
              router.push("/login");
            }}
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            Sign Out
          </button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Tickets</CardTitle>
            {/* We pass the 'refetch' function directly from React Query to the modal */}
            <CreateTicketModal onSuccess={() => refetch()} />
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <p className="text-sm text-slate-500">
                No tickets found in your organization.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      onClick={() => router.push(`/tickets/${ticket.id}`)}
                      className="cursor-pointer transition-colors hover:bg-slate-100"
                    >
                      <TableCell className="font-medium">
                        {ticket.title}
                      </TableCell>
                      <TableCell>
                        {ticket.creator.firstName} {ticket.creator.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{ticket.priority}</TableCell>
                      <TableCell>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
