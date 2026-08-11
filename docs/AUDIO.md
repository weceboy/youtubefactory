# Audio domain

Voice-over is modeled as an audio asset attached to a scene. The record stores provider/model/voice metadata, source text, optional generated URL, duration and generation status.

A ready voice-over can raise the scene's minimum duration to its audio duration. Timeline positions remain derived from scene durations.

Future audio types should reuse the asset registry rather than creating a second media store:

- voice-over
- music
- sound effects

Provider credentials remain server-side and audio generation should follow the same adapter boundary as image generation.
