"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Loader2, Type } from "lucide-react"

interface ImportSwaggerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (swagger: object) => void
  isLoading?: boolean
}

export function ImportSwaggerDialog({ open, onOpenChange, onImport, isLoading = false }: ImportSwaggerDialogProps) {
  const [swaggerJson, setSwaggerJson] = useState("")
  const [isValidJson, setIsValidJson] = useState(true)
  
  // Reset dialog state when it closes
  useEffect(() => {
    if (!open) {
      setSwaggerJson("")
      setIsValidJson(true)
    }
  }, [open])

  // JSON formatter function
  const formatJson = () => {
    try {
      const parsed = JSON.parse(swaggerJson)
      const formatted = JSON.stringify(parsed, null, 2)
      setSwaggerJson(formatted)
    } catch (error) {
      console.error('Invalid JSON for formatting:', error)
    }
  }

  const validateJson = (jsonString: string) => {
    if (!jsonString.trim()) {
      setIsValidJson(true)
      return
    }
    
    try {
      JSON.parse(jsonString)
      setIsValidJson(true)
    } catch (error) {
      setIsValidJson(false)
    }
  }

  const handleJsonChange = (value: string) => {
    setSwaggerJson(value)
    validateJson(value)
  }

  const handleSave = () => {
    if (swaggerJson.trim() && isValidJson) {
      try {
        const parsedSwagger = JSON.parse(swaggerJson)
        onImport(parsedSwagger)
        // Don't close modal here - let the import process handle it
        // Modal will close after successful import or stay open on error
      } catch (error) {
        console.error('Failed to parse JSON:', error)
      }
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const canSave = swaggerJson.trim() && isValidJson

  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden border-border/50 dark:border-gray-700">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Upload className="h-5 w-5" />
            Import from Swagger/OpenAPI
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Paste your Swagger/OpenAPI JSON specification below. The endpoints will be imported into the current collection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="swagger-json" className="text-sm font-medium">
                Swagger/OpenAPI JSON
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={formatJson}
                disabled={!swaggerJson.trim() || !isValidJson}
                title="Format JSON"
                className="h-6 px-2 text-xs"
              >
                <Type className="h-3 w-3" />
              </Button>
            </div>
            <Textarea
              id="swagger-json"
              placeholder={`Paste your Swagger/OpenAPI JSON here, for example:\n{\n  "openapi": "3.0.0",\n  "info": {\n    "title": "My API",\n    "version": "1.0.0"\n  },\n  "paths": {\n    "/users": {\n      "get": {\n        "summary": "Get all users"\n      }\n    }\n  }\n}`}
              value={swaggerJson}
              onChange={(e) => handleJsonChange(e.target.value)}
              disabled={isLoading}
              className={`min-h-[300px] font-mono text-sm resize-none ${
                !isValidJson ? 'border-red-500 focus:border-red-500' : 'border-border/50 dark:border-gray-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            
            {/* Validation feedback */}
            {!isValidJson && (
              <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Invalid JSON format. Please check your syntax.
              </div>
            )}
            
            {isValidJson && swaggerJson.trim() && (
              <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Valid JSON format detected
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md border border-border/50">
            <p className="font-medium mb-1">Supported formats:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>OpenAPI 3.x specifications</li>
              <li>Swagger 2.0 specifications</li>
              <li>JSON format only (YAML not supported yet)</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="border-border/50 dark:border-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave || isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {isLoading ? "Importing endpoints..." : "Import Endpoints"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
