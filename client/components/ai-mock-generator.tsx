"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Wand2 } from "lucide-react"
import type { MockEndpoint } from "@/lib/constants/endpoints.constants"

interface AiMockGeneratorProps {
  onGenerateEndpoint: (endpoint: any) => void
  collectionId: string
}

export function AiMockGenerator({ onGenerateEndpoint, collectionId }: AiMockGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [apiType, setApiType] = useState("rest")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)

    // Simulate AI generation
    setTimeout(() => {
      const generatedEndpoint = {
        _id: Date.now().toString(),
        name: `AI Generated: ${prompt.slice(0, 30)}...`,
        method: "GET",
        path: `/api/${prompt.toLowerCase().replace(/\s+/g, "-").slice(0, 20)}`,
        description: `AI generated endpoint for: ${prompt}`,
        response: {
          status: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            {
              message: "AI generated response",
              data: {
                id: 1,
                name: "Sample Data",
                description: `Generated based on: ${prompt}`,
                timestamp: new Date().toISOString(),
                items: [
                  { id: 1, value: "Sample Item 1" },
                  { id: 2, value: "Sample Item 2" },
                ],
              },
            },
            null,
            2,
          ),
        },
      }

      onGenerateEndpoint(generatedEndpoint)
      setPrompt("")
      setIsGenerating(false)
    }, 2000)
  }

  const suggestions = [
    "Create a user management API with CRUD operations",
    "Generate an e-commerce product catalog API",
    "Build a blog post API with comments",
    "Create a task management API",
    "Generate a weather data API",
  ]

  return (
    <Card className="w-full border-border/50 dark:border-gray-800/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Mock Generator
        </CardTitle>
        <CardDescription>Describe what kind of API you need and let AI generate mock endpoints for you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-type">API Type</Label>
          <Select value={apiType} onValueChange={setApiType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rest">REST API</SelectItem>
              <SelectItem value="graphql">GraphQL</SelectItem>
              <SelectItem value="webhook">Webhook</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">Describe your API</Label>
          <Textarea
            id="prompt"
            placeholder="e.g., Create a user management API with endpoints for creating, reading, updating, and deleting users. Include authentication and user profiles."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="border-border/50 dark:border-gray-700"
          />
        </div>

        <div className="space-y-2">
          <Label>Quick Suggestions</Label>
          <div className="grid grid-cols-1 gap-1">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start text-left h-auto p-2 text-xs bg-transparent"
                onClick={() => setPrompt(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          {isGenerating ? "Generating..." : "Generate Mock API"}
        </Button>

        {isGenerating && (
          <div className="text-center text-sm text-muted-foreground">
            AI is analyzing your request and generating mock endpoints...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
