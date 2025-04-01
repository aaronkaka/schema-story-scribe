
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import QueryDisplay from '@/components/QueryDisplay';
import { generateGraphQLQuery } from '@/api/anthropic';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [schema, setSchema] = useState('');
  const [userStory, setUserStory] = useState('');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryHistory, setQueryHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchQueryHistory();
  }, []);

  const fetchQueryHistory = async () => {
    const { data, error } = await supabase
      .from('query_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setQueryHistory(data);
    } else if (error) {
      console.error('Error fetching query history:', error);
    }
  };

  const handleGenerate = async () => {
    if (!schema) {
      setError('Please upload a GraphQL schema file');
      return;
    }

    if (!userStory) {
      setError('Please upload a user story file');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await generateGraphQLQuery(schema, userStory);
      
      if (result.success && result.data) {
        setQuery(result.data);
        toast({
          title: 'Success',
          description: 'GraphQL query generated successfully',
        });
        
        // Refresh history after generating a new query
        fetchQueryHistory();
      } else {
        setError(result.error || 'Failed to generate query');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to generate query',
        });
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistoryItem = (item: any) => {
    setSchema(item.schema);
    setUserStory(item.user_story);
    setQuery(item.generated_query);
    setShowHistory(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Declarative BFF</h1>
        <p className="text-lg text-muted-foreground">
          Generate GraphQL queries from your schema and user stories
        </p>
      </header>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <FileUpload
          title="Upload GraphQL Schema"
          accept=".graphql,.gql,.txt,.json"
          onFileChange={setSchema}
        />
        <FileUpload
          title="Upload User Story"
          accept=".txt,.md"
          onFileChange={setUserStory}
        />
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <Button 
          size="lg" 
          onClick={handleGenerate}
          disabled={isLoading || !schema || !userStory}
          className="px-8"
        >
          {isLoading ? (
            <>
              <span className="mr-2">Generating...</span>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            </>
          ) : (
            'Generate GraphQL Query'
          )}
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          onClick={() => setShowHistory(!showHistory)}
          className="px-8"
        >
          {showHistory ? 'Hide History' : 'Show History'}
        </Button>
      </div>

      {showHistory && queryHistory.length > 0 && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Queries</CardTitle>
              <CardDescription>Click on an item to load it</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queryHistory.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-4 border rounded-md cursor-pointer hover:bg-muted"
                    onClick={() => loadHistoryItem(item)}
                  >
                    <p className="font-medium">User Story Preview:</p>
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {item.user_story.substring(0, 100)}...
                    </p>
                    <p className="font-medium">Generated On:</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mb-8">
        <QueryDisplay query={query} isLoading={isLoading} />
      </div>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          This application uses Claude Sonnet to generate GraphQL queries based on your schema and user stories.
        </p>
        <p className="mt-1">
          Data is stored in your Supabase project for historical reference.
        </p>
      </footer>
    </div>
  );
};

export default Index;
