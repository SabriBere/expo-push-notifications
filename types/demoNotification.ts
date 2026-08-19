export type DemoNotification = {
  itemId: number;
  contextId: number;
  title: string;
  sourceType: string;
  source: string;
  category: string;
  link: string;
};

export type DemoNotificationData = {
  itemId: number;
  contextId: number;
  url?: string;
};
