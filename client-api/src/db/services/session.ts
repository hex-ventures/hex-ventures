import { StatementResult } from "neo4j-driver/types/v1";
import { v4 as uuidv4 } from "uuid/v4";
import { toSessionUrn } from "../helpers/urn-helpers";
import { executeQuery } from "../db";
import { Session } from "../models/session";
import { NotFoundError } from "../../util/exceptions/not-found-error";
import { SessionUrn } from "../../urn/session-urn";

export function get(userId: string, sessionId: SessionUrn): Promise<Session> {
  const query = `
  MATCH (session:Session {id:{sessionId}})<-[:CREATED]-(u:User {id:{userId}})
  RETURN session`;
  const params = { userId, sessionId: sessionId.toRaw() };
  return executeQuery(query, params).then((result: StatementResult) => {
    return formatSessionRecord(result.records[0]);
  });
}

export function deleteSession(
  userId: string,
  sessionId: SessionUrn
): Promise<boolean> {
  const query = `
  MATCH (s:Session {id:{sessionId}})<-[:CREATED]-(u:User {id:{userId}})
  DETACH DELETE s
  `;
  const params = { userId, sessionId: sessionId.toRaw() };
  return executeQuery(query, params).then(() => true);
}

export function edit(
  userId: string,
  sessionId: SessionUrn,
  title: string
): Promise<Session> {
  const query = `
    MATCH (session:Session {id:{sessionId}})<-[:CREATED]-(u:User {id:{userId}})
    ${title ? "SET session.title = {title}" : "REMOVE session.title"}
    RETURN session`;
  const params = { userId, sessionId: sessionId.toRaw(), title };
  return executeQuery(query, params).then((result: StatementResult) => {
    return formatSessionRecord(result.records[0]);
  });
}

export function create(userId: string, title: string): Promise<Session> {
  const uuid = uuidv4();
  const sessionUrn = toSessionUrn(uuid);
  const query = `
    MATCH (u:User {id:{userId}})
    CREATE (session:Session {id:{sessionUrn},
      ${title ? "title:{title}," : ""}
      created:TIMESTAMP(),
      owner:{userId}})
    CREATE (session)<-[:CREATED]-(u)
    RETURN session`;
  const params = { userId, sessionUrn, title };
  return executeQuery(query, params).then((result: StatementResult) => {
    return formatSessionRecord(result.records[0]);
  });
}

function formatSessionRecord(record: any): Session {
  if (!record) {
    throw new NotFoundError("Could not find record");
  }
  return Session.fromProperties(record.get("session").properties);
}
