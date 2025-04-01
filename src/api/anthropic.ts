
export interface AnthropicAPIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export async function generateGraphQLQuery(
  schema: string,
  userStory: string
): Promise<AnthropicAPIResponse> {
  try {
    // Fetch from our backend (we'd create this separately in a server environment)
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        schema,
        userStory,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to generate GraphQL query',
      };
    }

    return {
      success: true,
      data: data.query,
    };
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    return {
      success: false,
      error: 'An error occurred while connecting to the AI service',
    };
  }
}
