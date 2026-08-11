# Render artifacts

A successful MP4 render becomes a first-class artifact. The artifact records the render job and manifest that produced it, file size, MIME type and SHA-256 content hash.

This creates a reproducible chain:

```text
Project → Script Version → Render Manifest → Render Job → Video Artifact
```

The artifact registry should later support retention policies, downloads, thumbnails, publishing metadata and cleanup of obsolete render files.
