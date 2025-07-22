"use client"

import { useState } from "react"
import { ChevronDown, Plus, Globe, Zap, Trash2, Upload } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Collection, MockEndpoint } from "./mock-api-platform"
import { AddEndpointDialog } from "./add-endpoint-dialog"
import { AddCollectionDialog } from "./add-collection-dialog"
import { ImportSwaggerDialog } from "./import-swagger-dialog"
import { mockApis, BackendEndpoint, useImportFromSwaggerMutation } from "@/apis/mocket"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AppSidebarProps {
  collections: Collection[]
  selectedCollection: Collection
  selectedEndpoint: MockEndpoint | null
  onSelectCollection: (collection: Collection) => void
  onSelectEndpoint: (endpoint: MockEndpoint | null) => void
  onAddEndpoint: (collectionId: string, endpoint: MockEndpoint) => void
  onAddCollection: (collection: Collection) => void
  isOpen: boolean
  onToggle: () => void
}

export function AppSidebar({
  collections,
  selectedCollection,
  selectedEndpoint,
  onSelectCollection,
  onSelectEndpoint,
  onAddEndpoint,
  onAddCollection,
  isOpen,
}: AppSidebarProps) {
  const [showAddEndpoint, setShowAddEndpoint] = useState(false)
  const [showAddCollection, setShowAddCollection] = useState(false)
  const [showImportSwagger, setShowImportSwagger] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [endpointToDelete, setEndpointToDelete] = useState<MockEndpoint | null>(null)
  
  const [importFromSwagger, { isLoading: isImporting }] = useImportFromSwaggerMutation()
  
  const [deleteMocket] = mockApis.useDeleteMocketMutation()
  
  // Fetch endpoints for the selected collection
  const { data: backendEndpoints } = mockApis.useGetMocksQuery(
    selectedCollection ? { collectionId: selectedCollection.id } : {},
    { skip: !selectedCollection }
  )
  
  // Convert backend endpoints to UI format
  const uiEndpoints: MockEndpoint[] = (backendEndpoints || []).map((endpoint: BackendEndpoint) => {
    // Handle the new response structure
    let response = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: ""
    }
    
    if (endpoint.response && typeof endpoint.response === 'object') {
      response = {
        status: endpoint.response.status || 200,
        headers: endpoint.response.headers || { "Content-Type": "application/json" } as Record<string, string> & { "Content-Type": string },
        body: endpoint.response.body || ""
      }
    }
    
    return {
      id: endpoint._id,
      name: endpoint.name,
      method: endpoint.method as MockEndpoint["method"],
      path: endpoint.endpoint, // Backend uses 'endpoint', UI uses 'path'
      description: endpoint.description || '',
      subDomain: endpoint.subDomain || '', // Include subdomain from backend
      response,
      request: endpoint.request || {}, // Include request data from backend
    }
  })

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

  const handleDeleteClick = (endpoint: MockEndpoint, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent endpoint selection when clicking delete
    setEndpointToDelete(endpoint)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!endpointToDelete) return
    
    try {
      await deleteMocket(endpointToDelete.id).unwrap()
      console.log("Endpoint deleted successfully:", endpointToDelete.name)
      
      // If the deleted endpoint was selected, clear the selection
      if (selectedEndpoint?.id === endpointToDelete.id) {
        onSelectEndpoint(null)
      }
    } catch (error) {
      console.error("Failed to delete endpoint:", error)
    } finally {
      setDeleteModalOpen(false)
      setEndpointToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setEndpointToDelete(null)
  }

  const handleImportSwagger = async (swagger: object) => {
    try {
      if (!selectedCollection) {
        console.error('No collection selected')
        return
      }
      
      console.log('Importing Swagger JSON for collection:', selectedCollection.id)
      const result = await importFromSwagger({
        collectionId: selectedCollection.id,
        swagger: swagger
      }).unwrap()
      
      console.log('Import successful:', result)
      
      // Only close modal after successful import
      setShowImportSwagger(false)
      
      // TODO: Add success notification/toast
    } catch (error) {
      console.error('Failed to import from Swagger:', error)
      // TODO: Add error notification/toast
      // Don't close modal on error so user can retry
    }
  }

  return (
    <>
      <div
        className={`${isOpen ? "w-80" : "w-0"} transition-all duration-300 overflow-hidden bg-card border-r border-border/50 dark:border-gray-800/50 flex flex-col h-full`}
      >
        <div className="border-b border-border/50 dark:border-gray-800/50 bg-gradient-to-r from-background to-muted/30">
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MockAPI
            </span>
          </div>
          <div className="px-4 pb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between border-border/50 dark:border-gray-700 hover:bg-muted/50 bg-transparent"
                >
                  <span className="truncate">{selectedCollection.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[280px] border-border/50 dark:border-gray-700">
                {collections.map((collection) => (
                  <DropdownMenuItem key={collection.id} onClick={() => onSelectCollection(collection)}>
                    {collection.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={() => setShowAddCollection(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Collection
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Endpoints</h3>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImportSwagger(true)}
                  className="h-6 w-6 p-0 hover:bg-muted/50"
                  title="Import from Swagger"
                >
                  <Upload className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddEndpoint(true)}
                  className="h-6 w-6 p-0 hover:bg-muted/50"
                  title="Add Endpoint"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-300px)]">
              {uiEndpoints.map((endpoint) => (
                <div
                  key={endpoint.id}
                  onClick={() => onSelectEndpoint(endpoint)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border group ${
                    selectedEndpoint?.id === endpoint.id
                      ? "bg-primary/10 border-primary/30 shadow-sm"
                      : "hover:bg-muted/50 border-transparent hover:border-border/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={`text-xs px-2 py-0.5 font-mono ${getMethodColor(endpoint.method)}`}
                    >
                      {endpoint.method}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      onClick={(e) => handleDeleteClick(endpoint, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-sm truncate">{endpoint.name}</div>
                    <div className="text-xs text-muted-foreground font-mono truncate">{endpoint.path}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 dark:border-gray-800/50 p-4">
          <Button variant="ghost" className="w-full justify-start hover:bg-muted/50">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-purple-500 to-pink-600 mr-3">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm">AI Mock Generator</span>
          </Button>
        </div>
      </div>

      <AddEndpointDialog
        open={showAddEndpoint}
        onOpenChange={setShowAddEndpoint}
        onAddEndpoint={(endpoint) => onAddEndpoint(selectedCollection.id, endpoint)}
        collectionId={selectedCollection.id}
      />

      <AddCollectionDialog
        open={showAddCollection}
        onOpenChange={setShowAddCollection}
        onAddCollection={onAddCollection}
      />
      
      <ImportSwaggerDialog
        open={showImportSwagger}
        onOpenChange={setShowImportSwagger}
        onImport={handleImportSwagger}
        isLoading={isImporting}
      />
      
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Endpoint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the endpoint "{endpointToDelete?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
