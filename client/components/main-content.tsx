"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Save, Copy, Menu } from "lucide-react"
import type { MockEndpoint, Collection } from "./mock-api-platform"
import { AiMockGenerator } from "./ai-mock-generator"
import { ThemeToggle } from "./theme-toggle"

interface MainContentProps {
  selectedEndpoint: MockEndpoint | null
  selectedCollection: Collection
  onUpdateEndpoint: (endpoint: MockEndpoint) => void
  onAddEndpoint: (collectionId: string, endpoint: MockEndpoint) => void
  onToggleSidebar: () => void
}

export function MainContent({
  selectedEndpoint,
  selectedCollection,
  onUpdateEndpoint,
  onAddEndpoint,
  onToggleSidebar,
}: MainContentProps) {
  const [testResponse, setTestResponse] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  if (!selectedEndpoint) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex h-16 shrink-0 items-center gap-4 px-6 border-b border-border/50 dark:border-gray-800/50 bg-gradient-to-r from-background to-muted/20">
          <Button variant="ghost" size="sm" onClick={onToggleSidebar}>
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">MockAPI Platform</h1>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-2xl">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Play className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to MockAPI
              </h2>
              <p className="text-muted-foreground text-lg">
                Select an endpoint from the sidebar to start editing, or create a new one with AI.
              </p>
            </div>
            <AiMockGenerator
              onGenerateEndpoint={(endpoint) => onAddEndpoint(selectedCollection.id, endpoint)}
              collectionId={selectedCollection.id}
            />
          </div>
        </div>
      </div>
    )
  }

  const handleTest = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setTestResponse(
        JSON.stringify(
          {
            status: selectedEndpoint.response.status,
            headers: selectedEndpoint.response.headers,
            body: JSON.parse(selectedEndpoint.response.body),
          },
          null,
          2,
        ),
      )
      setIsLoading(false)
    }, 1000)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      case "POST":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "PUT":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "DELETE":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "PATCH":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-16 shrink-0 items-center gap-4 px-6 border-b border-border/50 dark:border-gray-800/50 bg-gradient-to-r from-background to-muted/20">
        <Button variant="ghost" size="sm" onClick={onToggleSidebar}>
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`font-mono ${getMethodColor(selectedEndpoint.method)}`}>
            {selectedEndpoint.method}
          </Badge>
          <h1 className="text-lg font-semibold">{selectedEndpoint.name}</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={handleTest}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Play className="h-4 w-4 mr-2" />
            {isLoading ? "Testing..." : "Test"}
          </Button>
          <Button variant="outline" className="border-border/50 dark:border-gray-700 bg-transparent">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 p-6 overflow-hidden">
        <Tabs defaultValue="endpoint" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 shrink-0 bg-muted/30 border border-border/50 dark:border-gray-800/50">
            <TabsTrigger value="endpoint" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Endpoint
            </TabsTrigger>
            <TabsTrigger value="response" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Response
            </TabsTrigger>
            <TabsTrigger value="test" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Test
            </TabsTrigger>
            <TabsTrigger
              value="ai-generate"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              AI Generate
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-6 overflow-hidden">
            <TabsContent value="endpoint" className="h-full m-0 overflow-y-auto">
              <div className="space-y-6">
                <Card className="border-border/50 dark:border-gray-800/50">
                  <CardHeader>
                    <CardTitle>Endpoint Configuration</CardTitle>
                    <CardDescription>Configure your mock endpoint settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={selectedEndpoint.name}
                          onChange={(e) =>
                            onUpdateEndpoint({
                              ...selectedEndpoint,
                              name: e.target.value,
                            })
                          }
                          className="border-border/50 dark:border-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="method">Method</Label>
                        <Select
                          value={selectedEndpoint.method}
                          onValueChange={(value: any) =>
                            onUpdateEndpoint({
                              ...selectedEndpoint,
                              method: value,
                            })
                          }
                        >
                          <SelectTrigger className="border-border/50 dark:border-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-border/50 dark:border-gray-700">
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="DELETE">DELETE</SelectItem>
                            <SelectItem value="PATCH">PATCH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="path">Path</Label>
                      <Input
                        id="path"
                        value={selectedEndpoint.path}
                        onChange={(e) =>
                          onUpdateEndpoint({
                            ...selectedEndpoint,
                            path: e.target.value,
                          })
                        }
                        className="border-border/50 dark:border-gray-700 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={selectedEndpoint.description || ""}
                        onChange={(e) =>
                          onUpdateEndpoint({
                            ...selectedEndpoint,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className="border-border/50 dark:border-gray-700"
                      />
                    </div>
                  </CardContent>
                </Card>

                {selectedEndpoint.request && (
                  <Card className="border-border/50 dark:border-gray-800/50">
                    <CardHeader>
                      <CardTitle>Request Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Request Body</Label>
                        <Textarea
                          value={selectedEndpoint.request.body || ""}
                          onChange={(e) =>
                            onUpdateEndpoint({
                              ...selectedEndpoint,
                              request: {
                                ...selectedEndpoint.request,
                                body: e.target.value,
                              },
                            })
                          }
                          className="font-mono text-sm border-border/50 dark:border-gray-700"
                          rows={6}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="response" className="h-full m-0 overflow-y-auto">
              <Card className="border-border/50 dark:border-gray-800/50">
                <CardHeader>
                  <CardTitle>Response Configuration</CardTitle>
                  <CardDescription>Configure the mock response for this endpoint</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status Code</Label>
                      <Input
                        id="status"
                        type="number"
                        value={selectedEndpoint.response.status}
                        onChange={(e) =>
                          onUpdateEndpoint({
                            ...selectedEndpoint,
                            response: {
                              ...selectedEndpoint.response,
                              status: Number.parseInt(e.target.value),
                            },
                          })
                        }
                        className="border-border/50 dark:border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Content Type</Label>
                      <Input
                        value={selectedEndpoint.response.headers["Content-Type"] || ""}
                        onChange={(e) =>
                          onUpdateEndpoint({
                            ...selectedEndpoint,
                            response: {
                              ...selectedEndpoint.response,
                              headers: {
                                ...selectedEndpoint.response.headers,
                                "Content-Type": e.target.value,
                              },
                            },
                          })
                        }
                        className="border-border/50 dark:border-gray-700 font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Response Body</Label>
                    <Textarea
                      value={selectedEndpoint.response.body}
                      onChange={(e) =>
                        onUpdateEndpoint({
                          ...selectedEndpoint,
                          response: {
                            ...selectedEndpoint.response,
                            body: e.target.value,
                          },
                        })
                      }
                      className="font-mono text-sm border-border/50 dark:border-gray-700"
                      rows={15}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="test" className="h-full m-0 overflow-y-auto">
              <Card className="border-border/50 dark:border-gray-800/50">
                <CardHeader>
                  <CardTitle>Test Endpoint</CardTitle>
                  <CardDescription>Test your mock endpoint and see the response</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`font-mono ${getMethodColor(selectedEndpoint.method)}`}>
                      {selectedEndpoint.method}
                    </Badge>
                    <code className="bg-muted/50 px-3 py-1.5 rounded-md text-sm font-mono border border-border/50 dark:border-gray-700">
                      {selectedEndpoint.path}
                    </code>
                    <Button
                      onClick={handleTest}
                      disabled={isLoading}
                      className="ml-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isLoading ? "Testing..." : "Send Request"}
                    </Button>
                  </div>

                  {testResponse && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Response</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border/50 dark:border-gray-700 bg-transparent"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <Textarea
                        value={testResponse}
                        readOnly
                        className="font-mono text-sm border-border/50 dark:border-gray-700 bg-muted/30"
                        rows={15}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-generate" className="h-full m-0 overflow-y-auto">
              <AiMockGenerator
                onGenerateEndpoint={(endpoint) => onAddEndpoint(selectedCollection.id, endpoint)}
                collectionId={selectedCollection.id}
              />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}
