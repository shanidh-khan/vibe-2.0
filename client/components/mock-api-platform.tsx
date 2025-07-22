"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { MainContent } from "@/components/main-content"
import { collectionApis } from "@/apis/collection"
import { mockApis, BackendEndpoint } from "@/apis/mocket"

export interface MockEndpoint {
  id: string
  name: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  description?: string
  subDomain?: string
  response: {
    status: number
    headers: Record<string, string>
    body: string
  }
  request?: {
    headers?: Record<string, string>
    body?: string
  }
}

export interface Collection {
  id: string
  name: string
  subDomain?: string
  endpoints: MockEndpoint[]
}

export function MockApiPlatform() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [selectedEndpoint, setSelectedEndpoint] = useState<MockEndpoint | null>(null)
  
  // Fetch collections from API
  const { data: apiCollections, isLoading, error } = collectionApis.useGetCollectionsQuery()
  const { data: endpoints } = mockApis.useGetMocksQuery(
    selectedCollection ? { collectionId: selectedCollection.id } : {},
    { skip: !selectedCollection }
  )

  // Convert API collections to UI format and set default selections
  useEffect(() => {
    if (apiCollections && apiCollections.length > 0) {
      // Map API collections to UI format
      console.info(apiCollections, 'shaniddssdfsdh')
      const uiCollections: Collection[] = apiCollections.map(apiCollection => ({
        id: apiCollection._id, // Map _id to id
        name: apiCollection.name,
        subDomain: apiCollection.subDomain || '', // Include subdomain from backend
        endpoints: [] // Will be populated when selectedCollection changes
      }))
      
      setCollections(uiCollections)
      
      // Set default selection if none selected
      if (!selectedCollection && uiCollections.length > 0) {
        setSelectedCollection(uiCollections[0])
        // You'll need to fetch endpoints for the collection separately
      }
    }
  }, [apiCollections, selectedCollection])

  // Update selected collection with endpoints when endpoints are fetched
  useEffect(() => {
    console.log('Endpoints effect triggered:', { selectedCollection: selectedCollection?.id, endpoints })
    
    if (selectedCollection && endpoints && endpoints.length > 0) {
      const uiEndpoints: MockEndpoint[] = endpoints.map((endpoint: BackendEndpoint) => {
        console.log('Mapping endpoint:', endpoint)
        
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

      console.log('Mapped UI endpoints:', uiEndpoints)

      // Update the selected collection with its endpoints
      setCollections(prevCollections => {
        const updatedCollections = prevCollections.map(collection => 
          collection.id === selectedCollection.id 
            ? { ...collection, endpoints: uiEndpoints }
            : collection
        )
        console.log('Updated collections:', updatedCollections)
        return updatedCollections
      })
    }
  }, [endpoints, selectedCollection])

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading collections...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error loading collections</p>
          <p className="text-sm mt-2">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  const updateEndpoint = (updatedEndpoint: MockEndpoint) => {
    if (!selectedCollection) return
    
    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === selectedCollection.id
          ? {
              ...collection,
              endpoints: collection.endpoints.map((endpoint) =>
                endpoint.id === updatedEndpoint.id ? updatedEndpoint : endpoint,
              ),
            }
          : collection,
      ),
    )
    setSelectedEndpoint(updatedEndpoint)
  }

  const addEndpoint = (collectionId: string, endpoint: MockEndpoint) => {
    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId ? { ...collection, endpoints: [...collection.endpoints, endpoint] } : collection,
      ),
    )
  }

  const addCollection = (collection: Collection) => {
    setCollections((prev) => [...prev, collection])
  }

  // Don't render if no collections loaded yet
  if (collections.length === 0 || !selectedCollection) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <p>No collections found</p>
          <p className="text-sm text-muted-foreground mt-2">Create a collection to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-background">
      <AppSidebar
        collections={collections}
        selectedCollection={selectedCollection}
        selectedEndpoint={selectedEndpoint}
        onSelectCollection={setSelectedCollection}
        onSelectEndpoint={setSelectedEndpoint}
        onAddEndpoint={addEndpoint}
        onAddCollection={addCollection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-0" : "ml-0"}`}>
        <MainContent
          selectedEndpoint={selectedEndpoint}
          selectedCollection={selectedCollection}
          onUpdateEndpoint={updateEndpoint}
          onAddEndpoint={addEndpoint}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>
    </div>
  )
}
