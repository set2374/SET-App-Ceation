// Gemini File Search Integration for TLS eDiscovery Platform
// Uses direct REST API calls (SDK incompatible with Cloudflare Workers)

import { GoogleGenAI } from '@google/genai'

/**
 * Upload a PDF document to Gemini File Search using REST API
 * SDK doesn't work in Cloudflare Workers for large file uploads
 */
export async function uploadToGeminiFileSearch(
  fileBuffer: ArrayBuffer,
  fileName: string,
  documentId: number,
  matterId: number,
  batesNumber: string,
  apiKey: string,
  existingStoreName?: string  // Pass existing store name from database
): Promise<{ documentName: string; storeName: string }> {
  
  let storeName = existingStoreName
  
  // If no existing store, create one via REST API
  if (!storeName) {
    console.log(`[GEMINI] Creating new File Search Store via REST API...`)
    const displayName = `matter${matterId}tlsediscovery`
    
    const createResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/fileSearchStores?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName
        })
      }
    )
    
    if (!createResponse.ok) {
      const error = await createResponse.text()
      console.error(`[GEMINI] Failed to create store:`, error)
      throw new Error(`Failed to create File Search Store: ${error}`)
    }
    
    const storeData = await createResponse.json()
    storeName = storeData.name
    console.log(`[GEMINI] Created new File Search Store: ${storeName}`)
  } else {
    console.log(`[GEMINI] Using existing File Search Store: ${storeName}`)
  }
  
  // Step 1: Upload file to Google File API first
  const buffer = Buffer.from(fileBuffer)
  const base64Data = buffer.toString('base64')
  
  console.log(`[GEMINI] Step 1: Uploading file to Google File API (${buffer.length} bytes)...`)
  
  let fileResource
  try {
    const fileUploadResponse = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Upload-Protocol': 'multipart'
        },
        body: JSON.stringify({
          file: {
            displayName: batesNumber,
            mimeType: 'application/pdf'
          },
          content: base64Data
        })
      }
    )
    
    if (!fileUploadResponse.ok) {
      const error = await fileUploadResponse.text()
      console.error(`[GEMINI] File upload failed (${fileUploadResponse.status}):`, error)
      throw new Error(`File upload failed: ${error}`)
    }
    
    fileResource = await fileUploadResponse.json()
    console.log(`[GEMINI] File uploaded successfully: ${fileResource.name || fileResource.uri}`)
  } catch (fileError: any) {
    console.error(`[GEMINI] File upload exception:`, fileError.message)
    throw new Error(`File upload failed: ${fileError.message}`)
  }
  
  // Step 2: Import the uploaded file into File Search Store
  console.log(`[GEMINI] Step 2: Importing file into File Search Store...`)
  
  let uploadResponse
  try {
    uploadResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${storeName}/documents:import?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uri: fileResource.uri || fileResource.name,
          displayName: batesNumber,
          metadata: {
            document_id: documentId.toString(),
            matter_id: matterId.toString(),
            bates_number: batesNumber,
            original_filename: fileName
          },
          chunkingConfig: {
            chunkSize: 500,
            chunkOverlap: 100
          }
        })
      }
    )
    console.log(`[GEMINI] Import request completed. Status: ${uploadResponse.status}`)
  } catch (fetchError: any) {
    console.error(`[GEMINI] Import request threw exception:`, fetchError.message)
    throw new Error(`Import failed: ${fetchError.message}`)
  }
  
  if (!uploadResponse.ok) {
    const error = await uploadResponse.text()
    console.error(`[GEMINI] Import failed with status ${uploadResponse.status}:`, error)
    throw new Error(`Failed to import document (HTTP ${uploadResponse.status}): ${error}`)
  }
  
  let operation
  try {
    operation = await uploadResponse.json()
    console.log(`[GEMINI] Import initiated. Operation: ${operation.name || 'NO NAME'}`)
  } catch (jsonError: any) {
    console.error(`[GEMINI] Failed to parse JSON response:`, jsonError.message)
    throw new Error(`JSON parse failed: ${jsonError.message}`)
  }
  
  // Wait for indexing to complete by polling the operation
  let operationName = operation.name
  let attempts = 0
  const maxAttempts = 60  // 5 minutes max
  let done = false
  let documentName = ''
  
  while (!done && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000))  // Wait 5 seconds
    
    const statusResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`
    )
    
    if (!statusResponse.ok) {
      console.error(`[GEMINI] Failed to check operation status`)
      attempts++
      continue
    }
    
    const status = await statusResponse.json()
    done = status.done || false
    
    if (done && status.response) {
      documentName = status.response.name || ''
    }
    
    attempts++
    
    if (attempts % 6 === 0) {  // Log every 30 seconds
      console.log(`[GEMINI] Still indexing... (${attempts * 5}s elapsed)`)
    }
  }
  
  if (!done) {
    throw new Error(`Indexing timeout after ${attempts * 5} seconds`)
  }
  
  console.log(`[GEMINI] Indexing complete! Document: ${documentName}`)
  
  return {
    documentName: documentName,
    storeName: storeName
  }
}

/**
 * Query Gemini with File Search across matter documents
 */
export async function queryGeminiFileSearch(
  question: string,
  storeName: string,
  apiKey: string,
  selectedDocuments?: number[],
  matterId?: number
): Promise<{
  response: string
  citations: Array<{
    documentName: string
    batesNumber: string
    confidence: number
    snippet: string
  }>
  tokensUsed: number
}> {
  const ai = new GoogleGenAI({ apiKey })
  
  // Build metadata filter
  let metadataFilter = matterId ? `matter_id=${matterId}` : ''
  
  if (selectedDocuments && selectedDocuments.length > 0) {
    const docFilter = selectedDocuments.map(id => `document_id=${id}`).join(' OR ')
    if (metadataFilter) {
      metadataFilter = `(${docFilter}) AND ${metadataFilter}`
    } else {
      metadataFilter = docFilter
    }
  }
  
  console.log(`[GEMINI] Querying File Search Store: ${storeName}`)
  console.log(`[GEMINI] Filter: ${metadataFilter}`)
  console.log(`[GEMINI] Question: ${question}`)
  
  // Query with File Search - with retry logic for 503 errors
  let response
  let lastError
  const maxRetries = 3
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: question,
        config: {
          tools: [{
            fileSearch: {
              fileSearchStoreNames: [storeName],  // storeName already includes 'fileSearchStores/' prefix
              metadataFilter: metadataFilter || undefined  // Only pass if it exists
            }
          }]
        }
      })
      break // Success - exit retry loop
    } catch (error: any) {
      lastError = error
      
      // Check if it's a 503 (service unavailable) or 429 (rate limit) error
      const is503 = error.message?.includes('503') || error.message?.includes('overloaded')
      const is429 = error.message?.includes('429') || error.message?.includes('rate limit')
      
      if ((is503 || is429) && attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000 // Exponential backoff: 2s, 4s, 8s
        console.log(`[GEMINI] ${is503 ? 'Model overloaded (503)' : 'Rate limited (429)'}. Retrying in ${waitTime/1000}s... (attempt ${attempt}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      } else {
        // Not a retryable error, or max retries reached
        throw error
      }
    }
  }
  
  if (!response) {
    throw new Error(`Failed after ${maxRetries} retries: ${lastError?.message || 'Unknown error'}`)
  }
  
  // Extract citations from grounding metadata
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  
  const citations = groundingChunks.map((chunk: any) => ({
    documentName: chunk.web?.title || 'Unknown',
    batesNumber: chunk.web?.uri || '',
    confidence: chunk.score || 0,
    snippet: chunk.content?.substring(0, 200) || ''
  }))
  
  // Calculate token usage
  const usageMetadata = response.usageMetadata || {}
  const tokensUsed = (usageMetadata.promptTokenCount || 0) + (usageMetadata.candidatesTokenCount || 0)
  
  console.log(`[GEMINI] Response generated. Tokens used: ${tokensUsed}`)
  console.log(`[GEMINI] Citations found: ${citations.length}`)
  
  return {
    response: response.text || '',
    citations,
    tokensUsed
  }
}

/**
 * Get or create File Search Store for a matter
 */
export async function getOrCreateFileSearchStore(
  matterId: number,
  apiKey: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey })
  const storeName = `matter-${matterId}-tls-ediscovery`
  
  try {
    const store = await ai.fileSearchStores.get({ 
      name: `fileSearchStores/${storeName}` 
    })
    return store.name
  } catch {
    const store = await ai.fileSearchStores.create({
      config: { displayName: storeName }
    })
    return store.name
  }
}
