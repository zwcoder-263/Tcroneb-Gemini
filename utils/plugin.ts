import { FunctionDeclaration, SchemaType, type FunctionDeclarationSchema } from '@google/generative-ai'
import { convertParametersToJSONSchema } from 'openapi-jsonschema-parameters'
import { entries, values } from 'lodash-es'

export function findOperationById(plugin: OpenAPIDocument, id: string) {
  for (const [path, operations] of entries(plugin.paths)) {
    for (const [method, operation] of entries(operations) as [string, OpenAPIOperation][]) {
      if (operation?.operationId === id) {
        return { ...operation, path, method }
      }
    }
  }
}

function convertOpenAPIParameter(parameters: OpenAPIParameters): FunctionDeclarationSchema {
  const parametersSchema = convertParametersToJSONSchema(parameters || [])
  let properties = {}
  let required: string[] = []
  for (const schema of values(parametersSchema)) {
    if (schema && schema.properties) {
      properties = { ...properties, ...schema.properties }
      if (Array.isArray(schema.required)) {
        required = [...required, ...schema.required]
      }
    }
  }
  return {
    type: SchemaType.OBJECT,
    properties,
    required,
  }
}

export function convertRequestBodyToSchema(requestBody: OpenAPIRequestBody) {
  if (!requestBody || !requestBody.content) {
    return null
  }
  for (const [contentType, mediaType] of Object.entries(requestBody.content)) {
    if (mediaType.schema) {
      return mediaType.schema as FunctionDeclarationSchema
    }
  }
}

export function parsePlugin(id: string, plugin: OpenAPIDocument): FunctionDeclaration[] {
  const tools: FunctionDeclaration[] = []
  for (const operations of values(plugin.paths)) {
    for (const operation of values(operations) as OpenAPIOperation[]) {
      let parameters
      if (operation.parameters) {
        parameters = convertOpenAPIParameter(operation.parameters)
      } else if (operation.requestBody) {
        parameters = convertRequestBodyToSchema(operation.requestBody as OpenAPIRequestBody)
      }
      if (parameters) {
        tools.push({
          name: `${id}__${operation.operationId}`,
          description: operation.summary || operation.description || operation.operationId,
          parameters,
        })
      }
    }
  }
  return tools
}
