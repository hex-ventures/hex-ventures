import { parseEvernoteHtml } from "./evernote-html-parser";
import { save as saveFile } from "./file-db";
import { EvernoteNote } from "../models/evernote-note";
import { executeQuery } from "../../db/db";
import { createCapture } from "../../services/capture";
import { getAuthenticatedUser } from "../../services/request-context";
import { User } from "../../models";
import { StatementResult } from "neo4j-driver/types/v1";

export function importEvernoteNote(data): Promise<boolean> {
  const note: EvernoteNote = parseEvernoteHtml(data);
  const user: User = getAuthenticatedUser();
  return saveFile(data).then(() => {
    return createEvernoteNode(user.id, note).then(b => {
      if (b) {
        return createEvernoteCaptures(note, user).then(() => true);
      } else {
        return false;
      }
    });
  });
}

function createEvernoteCaptures(note: EvernoteNote, user: User): Promise<void> {
  const batchCreates = Promise.all(
    note.contents.map(content => {
      return createCapture(content, note.id, "HTML");
    })
  );
  return batchCreates.then(() => null);
}

function createEvernoteNode(
  userId: string,
  note: EvernoteNote
): Promise<boolean> {
  return getEvernoteNode(userId, note.id).then(node => {
    if (!node) {
      return executeQuery(`
      MATCH (u:User {id:"${userId}"})
      CREATE (note:EvernoteNote {id:"${note.id}",
      created:"${note.created}",
      lastModified:"${note.lastModified}",
      title:"${note.title}"})<-[:CREATED]-(u)
      RETURN note`).then((result: StatementResult) => {
        return true;
      });
    } else {
      return false;
    }
  });
}

function getEvernoteNode(userId: string, noteId: string) {
  return executeQuery(`
  MATCH (u:User {id:"${userId}"})-[:CREATED]->(note:EvernoteNote {id:"${noteId}"})
  RETURN note`).then((result: StatementResult) => {
    const record = result.records[0];
    return record;
  });
}
