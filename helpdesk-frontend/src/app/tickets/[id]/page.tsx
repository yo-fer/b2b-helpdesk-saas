"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jwtDecode } from "jwt-decode";

interface TicketDetail {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  creator: {
    firstName: string;
    lastName: string;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  organizationId: string;
}

type BadgeVariant = "default" | "destructive" | "outline" | "secondary";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const rawId = params?.id;
  const ticketId = Array.isArray(rawId) ? rawId[0] : (rawId as string) || "";

  const [newComment, setNewComment] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  //const [isSubmitting, setIsSubmitting] = useState(false);

  // Decode JWT on mount to check permissions
  useEffect(() => {
    const token = localStorage.getItem("helpdesk_token");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserRole(decoded.role);
      } catch (err: unknown) {
        if (err instanceof Error) {
          throw new Error(err.message);
        } else {
          throw new Error("An unexpected error occurred");
        }
      }
    }
  }, []);

  // Fetch Ticket Details
  const {
    data: ticket,
    isLoading: loadingTicket,
    error: ticketError,
  } = useQuery<TicketDetail>({
    queryKey: ["ticket", ticketId],
    queryFn: () => apiFetch(`/tickets/${ticketId}`),
    enabled: Boolean(ticketId),
  });

  // Fetch Comments
  const { data: comments = [], isLoading: loadingComments } = useQuery<
    Comment[]
  >({
    queryKey: ["comments", ticketId],
    queryFn: () => apiFetch(`/tickets/${ticketId}/comments`),
    enabled: Boolean(ticketId),
  });

  // React query mutation for status updates
  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: string) =>
      apiFetch(`/tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      }),
    onSuccess: () => {
      // invalidate the cache to instantly refesh de UI
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) =>
      apiFetch(`/tickets/${ticketId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["comments", ticketId] });
    },
  });

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

  if (loadingTicket)
    return <div className="p-8 text-center">Loading ticket details...</div>;
  if (ticketError || !ticket)
    return (
      <div className="p-8 text-center text-destructive">
        Error loading ticket.
      </div>
    );

  const isAgentOrAdmin = userRole === "ADMIN" || userRole === "AGENT";

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            &larr; Back to Dashboard
          </Button>

          {isAgentOrAdmin && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-500">
                Update Status:
              </span>
              <Select
                defaultValue={ticket.status}
                onValueChange={(val) => {
                  if (val) updateStatusMutation.mutate(val);
                }}
                disabled={updateStatusMutation.isPending}
              >
                <SelectTrigger className="w-37.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{ticket.title}</CardTitle>
              <div className="space-x-2">
                <Badge variant={getStatusBadgeVariant(ticket.status || "")}>
                  {ticket.status}
                </Badge>
                <Badge variant="outline">{ticket.priority}</Badge>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Opened by {ticket.creator.firstName} {ticket.creator.lastName} on{" "}
              {new Date(ticket.createdAt).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap rounded-md bg-slate-100 p-4 text-sm text-slate-800">
              {ticket.description}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingComments ? (
              <p className="text-sm text-slate-500">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-slate-500">
                No comments yet. Start the conversation below.
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-lg border bg-white p-4"
                  >
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-semibold">
                        {comment.author.firstName} {comment.author.lastName}
                        <Badge variant="secondary" className="ml-2 text-[10px]">
                          {comment.author.role}
                        </Badge>
                      </span>
                      <span className="text-slate-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4 border-t pt-4">
              <Textarea
                placeholder="Type your message here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="resize-none"
                disabled={addCommentMutation.isPending}
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => addCommentMutation.mutate(newComment)}
                  disabled={addCommentMutation.isPending || !newComment.trim()}
                >
                  {addCommentMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
