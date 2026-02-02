import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export function NotificationBell() {
  const [notifications] = useState([
    {
      id: '1',
      title: 'Schedule Update',
      message: 'CS301 venue changed from LT1 to LT2 for tomorrow',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      title: 'New Class Added',
      message: 'Extra tutorial session added for CS302 on Friday 3-5 PM',
      time: '1 day ago',
      read: true,
    },
    {
      id: '3',
      title: 'Exam Schedule',
      message: 'Mid-semester exam timetable has been published',
      time: '2 days ago',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full size-5 flex items-center justify-center text-xs">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} new</Badge>
            )}
          </div>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      !notification.read
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm">{notification.title}</h4>
                      {!notification.read && (
                        <div className="size-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {notification.message}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {notification.time}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Bell className="size-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No notifications yet
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}