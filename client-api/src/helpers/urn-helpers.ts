const baseStr: string = "urn:hex";

function toUserUrn(id: string): string {
  return `${baseStr}:user:${id}`;
}

function toCaptureUrn(id: string): string {
  return `${baseStr}:capture:${id}`;
}

function toEntityUrn(id: string): string {
  return `${baseStr}:entity:${id}`;
}

function toTagUrn(id: string): string {
  return `${baseStr}:tag:${id}`;
}

function toSessionUrn(id: string): string {
  return `${baseStr}:session:${id}`;
}

function toLinkUrn(id: string): string {
  return `${baseStr}:link:${id}`;
}

function toEvernoteNoteUrn(
  userId: string,
  title: string,
  created: number
): string {
  return `${userId};${title};${created.toString()}`;
}

function getUrnType(urn: string): string {
  return urn.split(":")[2];
}

export {
  toUserUrn,
  toCaptureUrn,
  toEntityUrn,
  toTagUrn,
  toSessionUrn,
  toLinkUrn,
  toEvernoteNoteUrn,
  getUrnType
};
