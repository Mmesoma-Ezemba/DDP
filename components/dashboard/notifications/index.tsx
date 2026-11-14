"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bullet } from "@/components/ui/bullet";
import NotificationItem from "./notification-item";
import type { Notification } from "@/types/dashboard";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

interface NotificationsProps {
  initialNotifications?: Notification[];
}

export default function Notifications({
  initialNotifications = [],
}: NotificationsProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialNotifications.length);

  // Fetch real notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications?limit=10");
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Failed to load notifications");
      } finally {
        setIsLoading(false);
      }
    };

    if (!initialNotifications.length) {
      fetchNotifications();
    }
  }, [initialNotifications.length]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayedNotifications = showAll
    ? notifications
    : notifications.slice(0, 3);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );

    // Update on server
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Revert on error
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, read: false } : notif))
      );
    }
  };

  const deleteNotification = async (id: string) => {
    // Optimistic update
    const prevNotifications = notifications;
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));

    // Update on server
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      // Revert on error
      setNotifications(prevNotifications);
      toast.error("Failed to delete notification");
    }
  };

  const clearAll = async () => {
    if (notifications.length === 0) return;

    // Optimistic update
    const prevNotifications = notifications;
    setNotifications([]);

    // Update on server
    try {
      await fetch("/api/notifications", {
        method: "DELETE",
      });
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Error clearing notifications:", error);
      // Revert on error
      setNotifications(prevNotifications);
      toast.error("Failed to clear notifications");
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between pl-3 pr-1">
        <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase">
          {unreadCount > 0 ? <Badge>{unreadCount}</Badge> : <Bullet />}
          Notifications
        </CardTitle>
        {notifications.length > 0 && (
          <Button
            className="opacity-50 hover:opacity-100 uppercase"
            size="sm"
            variant="ghost"
            onClick={clearAll}
          >
            Clear All
          </Button>
        )}
      </CardHeader>

      <CardContent className="bg-accent p-1.5 overflow-hidden">
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-xs text-muted-foreground uppercase">Loading...</p>
            </div>
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              {displayedNotifications.map((notification) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                key={notification.id}
              >
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              </motion.div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No notifications
                </p>
              </div>
            )}

              {notifications.length > 3 && (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="w-full"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAll(!showAll)}
                    className="w-full"
                  >
                    {showAll ? "Show Less" : `Show All (${notifications.length})`}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
