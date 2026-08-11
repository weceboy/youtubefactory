# Timeline model

The timeline is currently deterministic and scene-based. Every scene receives a duration (default: 5 seconds) and is placed sequentially after the previous scene.

```text
Scene 01  0s  -> 5s
Scene 02  5s  -> 10s
Scene 03 10s  -> 15s
```

The model intentionally stores scene duration separately from derived start/end positions. This allows later audio, captions and render tracks to be recalculated without mutating every scene when one duration changes.

Future tracks can reference the same scene boundaries:

- visual track
- voice-over track
- music track
- sound effects
- captions

The renderer should consume a derived timeline rather than invent timing rules itself.
