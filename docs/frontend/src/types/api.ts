export interface Parameter {
  name: string; type: string; required: boolean;
  description: string; location: 'path' | 'query' | 'header' | 'body';
}
export interface RequestBody {
  contentType: string; schema: object; example: object;
}
export interface Endpoint {
  id: string; method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string; title: string; description: string;
  parameters: Parameter[]; requestBody: RequestBody | null;
  responseExample: object;
}
