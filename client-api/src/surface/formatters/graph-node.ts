import { GraphNode } from "../models/graph-node";
import { Node } from "neo4j-driver/types/v1";
import { Capture } from "../../db/models/capture";
import { CAPTURE_LABEL, SESSION_LABEL } from "../../db/helpers/labels";
import { Session } from "../../db/models/session";

export function formatNode(node: Node): GraphNode {
  return new GraphNode(
    node.properties["id"],
    node.labels[0],
    node.properties["body"] ||
      node.properties["name"] ||
      node.properties["title"] ||
      node.properties["url"],
    0,
    []
  );
}

export function formatCapture(
  capture: Capture,
  parents?: Session[]
): GraphNode {
  return new GraphNode(
    capture.urn.toRaw(),
    CAPTURE_LABEL.name,
    capture.body,
    0,
    parents || []
  );
}

export function formatSession(session: Session): GraphNode {
  return new GraphNode(
    session.urn.toRaw(),
    SESSION_LABEL.name,
    session.title,
    0,
    []
  );
}
