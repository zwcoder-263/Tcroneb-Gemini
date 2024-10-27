const plugins: Record<string, OpenAPIDocument> = {
  OfficialSearch: {
    components: {
      schemas: {
        searchResponse: {
          type: 'object',
          description: 'The search results from search.',
          properties: {
            results: {
              type: 'object',
              description: 'The web results of the search.',
              properties: {
                title: {
                  type: 'string',
                  description: 'The title of the result.',
                },
                description: {
                  type: 'string',
                  description:
                    'The sanitized description of the result. Bold tags will still be present in this string.',
                },
                url: {
                  type: 'string',
                  description: 'The URL of the result.',
                },
                hostname: {
                  type: 'string',
                  description: 'The hostname of the website. (i.e. "google.com")',
                },
                icon: {
                  type: 'string',
                  description: 'The icon of the website.',
                },
                rawDescription: {
                  type: 'string',
                  description: 'The description of the result.',
                },
              },
            },
            vqd: {
              type: 'string',
              description: 'The VQD of the search query.',
            },
            noResults: {
              type: 'boolean',
              description: 'Whether there were no results found.',
            },
          },
        },
      },
    },
    info: {
      title: 'Web Search',
      description: 'A plugin for search the web with DuckDuckGo.',
      version: 'v1',
    },
    openapi: '3.0.1',
    paths: {
      '/search': {
        post: {
          operationId: 'searchWeb',
          summary: 'Searching for data information on the Internet.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    query: {
                      type: 'string',
                      description: 'The query to search.',
                      example: 'RMB to USD exchange rate.',
                    },
                  },
                  required: ['query'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/searchResponse',
                  },
                },
              },
            },
          },
        },
      },
    },
    servers: [
      {
        url: '/api/plugin',
      },
    ],
  },
}

export default plugins
