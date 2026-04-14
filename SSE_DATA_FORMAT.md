# SSE Data Format Specification

## Overview
This document describes the data format between the AI Service backend and the frontend for the Reading Assistant SSE stream.

## Event Format

### Backend → Frontend (Raw SSE)
```
event: <event_type>
data: <json_payload>

```

### Frontend Parsing
The frontend parses this into:
```typescript
interface ReadingStreamEvent {
  type: 'status' | 'summary_token' | 'vocab' | 'progress' | 'complete' | 'error';
  data: any;
}
```

## Event Types

### 1. `status` - Stage Updates
**Backend sends:**
```json
{
  "stage": "extracting" | "storing" | "summarizing" | "vocab" | "tts",
  "message": "Human readable description..."
}
```

**Frontend uses:**
```typescript
case 'status':
  setStreamStage(event.data.stage);  // 'extracting', 'storing', etc.
```

### 2. `summary_token` - Streaming Summary
**Backend sends:**
```json
{
  "token": "individual text chunk"
}
```

**Frontend uses:**
```typescript
case 'summary_token':
  setStreamingSummary(prev => prev + event.data.token);
```

### 3. `vocab` - Individual Vocabulary Term
**Backend sends:** (VocabTerm model)
```json
{
  "term": "Algorithm",
  "definition": "A step-by-step procedure",
  "context_snippet": "The algorithm efficiently sorts data"
}
```

**Frontend uses:**
```typescript
case 'vocab':
  setStreamingVocab(prev => [...prev, {
    word: event.data.term,           // ⚠️ Mapped: term → word
    definition: event.data.definition,
    synonyms: event.data.context_snippet ? [event.data.context_snippet] : []
  }]);
```

### 4. `progress` - TTS Progress
**Backend sends:**
```json
{
  "stage": "tts",
  "percent": 0 | 100
}
```

**Frontend uses:**
```typescript
case 'progress':
  setStreamProgress(event.data.percent);
```

### 5. `complete` - Final Result
**Backend sends:**
```json
{
  "session_id": "uuid-string",
  "user_id": "user-uuid",
  "summary_type": "concise",
  "summary": "Full summary text...",
  "vocab_terms": [
    {
      "term": "Algorithm",
      "definition": "A step-by-step procedure",
      "context_snippet": "Example context"
    }
  ],
  "tts_audio_b64": "base64encodedaudiodata...",
  "audio_mime_type": "audio/wav",
  "voice": "Zephyr"
}
```

**Frontend uses:**
```typescript
case 'complete':
  const finalSummary = event.data.summary || streamingSummaryRef.current;
  const finalVocab = event.data.vocab_terms?.map((t: any) => ({
    word: t.term,                    // ⚠️ Mapped: term → word
    definition: t.definition,
    synonyms: t.context_snippet ? [t.context_snippet] : []
  })) || streamingVocabRef.current;
  
  setSummarizedText(finalSummary);
  setVocabList(finalVocab);
  setTtsAudioB64(event.data.tts_audio_b64 || '');
  setAudioMimeType(event.data.audio_mime_type || 'audio/wav');
```

### 6. `error` - Error Information
**Backend sends:**
```json
{
  "code": 422 | 500,
  "message": "Error description"
}
```

**Frontend uses:**
```typescript
case 'error':
  toast.error(event.data.message || 'Analysis failed');
```

## Data Mapping Table

| Backend Field | Frontend State | Notes |
|--------------|----------------|-------|
| `term` | `word` | Renamed for UI consistency |
| `definition` | `definition` | Direct mapping |
| `context_snippet` | `synonyms[0]` | Stored as first synonym |
| `summary` | `summarizedText` | Direct mapping |
| `vocab_terms` | `vocabList` | Array mapping with field rename |
| `tts_audio_b64` | `ttsAudioB64` | Direct mapping |
| `audio_mime_type` | `audioMimeType` | Direct mapping |
| `session_id` | Not stored | Available if needed |

## Type Definitions

### Backend (Python/Pydantic)
```python
class VocabTerm(BaseModel):
    term: str
    definition: str
    context_snippet: str

class ReadingAnalysisResponse(BaseModel):
    session_id: str
    user_id: str
    summary_type: str
    summary: str
    vocab_terms: list[VocabTerm]
    tts_audio_b64: str
    audio_mime_type: str
    voice: str
```

### Frontend (TypeScript)
```typescript
interface VocabWord {
  word: string;
  definition: string;
  synonyms: string[];
}

interface ReadingStreamEvent {
  type: 'status' | 'summary_token' | 'vocab' | 'progress' | 'complete' | 'error';
  data: any;
}
```

## Event Sequence

```
1. status      {stage: 'extracting'}
2. status      {stage: 'storing'}
3. status      {stage: 'summarizing'}
4. summary_token {token: 'First...'}     ← Multiple
5. summary_token {token: 'chunk...'}     ← Multiple
6. status      {stage: 'vocab'}
7. vocab       {term, definition, context_snippet}  ← Multiple
8. status      {stage: 'tts'}
9. progress    {stage: 'tts', percent: 0}
10. progress   {stage: 'tts', percent: 100}
11. complete   {full result object}
```

## Debugging

Enable detailed logging in browser console to see:
```
[SSE Parser] Processing 2 events, remainder: 0 chars
[SSE Parser] Parsed event: status { keys: ['stage', 'message'] }
[SSE Parser] Parsed event: complete (complete event with full data)
[processStream] Event #11: complete { 
  hasSummary: true, 
  summaryLength: 928, 
  vocabCount: 5, 
  hasAudio: true, 
  audioLength: 3489984 
}
```

## Common Issues

### Issue: "Stream ended without complete event"
- **Cause**: Client disconnected before complete event arrived
- **Solution**: Check network tab, increase timeout, or reduce document size

### Issue: "Failed to parse data for event"
- **Cause**: Malformed JSON in data field
- **Solution**: Check backend is properly JSON-encoding data

### Issue: Vocab terms not showing
- **Cause**: Frontend expects `word` but backend sends `term`
- **Solution**: Verify mapping in frontend handler
