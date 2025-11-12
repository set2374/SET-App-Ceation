// Gemini File Search Integration for TLS eDiscovery Platform
// Uses Google Generative AI SDK with Gemini 2.5 Flash

import { GoogleGenAI } from '@google/genai'

/**
 * Upload a PDF document to Gemini File Search and get it indexed
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
  const ai = new GoogleGenAI({ apiKey })
  
  let fileSearchStore
  
  if (existingStoreName) {
    // Use existing store from database
    try {
      fileSearchStore = await ai.fileSearchStores.get({ name: existingStoreName })
      console.log(`[GEMINI] Using existing File Search Store from DB: ${existingStoreName}`)
    } catch (error) {
      console.error(`[GEMINI] Failed to get existing store ${existingStoreName}:`, error)
      throw new Error(`File Search Store ${existingStoreName} not found. Please check the database.`)
    }
  } else {
    // Create new store for this matter
    const displayName = `matter-${matterId}-tls-ediscovery`
    console.log(`[GEMINI] Creating new File Search Store: ${displayName}`)
    fileSearchStore = await ai.fileSearchStores.create({
      config: { displayName }
    })
    console.log(`[GEMINI] Created new File Search Store: ${fileSearchStore.name}`)
  }
  
  // Convert ArrayBuffer to Buffer for upload
  const buffer = Buffer.from(fileBuffer)
  
  console.log(`[GEMINI] Uploading ${fileName} (${buffer.length} bytes) to File Search Store...`)
  
  // Upload and import document with metadata
  let operation = await ai.fileSearchStores.uploadToFileSearchStore({
    file: buffer,
    fileSearchStoreName: fileSearchStore.name,
    config: {
      mimeType: 'application/pdf',  // Required for Gemini to process the file
      displayName: batesNumber,  // Use Bates number as display name for citations
      customMetadata: [
        { key: "document_id", numericValue: documentId },
        { key: "matter_id", numericValue: matterId },
        { key: "bates_number", stringValue: batesNumber },
        { key: "original_filename", stringValue: fileName }
      ],
      chunkingConfig: {
        whiteSpaceConfig: {
          maxTokensPerChunk: 500,   // Larger chunks for legal documents
          maxOverlapTokens: 100      // Ensure context continuity
        }
      }
    }
  })
  
  console.log(`[GEMINI] Upload initiated. Waiting for indexing to complete...`)
  
  // Wait for indexing to complete
  let attempts = 0
  const maxAttempts = 60  // 5 minutes max
  
  while (!operation.done && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000))  // Wait 5 seconds
    operation = await ai.operations.get({ operation })
    attempts++
    
    if (attempts % 6 === 0) {  // Log every 30 seconds
      console.log(`[GEMINI] Still indexing... (${attempts * 5}s elapsed)`)
    }
  }
  
  if (!operation.done) {
    throw new Error(`Indexing timeout after ${attempts * 5} seconds`)
  }
  
  console.log(`[GEMINI] Indexing complete! Document ready for search.`)
  
  return {
    documentName: operation.response?.name || '',
    storeName: fileSearchStore.name
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
