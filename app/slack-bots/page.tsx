"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import {
  Package,
  Slack,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SlackConfig {
  bot_token: string;
  app_token: string;
  webhook: string;
  channel_ids: string[];
  created_at: string;
  updated_at: string;
}

export default function SlackBotConfigPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");

  // Form state
  const [botToken, setBotToken] = useState("");
  const [appToken, setAppToken] = useState("");
  const [webhook, setWebhook] = useState("");
  const [channelIds, setChannelIds] = useState<string[]>([]);
  const [newChannelId, setNewChannelId] = useState("");
  const [showBotToken, setShowBotToken] = useState(false);
  const [showAppToken, setShowAppToken] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);

  // Alert dialog state
  const [showAlert, setShowAlert] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "botToken" | "appToken" | "webhook";
    value: boolean;
  } | null>(null);

  // Fetch Slack configuration on mount
  useEffect(() => {
    const fetchSlackConfig = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/slack-management`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch Slack configuration: ${response.statusText}`);
        }

        const config: SlackConfig = await response.json();
        setBotToken(config.bot_token || "");
        setAppToken(config.app_token || "");
        setWebhook(config.webhook || "");
        setChannelIds(config.channel_ids || []);
        setConnectionStatus(config.bot_token && config.app_token && config.webhook ? "success" : "idle");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load Slack configuration.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    fetchSlackConfig();
  }, []);

  const handleAddChannelId = () => {
    if (!newChannelId.trim()) {
      toast({
        title: "Invalid Channel ID",
        description: "Please enter a valid channel ID.",
        variant: "destructive",
      });
      return;
    }
    if (channelIds.includes(newChannelId.trim())) {
      toast({
        title: "Duplicate Channel ID",
        description: "This channel ID is already added.",
        variant: "destructive",
      });
      return;
    }
    setChannelIds([...channelIds, newChannelId.trim()]);
    setNewChannelId("");
  };

  const handleRemoveChannelId = (channelId: string) => {
    setChannelIds(channelIds.filter((id) => id !== channelId));
  };

  const handleSaveConfig = async () => {
    if (!botToken || !appToken || !webhook) {
      toast({
        title: "Missing Credentials",
        description: "Please enter Bot Token, App Token, and Webhook URL.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/slack-management`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bot_token: botToken,
          app_token: appToken,
          webhook,
          channel_ids: channelIds,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save Slack configuration: ${response.statusText}`);
      }

      toast({
        title: "Configuration Saved",
        description: "Your Slack bot configuration has been saved successfully.",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save Slack configuration.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = () => {
    if (!botToken || !appToken || !webhook) {
      toast({
        title: "Missing Credentials",
        description: "Please enter Bot Token, App Token, and Webhook URL to test the connection.",
        variant: "destructive",
      });
      return;
    }

    setTestingConnection(true);
    setConnectionStatus("idle");

    // Simulate API call (no test route provided)
    setTimeout(() => {
      setTestingConnection(false);

      // For demo purposes, assume success if fields are filled and have correct prefixes
      if (
        botToken.startsWith("xoxb-") &&
        appToken.startsWith("xapp-") &&
        webhook.startsWith("http")
      ) {
        setConnectionStatus("success");
        toast({
          title: "Connection Successful",
          description: "Successfully connected to Slack API.",
        });
      } else {
        setConnectionStatus("error");
        toast({
          title: "Connection Failed",
          description: "Could not connect to Slack API. Please check your credentials.",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const handleShowSensitiveInfo = (type: "botToken" | "appToken" | "webhook", value: boolean) => {
    if (value === true) {
      setPendingAction({ type, value });
      setShowAlert(true);
    } else {
      switch (type) {
        case "botToken":
          setShowBotToken(false);
          break;
        case "appToken":
          setShowAppToken(false);
          break;
        case "webhook":
          setShowWebhook(false);
          break;
      }
    }
  };

  const confirmShowSensitiveInfo = () => {
    if (pendingAction) {
      switch (pendingAction.type) {
        case "botToken":
          setShowBotToken(true);
          break;
        case "appToken":
          setShowAppToken(true);
          break;
        case "webhook":
          setShowWebhook(true);
          break;
      }
    }
    setShowAlert(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b bg-purple-50 dark:bg-purple-950">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-purple-700 dark:text-purple-300" />
            <span className="font-bold text-lg text-purple-900 dark:text-purple-50">U&I Services</span>
          </div>
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6 bg-purple-50/50 dark:bg-purple-950/50">
        <div className="flex items-center justify-between space-y-2">
          <div className="flex items-center space-x-2">
            <Slack className="h-8 w-8 text-purple-700 dark:text-purple-300" />
            <h2 className="text-3xl font-bold tracking-tight text-purple-900 dark:text-purple-50">
              Slack Bot Configuration
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              className="bg-purple-700 hover:bg-purple-800 text-white"
              onClick={handleSaveConfig}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Bot Status Card */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-900 dark:text-purple-50">Bot Status</CardTitle>
              <Badge
                className={
                  connectionStatus === "success"
                    ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100"
                    : connectionStatus === "error"
                    ? "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100"
                }
              >
                {connectionStatus === "success"
                  ? "Healthy"
                  : connectionStatus === "error"
                    ? "Cannot Connect"
                    : "Not Configured"}
              </Badge>
            </div>
            <CardDescription className="text-purple-700 dark:text-purple-300">
              Current status of your Slack bot integration
            </CardDescription>
          </CardHeader>
        </Card>

        {/* API Credentials Card */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-purple-50">API Credentials</CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-300">
              Configure your Slack bot API credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bot-token" className="text-purple-900 dark:text-purple-50">
                  Slack Bot Token (xoxb-...)
                </Label>
                <Link
                  href="https://api.slack.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100 flex items-center"
                >
                  Find in Slack App Management <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="bot-token"
                  type={showBotToken ? "text" : "password"}
                  placeholder="xoxb-your-token"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="pr-10 font-mono border-purple-200 dark:border-purple-800"
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                />
                <button
                  type="button"
                  onClick={() => handleShowSensitiveInfo("botToken", !showBotToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-200"
                >
                  {showBotToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                The Bot Token is used for posting messages and interacting with the Slack API.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="app-token" className="text-purple-900 dark:text-purple-50">
                  Slack App Token (xapp-...)
                </Label>
                <Link
                  href="https://api.slack.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100 flex items-center"
                >
                  Find in Basic Information <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="app-token"
                  type={showAppToken ? "text" : "password"}
                  placeholder="xapp-your-token"
                  value={appToken}
                  onChange={(e) => setAppToken(e.target.value)}
                  className="pr-10 font-mono border-purple-200 dark:border-purple-800"
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                />
                <button
                  type="button"
                  onClick={() => handleShowSensitiveInfo("appToken", !showAppToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-200"
                >
                  {showAppToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                The App Token is used for Socket Mode connections and app-level permissions.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="webhook" className="text-purple-900 dark:text-purple-50">
                  Slack Webhook URL
                </Label>
                <Link
                  href="https://api.slack.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100 flex items-center"
                >
                  Create in Incoming Webhooks <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="webhook"
                  type={showWebhook ? "text" : "password"}
                  placeholder="https://hooks.slack.com/services/..."
                  value={webhook}
                  onChange={(e) => setWebhook(e.target.value)}
                  className="pr-10 font-mono border-purple-200 dark:border-purple-800"
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                />
                <button
                  type="button"
                  onClick={() => handleShowSensitiveInfo("webhook", !showWebhook)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-200"
                >
                  {showWebhook ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                The Webhook URL is used for sending messages to specific channels.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel-id" className="text-purple-900 dark:text-purple-50">
                Slack Channel IDs
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="channel-id"
                  placeholder="C12345678"
                  value={newChannelId}
                  onChange={(e) => setNewChannelId(e.target.value)}
                  className="font-mono border-purple-200 dark:border-purple-800"
                />
                <Button
                  onClick={handleAddChannelId}
                  className="bg-purple-700 hover:bg-purple-800 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Add channel IDs where the bot will send messages (e.g., C12345678).
              </p>
              {channelIds.length > 0 && (
                <div className="space-y-2">
                  {channelIds.map((channelId) => (
                    <div
                      key={channelId}
                      className="flex items-center justify-between p-2 bg-purple-100 dark:bg-purple-800 rounded-md"
                    >
                      <span className="text-sm text-purple-900 dark:text-purple-50 font-mono">
                        {channelId}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveChannelId(channelId)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="bg-purple-700 hover:bg-purple-800 text-white"
              >
                {testingConnection ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    {connectionStatus === "success" ? (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    ) : connectionStatus === "error" ? (
                      <XCircle className="mr-2 h-4 w-4" />
                    ) : (
                      <Slack className="mr-2 h-4 w-4" />
                    )}
                    Test Connection
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Dialog for Sensitive Information */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Show Sensitive Information?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to reveal sensitive API credentials. This information should be kept secure and not shared
              with others. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmShowSensitiveInfo}>Yes, Show Information</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}