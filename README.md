# Intent OS

A future AI interface prototype: type your intention in a center console, generate structured workflow artifacts, and compose a personalized Home from saved cards.

## Interfaces

### AI Console (`/console`)
- ChatGPT / Cursor-style center console
- `@` to reference datasets
- `/` to launch workflows
- Responses are rich artifact cards (metrics, tables, charts, workflow steps, actions, insights)
- **Save to Home** pins an artifact for reuse

### Home (`/`)
- Empty dashed template slots
- Add saved artifacts from a dropdown
- Acts as a customizable app overview built from AI-generated surfaces

## Run

```bash
npm install
npm run dev
```

## Stack

- React + TypeScript + Vite
- React Router
- Local storage persistence for chat, saved artifacts, and Home layout
