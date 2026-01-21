# Claude Code Projekteinstellungen

## Code-Stil Präferenzen

### Import-Stil

- **Keine Namespace-Importe verwenden** (`import * as fs from "node:fs"`)
- Stattdessen benannte Importe oder Default-Importe nutzen:

  ```typescript
  // ✅ Gut
  import { readFile, writeFile } from "node:fs/promises"
  import path from "node:path"

  // ❌ Vermeiden
  import * as fs from "node:fs"
  import * as nodePath from "node:path"
  ```

### TypeScript

- Strikte TypeScript-Einstellungen verwenden
- Keine `as T` Assertions, stattdessen Type Guards oder sichere Patterns nutzen
- `fs.promises` (async API) statt sync Varianten wie `fs.readFileSync`

### Allgemein

- Sprache für Code-Kommentare und Dokumentation: Englisch
- Sprache für Commit-Messages: Englisch
- Sprache für Kommunikation: Deutsch (wenn User Deutsch spricht)
