export function createLlmAdapter(env = process.env) {
  return {
    name: env.LLM_MODEL ? 'llm' : 'demo',
    configured: Boolean(env.LLM_BASE_URL && env.LLM_API_KEY && env.LLM_MODEL),
    baseUrl: env.LLM_BASE_URL || ''
  };
}

export function createImageAdapter(env = process.env) {
  return {
    name: env.IMAGE_MODEL ? 'image' : 'unconfigured',
    configured: Boolean(env.IMAGE_BASE_URL && env.IMAGE_API_KEY && env.IMAGE_MODEL),
    baseUrl: env.IMAGE_BASE_URL || '',
    model: env.IMAGE_MODEL || ''
  };
}

export function createStockAdapters(env = process.env) {
  return ['unsplash', 'pexels', 'pixabay'].map(provider => ({
    provider,
    configured: provider === 'unsplash' ? Boolean(env.UNSPLASH_ACCESS_KEY) : provider === 'pexels' ? Boolean(env.PEXELS_API_KEY) : Boolean(env.PIXABAY_API_KEY)
  }));
}
