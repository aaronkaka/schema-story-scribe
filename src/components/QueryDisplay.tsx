
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QueryDisplayProps {
  query: string;
  isLoading: boolean;
}

const QueryDisplay: React.FC<QueryDisplayProps> = ({ query, isLoading }) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    if (query) {
      navigator.clipboard.writeText(query);
      setCopied(true);
      toast({
        description: "Query copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Generated GraphQL Query</CardTitle>
        {query && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative min-h-[300px] w-full rounded-md bg-black">
          {isLoading ? (
            <div className="flex h-[300px] items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : query ? (
            <pre className="text-white p-4 whitespace-pre-wrap overflow-auto h-[300px] text-sm font-mono">
              {query}
            </pre>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-white opacity-50">
              Generated query will appear here
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QueryDisplay;
