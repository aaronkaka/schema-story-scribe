
import { supabase } from "@/integrations/supabase/client";

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
    // Call our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('generate-query', {
      body: { schema, userStory },
    });

    if (error) {
      console.error('Error calling generate-query function:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate GraphQL query',
      };
    }

    if (!data.success) {
      return {
        success: false,
        error: data.error || 'Failed to generate GraphQL query',
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    return {
      success: false,
      error: 'An error occurred while connecting to the AI service',
    };
  }
}
