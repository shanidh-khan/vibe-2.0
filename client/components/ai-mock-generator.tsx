"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sparkles, Wand2 } from "lucide-react"
import { useGenerateApiEndpointsMutation, type MocketEndpoint } from "../apis/aiApi"
import { toast } from "@/hooks/use-toast"
import type { MockEndpoint } from "./mock-api-platform"

interface AiMockGeneratorProps {
  onGenerateEndpoint: (endpoint: MockEndpoint) => void
  collectionId: string
}

export function AiMockGenerator({ onGenerateEndpoint, collectionId }: AiMockGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [generateApiEndpoints, { isLoading: isGenerating }] = useGenerateApiEndpointsMutation()
  
  const suggestions = [
    "Create a user management API with CRUD operations",
    "Generate an e-commerce product catalog API",
    "Build a blog post API with comments",
    "Create a task management API",
    "Generate a weather data API",
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    try {
      const result = await generateApiEndpoints({ description: prompt, collectionId }).unwrap()
      
      // Convert the AI response to the expected format and call onGenerateEndpoint for each endpoint
      result.data.endpoints.forEach((endpoint: MocketEndpoint) => {
        const generatedEndpoint: MockEndpoint = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: endpoint.name,
          method: endpoint.method as MockEndpoint["method"],
          path: endpoint.endpoint,
          description: endpoint.description,
          response: {
            status: 200,
            headers: endpoint.requestHeaders as Record<string, string>,
            body: JSON.stringify(endpoint.response, null, 2),
          },
          request: {
            headers: endpoint.requestHeaders as Record<string, string>,
            body: JSON.stringify(endpoint.request, null, 2),
          },
        }
        onGenerateEndpoint(generatedEndpoint)
      })

      setPrompt("")
      toast({
        title: "Success!",
        description: `Generated ${result.data.endpoints.length} REST API endpoints`,
      })
    } catch (error) {
      console.error("Error generating endpoints:", error)
      toast({
        title: "Error",
        description: "Failed to generate API endpoints. Please try again.",
        variant: "destructive",
      })
    }
  }

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
          <Label htmlFor="prompt">Describe your REST API</Label>
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
