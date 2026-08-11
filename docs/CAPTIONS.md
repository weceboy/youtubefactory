# Caption domain

Captions are derived from spoken scene text and scene duration. The current deterministic implementation groups words into readable segments and distributes segment time proportionally to character count.

Captions are derived data, not the canonical script. Rebuilding them after script, voice-over, or duration changes is expected.

Future render jobs can consume these segments for SRT, WebVTT, or burned-in subtitles.
