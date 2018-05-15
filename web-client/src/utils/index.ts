import tinygradient from "tinygradient";

import * as firebase from "firebase";

import qs from "query-string";

import { QueryProps } from "react-apollo";

import config from "../cfg";

import { Location } from "../types";

// Colors
export function getGradient(
  startColor: string,
  endColor: string,
  gradientNumber: number
) {
  return tinygradient(startColor, endColor).rgb(gradientNumber);
}

// Firebase
firebase.initializeApp(config.firebase);

export const firebaseAuth = firebase.auth;

// Window
export const getIsLargeWindow = (widthPixels: number) => {
  return widthPixels >= 1024;
};

// GraphQL
export const getIsLoadingOrError = (query: QueryProps): boolean => {
  return query.loading || query.error ? true : false;
};

// URLs
export const getQuery = (queryString: string) => {
  return (
    qs.parse(queryString, {
      ignoreQueryPrefix: true
    }).query || ""
  );
};

export const getId = (queryString: string) => {
  return (
    qs.parse(queryString, {
      ignoreQueryPrefix: true
    }).id || ""
  );
};

export const getCurrentLocation = (queryString: string): Location => {
  if (getQuery(queryString)) {
    return Location.Search;
  }

  if (getId(queryString)) {
    return Location.Detail;
  }

  return Location.CapturedToday;
};
