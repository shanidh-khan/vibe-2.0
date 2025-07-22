"use client"

import { useState, useEffect } from "react"
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
import { collectionApis } from "@/apis/collection"
import { mockApis } from "@/apis/mocket"

interface MainContentProps {
  selectedEndpoint: MockEndpoint | null
  selectedCollection: Collection | null
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
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("endpoint")
  const [testRequestBody, setTestRequestBody] = useState<string>("")
  const [testRequestHeaders, setTestRequestHeaders] = useState<string>("")
  const [updateCollection] = collectionApis.useUpdateCollectionMutation()
  const [updateMocket] = mockApis.useUpdateMocketMutation()

  // Reset tab to "endpoint" when collection or endpoint changes
  useEffect(() => {
    setActiveTab("endpoint")
    setTestResponse("") // Also clear test response
    // Initialize test fields with endpoint defaults
    setTestRequestBody(selectedEndpoint?.request?.body || "")
    setTestRequestHeaders(selectedEndpoint?.request?.headers || "")
  }, [selectedCollection?.id, selectedEndpoint?.id])

  if (!selectedEndpoint ) {
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
            {selectedCollection && (
              <AiMockGenerator
                onGenerateEndpoint={(endpoint) => onAddEndpoint(selectedCollection.id, endpoint)}
                collectionId={selectedCollection.id}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  const handleTest = async () => {
    setIsLoading(true)
    
    try {
      // Construct the endpoint URL
      const endpointUrl = `http://localhost:5000/${selectedCollection?.subDomain || ''}${selectedEndpoint.path}`
      
      // Parse test headers if provided
      let parsedHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
      if (testRequestHeaders.trim()) {
        try {
          const customHeaders = JSON.parse(testRequestHeaders)
          parsedHeaders = { ...parsedHeaders, ...customHeaders }
        } catch (error) {
          console.warn('Invalid JSON in test headers, using defaults:', error)
        }
      }
      
      // Prepare request options
      const requestOptions: RequestInit = {
        method: selectedEndpoint.method,
        headers: parsedHeaders
      }
      
      // Add body for POST, PUT, PATCH requests
      if (['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && testRequestBody.trim()) {
        requestOptions.body = testRequestBody
      }
      
      console.log('Testing endpoint:', endpointUrl, 'with options:', requestOptions)
      
      // Make the actual HTTP request
      const response = await fetch(endpointUrl, requestOptions)
      
      // Get response text first
      const responseText = await response.text()
      
      // Try to parse as JSON, fallback to plain text
      let responseBody
      try {
        responseBody = JSON.parse(responseText)
      } catch {
        responseBody = responseText
      }
      
      // Format the response for display
      // const formattedResponse = {
      //   status: response.status,
      //   statusText: response.statusText,
      //   headers: Object.fromEntries(response.headers.entries()),
      //   body: responseBody
      // }
      
      setTestResponse(JSON.stringify(responseBody, null, 2))
      
    } catch (error) {
      console.error('Test request failed:', error)
      setTestResponse(JSON.stringify({
        error: 'Request failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Make sure the mock server is running and the endpoint exists'
      }, null, 2))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyEndpointUrl = async () => {
    const endpointUrl = `http://localhost:5000/${selectedCollection?.subDomain || ''}${selectedEndpoint.path}`
    try {
      await navigator.clipboard.writeText(endpointUrl)
      console.log("Endpoint URL copied to clipboard:", endpointUrl)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = endpointUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
    }
  }

  const handleSave = async () => {
    if (!selectedEndpoint || !selectedEndpoint.id) {
      console.error("No endpoint selected or endpoint ID missing")
      return
    }

    if (!selectedCollection || !selectedCollection.id) {
      console.error("No collection selected or collection ID missing")
      return
    }

    setIsSaving(true)
    try {
      // Map UI endpoint to API format
      const endpointData = {
        name: selectedEndpoint.name,
        method: selectedEndpoint.method,
        endpoint: selectedEndpoint.path, // UI uses 'path', API expects 'endpoint'
        description: selectedEndpoint.description,
        collectionId: selectedCollection.id,
        requestHeaders: { "Content-Type": "application/json" },
        request: selectedEndpoint.request || {}, // Use actual request data from UI
        response: {
          status: selectedEndpoint.response.status,
          headers: selectedEndpoint.response.headers,
          body: selectedEndpoint.response.body
        }
      }

      const result = await updateMocket({
        id: selectedEndpoint.id,
        ...endpointData
      }).unwrap()

      console.log("Endpoint saved successfully:", result)
      // You might want to show a success toast notification here
      
      // Optionally update the parent component with the saved endpoint
      // onUpdateEndpoint(selectedEndpoint)
      
    } catch (error) {
      console.error("Failed to save endpoint:", error)
      // You might want to show an error toast notification here
    } finally {
      setIsSaving(false)
    }
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
  console.info(selectedEndpoint, 'shanidh')

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
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            variant="outline" 
            className="border-border/50 dark:border-gray-700 bg-transparent"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 p-6 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
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
                      {/* Headers - Show for all methods (auth, accept headers etc.) */}
                      <div className="space-y-2">
                        <Label>Request Headers</Label>
                        <Textarea
                          value={selectedEndpoint.request.headers || ""}
                          onChange={(e) =>
                            onUpdateEndpoint({
                              ...selectedEndpoint,
                              request: {
                                ...selectedEndpoint.request,
                                headers: e.target.value,
                              },
                            })
                          }
                          placeholder={selectedEndpoint.method === 'GET' ? 
                            'Example:\n{\n  "Authorization": "Bearer token",\n  "Accept": "application/json"\n}' :
                            'Example:\n{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer token"\n}'
                          }
                          className="font-mono text-sm border-border/50 dark:border-gray-700"
                          rows={4}
                        />
                        {/* Validation for headers when required */}
                        {(selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT' || selectedEndpoint.method === 'PATCH') && 
                         (!selectedEndpoint.request.headers || selectedEndpoint.request.headers.trim() === '') && (
                          <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-900/50">
                            ⚠️ Headers may be required for {selectedEndpoint.method} requests. Consider adding Content-Type and other necessary headers.
                          </div>
                        )}
                      </div>
                      
                      {/* Body - Only show for methods that typically need a body */}
                      {(selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT' || selectedEndpoint.method === 'PATCH') && (
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
                            placeholder='Valid JSON required:\n{\n  "name": "John Doe",\n  "email": "john@example.com"\n}'
                            className="font-mono text-sm border-border/50 dark:border-gray-700"
                            rows={6}
                          />
                          {/* JSON Validation */}
                          {(() => {
                            const body = selectedEndpoint.request.body?.trim() || ''
                            if (!body) {
                              return (
                                <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-900/50">
                                  ⚠️ Request body is required for {selectedEndpoint.method} requests and must be valid JSON.
                                </div>
                              )
                            }
                            try {
                              JSON.parse(body)
                              return (
                                <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-900/50">
                                  ✅ Valid JSON format
                                </div>
                              )
                            } catch (error) {
                              return (
                                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-900/50">
                                  ❌ Invalid JSON format: {error instanceof Error ? error.message : 'Please check your JSON syntax'}
                                </div>
                              )
                            }
                          })()}
                        </div>
                      )}
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

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Endpoint URL</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted/50 px-3 py-2 rounded-md text-sm font-mono border border-border/50 dark:border-gray-700 break-all">
                        {`http://localhost:5000/${selectedCollection?.subDomain || ''}${selectedEndpoint.path}`}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyEndpointUrl}
                        className="border-border/50 dark:border-gray-700 bg-transparent hover:bg-muted"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click the copy button to copy this URL to your clipboard for testing in other tools.
                    </p>
                  </div>

                  {/* Test Request Configuration */}
                  <div className="space-y-4 border-t border-border/50 pt-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Request Headers</Label>
                      <Textarea
                        value={testRequestHeaders}
                        onChange={(e) => setTestRequestHeaders(e.target.value)}
                        placeholder={'Example:\n{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer token"\n}'}
                        className="font-mono text-sm border-border/50 dark:border-gray-700"
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        JSON format. Will be merged with default headers.
                      </p>
                    </div>
                    
                    {/* Body - Only show for methods that typically need a body */}
                    {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Request Body</Label>
                        <Textarea
                          value={testRequestBody}
                          onChange={(e) => setTestRequestBody(e.target.value)}
                          placeholder={'Valid JSON required:\n{\n  "name": "John Doe",\n  "email": "john@example.com"\n}'}
                          className="font-mono text-sm border-border/50 dark:border-gray-700"
                          rows={6}
                        />
                        {/* JSON Validation for Test Body */}
                        {(() => {
                          const body = testRequestBody.trim()
                          if (!body) {
                            return (
                              <p className="text-xs text-muted-foreground">
                                Valid JSON format required for request body.
                              </p>
                            )
                          }
                          try {
                            JSON.parse(body)
                            return (
                              <div className="text-xs text-green-600 dark:text-green-400">
                                ✅ Valid JSON format
                              </div>
                            )
                          } catch (error) {
                            return (
                              <div className="text-xs text-red-600 dark:text-red-400">
                                ❌ Invalid JSON: {error instanceof Error ? error.message : 'Please check your JSON syntax'}
                              </div>
                            )
                          }
                        })()}
                      </div>
                    )}
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
                onGenerateEndpoint={(endpoint) => onAddEndpoint(selectedCollection?.id || "", endpoint)}
                collectionId={selectedCollection?.id || ""}
              />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}
