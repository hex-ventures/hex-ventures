import { StatementResult, Node } from "neo4j-driver/types/v1";
import { v4 as uuidv4 } from "uuid/v4";
import { escape } from "../../helpers/capture-parser";
import { executeQuery } from "../db";
import { getLabel } from "../helpers/urn-helpers";
import { Capture } from "../models/capture";
import { NotFoundError } from "../../util/exceptions/not-found-error";
import { CaptureUrn } from "../../urn/capture-urn";
import { UserUrn } from "../../urn/user-urn";

export function getMostRecent(
  userId: UserUrn,
  start: number,
  count: number
): Promise<Capture[]> {
  const params = { userId: userId.toRaw(), start, count };
  const query = `MATCH (capture:Capture)<-[created:CREATED]-(user:User {id:{userId}})
  WHERE NOT EXISTS (capture.archived)
  RETURN capture
  ORDER BY capture.created DESC
  SKIP {start} LIMIT {count}`;
  return executeQuery(query, params).then(formatCaptureArray);
}

export function getAllSince(
  userId: UserUrn,
  since: number
): Promise<Capture[]> {
  const params = { userId: userId.toRaw(), since };
  const query = `MATCH (capture:Capture)<-[created:CREATED]-(user:User {id:{userId}})
  WHERE capture.created > {since} AND NOT EXISTS (capture.archived)
  RETURN capture
  ORDER BY capture.created DESC
  LIMIT 50`;
  return executeQuery(query, params).then(formatCaptureArray);
}

export function getCapture(
  userId: UserUrn,
  captureUrn: CaptureUrn
): Promise<Capture> {
  const params = { userId: userId.toRaw(), captureUrn: captureUrn.toRaw() };
  const query = `
    MATCH (capture:Capture {id:{captureUrn}})<-[created:CREATED]-(user:User {id:{userId}})
    WHERE NOT EXISTS(capture.archived) OR capture.archived = false
    RETURN capture
  `;
  return executeQuery(query, params).then(formatCaptureResult);
}

export function getUntypedNode(userId: UserUrn, nodeId: string): Promise<Node> {
  const label = getLabel(nodeId);
  const params = { userId: userId.toRaw(), nodeId };
  const query = `MATCH (n:${label} {id:{nodeId}, owner:{userId}})
  WHERE NOT EXISTS(n.archived) OR n.archived = false
  RETURN n
  `;
  return executeQuery(query, params).then(result => {
    return result.records[0].get("n") as Node;
  });
}

export function getCapturesByRelatedNode(
  userId: UserUrn,
  nodeId: string
): Promise<Capture[]> {
  const label = getLabel(nodeId);
  const params = { userId: userId.toRaw(), nodeId };
  const query = `MATCH (other:${label} {id:{nodeId}})-[r]-(capture:Capture)<-[:CREATED]-(u:User {id:{userId}})
  WHERE NOT EXISTS(capture.archived) OR capture.archived = false
  RETURN capture
  `;
  return executeQuery(query, params).then(result => {
    return formatCaptureArray(result);
  });
}

export function getRandomCapture(userId: UserUrn): Promise<Capture> {
  const params = { userId: userId.toRaw() };
  const query = `MATCH (capture:Capture)<-[created:CREATED]-(user:User {id:{userId}})
  WHERE NOT EXISTS (capture.archived) OR capture.archived = false
  RETURN capture, rand() as number
  ORDER BY number
  LIMIT 1`;
  return executeQuery(query, params).then(formatCaptureResult);
}

export function archiveCaptureNode(
  userId: UserUrn,
  captureUrn: CaptureUrn
): Promise<Capture> {
  const params = { userId: userId.toRaw(), captureUrn: captureUrn.toRaw() };
  const query = `MATCH (capture:Capture {id:{captureUrn}})<-[:CREATED]-(u:User {id:{userId}})
  SET capture.archived = true
  RETURN capture
  `;
  return executeQuery(query, params).then(formatCaptureResult);
}

export function editCaptureNodeAndDeleteRelationships(
  userId: UserUrn,
  captureUrn: CaptureUrn,
  plainText: string,
  html: string
): Promise<Capture> {
  const params = {
    captureUrn: captureUrn.toRaw(),
    userId: userId.toRaw(),
    plainText: escape(plainText),
    html: escape(html)
  };
  const query = `
    MATCH (capture:Capture {id:{captureUrn}})<-[:CREATED]-(u:User {id:{userId}})
    OPTIONAL MATCH (capture)-[r]-(other)
    WHERE type(r)<>"CREATED" AND type(r)<>"INCLUDES"
    DELETE r
    SET capture.plainText={plainText}
    SET capture.body={html}
    RETURN capture`;
  return executeQuery(query, params).then(formatCaptureResult);
}

export function createCaptureNode(
  userId: UserUrn,
  plainText: string,
  html: string,
  parentId: string
): Promise<Capture> {
  const uuid = uuidv4();
  const captureUrn = new CaptureUrn(uuid);
  const parentQuery = parentId
    ? `OPTIONAL MATCH (u)-[:CREATED]-(parent {id:{parentId}}) WHERE parent:Session OR parent:EvernoteNote`
    : ``;
  const query = `MATCH (u:User {id:{userId}})
    ${parentQuery}
    CREATE (u)-[created:CREATED]->(capture:Capture {
      id:{captureUrn},
      body:{html},
      plainText:{plainText},
      created:TIMESTAMP(),
      owner:{userId}
    })
    ${parentId ? "CREATE (capture)<-[:INCLUDES]-(parent)" : ""}
    RETURN capture`;
  const params = {
    userId,
    plainText: escape(plainText),
    html: escape(html),
    parentId,
    captureUrn
  };
  return executeQuery(query, params).then(formatCaptureResult);
}

function formatCaptureArray(result: StatementResult): Capture[] {
  return result.records.map(formatCaptureRecord);
}

function formatCaptureResult(result: StatementResult): Capture {
  return formatCaptureRecord(result.records[0]);
}

function formatCaptureRecord(record: any): Capture {
  if (!record) {
    throw new NotFoundError("Could not find record");
  }
  return buildFromNeo(record.get("capture").properties);
}

export function buildFromNeo(props: any): Capture {
  return new Capture(
    CaptureUrn.fromRaw(props["id"]),
    props["body"],
    props["created"]
  );
}
