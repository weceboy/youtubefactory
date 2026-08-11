# Rendering architecture

A render is reproducible from a project snapshot plus a render manifest. The manifest contains the selected script version, scene data, asset references, voice-over metadata, derived timeline, captions and output settings.

Lifecycle:

```text
Project + Script Version
        ↓
  Render Manifest
        ↓
    Validation
        ↓
    Render Queue
        ↓
    Render Worker
        ↓
      FFmpeg
        ↓
  Video Artifact
```

The current code stops at the queue/manifest boundary. No fake FFmpeg completion is reported. The worker must later resolve local/remote media into a safe staging directory, build an explicit FFmpeg command, capture logs, and register the resulting artifact.

## Required worker guarantees

- validate the manifest before starting
- pin the exact script version
- preserve asset provenance
- fail explicitly on missing media
- capture stderr/stdout and exit code
- write output atomically
- make retries observable
- register the final artifact after successful validation
