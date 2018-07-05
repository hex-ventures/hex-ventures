/*!
 * GraphQL Express Server
 */
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";

import { makeExecutableSchema } from "graphql-tools";

import * as http from "http";
import * as https from "https";
import * as formidable from "express-formidable";
import * as fs from "fs";
import { GraphQLSchema, GraphQLError } from "graphql";
import * as path from "path";
import captureResolvers from "./capture/resolver";
import { authFilter, initAuth } from "./filters/auth";
import surfaceResolvers from "./surface/resolver";
import { Logger } from "./util/logging/logger";
import { getRequestContext, RequestContext } from "./filters/request-context";
import * as contextService from "request-context";
import * as morgan from "morgan";
// import * as rfs from "rotating-file-stream";
import { isProd, isLocal } from "./config";
import * as helmet from "helmet";

// tslint:disable-next-line
const { graphqlExpress } = require("apollo-server-express");

const LOGGER = new Logger("src/index.ts");

const schema = fs.readFileSync(
  path.join(__dirname, "../data-template/schema.graphql"),
  "utf8"
);

/*!
 * Make the schema executable
 */

const executableSchema: GraphQLSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers: [captureResolvers, surfaceResolvers]
});

initAuth();

const baseMorganFormat =
  `:date[iso] :reqId :userId :remote-addr :remote-user :referrer :user-agent ` +
  `:method :url HTTP/:http-version ` +
  `:status :res[content-length] :response-time`;

const reqMorganFormat = `req:  ${baseMorganFormat}`;
const respMorganFormat = `resp: ${baseMorganFormat}`;

morgan.token("reqId", req => {
  const requestContext = (req["requestContext"] as RequestContext) || null;
  return requestContext ? requestContext.reqId : "-";
});
morgan.token("userId", req => {
  const requestContext = (req["requestContext"] as RequestContext) || null;
  return requestContext ? requestContext.user.urn.toRaw() : "-";
});

const HTTPS_PORT = 8443;
const HTTP_PORT = 8080;
const app = express();

app.get("/", (_, res) => {
  res.send("running");
});

app.use(morgan(reqMorganFormat, { immediate: true }));
app.use(contextService.middleware("request"));
app.use(helmet());

if (isProd()) {
  app.use(
    cors({
      origin: ["https://tangleapp.co"],
      methods: ["GET", "POST"],
      optionsSuccessStatus: 200
    })
  );
} else {
  app.use(cors());
}
app.use(bodyParser.json());

app.use(morgan(respMorganFormat));

app.use(authFilter);
app.use(setRequestContext);

app.use(
  "/graphql",
  graphqlExpress({ schema: executableSchema, formatError: maskError })
);

app.use(formidable());

// For local allow insecure connection
if (isLocal()) {
  http.createServer(app).listen(HTTP_PORT, () => {
    LOGGER.info("Api HTTP listening on port " + HTTP_PORT);
  });
} else {
  const httpsOptions = {
    key: fs.readFileSync(process.env.TLS_KEY),
    cert: fs.readFileSync(process.env.TLS_CERT)
  };
  https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
    LOGGER.info("Api HTTPS server listening on port " + HTTPS_PORT);
  });
}

function setRequestContext(req, _, next): void {
  req.requestContext = getRequestContext();
  next();
}

function maskError(error: GraphQLError): GraphQLError {
  LOGGER.error(error.stack);
  if (process.env.NODE_ENV === "production") {
    return new GraphQLError("Error");
  } else {
    return error;
  }
}
