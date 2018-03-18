/*!
 * Type definitions (typeDefs) that are turned into the schema
 */

export default `

type Capture {
  id: String!
  body: String!
  created: String!
}

schema {
  query: Query
  mutation: Mutation
}

type Query {
  getCapture(id: String!): Capture!,
  getCaptures: [Capture!]!
  search(rawQuery: String!): [Capture!]!
}

type Mutation {
  createCapture(body: String!): Capture!
}

`;
