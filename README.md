
# Declarative BFF - GraphQL Query Generator

This application helps you generate GraphQL queries from your schema and user stories using Anthropic's Claude AI.

## Usage

1. Upload your GraphQL schema file (AWS AppSync format)
2. Upload a text file containing your user story or business requirements
3. Click "Generate GraphQL Query" to have the AI create a query that fulfills the data requirements
4. Copy the generated query to use in your application

## API Configuration

This application is configured to call an API endpoint for query generation. In a production environment, you'll need to:

1. Set up an API endpoint that can make calls to Anthropic's Claude API
2. Configure your API key on the server-side to prevent exposure
3. Update the fetch URL in `src/api/anthropic.ts` to point to your endpoint

## Backend Implementation Notes

For a complete implementation, you would need to create a backend service that:

1. Receives the schema and user story from the frontend
2. Makes an authenticated request to Anthropic's Claude API
3. Returns the generated GraphQL query to the frontend

This approach keeps your API key secure and handles any CORS restrictions properly.

## Local Development

```bash
npm install
npm run dev
```

## Environment Variables

In a production environment, you'd need to set:

```
ANTHROPIC_API_KEY=your_api_key_here
```

Note: Never expose your API key in the frontend code.
