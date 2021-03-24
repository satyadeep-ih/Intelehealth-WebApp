// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseURL: "https://afitesting.intelehealth.org/openmrs/ws/rest/v1",
  baseURLCoreApp:
    "https://afitesting.intelehealth.org/openmrs/coreapps/diagnoses",
  baseURLLegacy: "https://afitesting.intelehealth.org/openmrs",
  mindmapURL: "http://localhost:3004/api",
  // socketURL: "http://localhost:3004",
  socketURL: `http://localhost:3004`,
  // notificationURL: 'http://localhost:3004/notification'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
