import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { HelperService } from "./helper.service";
import { VisitData } from "../component/homepage/homepage.component";

@Injectable({
  providedIn: "root",
})
export class VisitService {
  private baseURL = environment.baseURL;
  public flagVisit: VisitData[] = [];
  public waitingVisit: VisitData[] = [];
  public progressVisit: VisitData[] = [];
  public completedVisit: VisitData[] = [];

  constructor(private http: HttpClient, private helper: HelperService) {}

  getVisits(params): Observable<any> {
    const query = {
      ...{
        includeInactive: false,
        v: "custom:(uuid,patient:(uuid,identifiers:(identifier),person:(display,gender,age,birthdate)),location:(display),encounters:(display,encounterDatetime,voided,encounterType:(display),encounterProviders),attributes)",
      },
      ...params,
    };
    const url = `${this.baseURL}/visit${this.helper.toParamString(query)}`;
    return this.http.get(url);
  }

  getVisit(uuid): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit/${uuid}?includeInactive=false&v=custom:(uuid,patient:(uuid,identifiers:(identifier),person:(display,gender,age,birthdate)),location:(display),encounters:(display,encounterDatetime,voided,encounterType:(display),encounterProviders),attributes)`;
    return this.http.get(url);
  }

  clearVisits() {
    this.flagVisit = new Array();
    this.waitingVisit = new Array();
    this.progressVisit = new Array();
    this.completedVisit = new Array();
  }

  recentVisits(id): Observable<any> {
    const url = `${this.baseURL}/visit?patient=${id}&v=custom:(uuid,display,patient:(uuid))`;
    return this.http.get(url);
  }

  fetchVisitDetails(uuid): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const url = `${this.baseURL}/visit/${uuid}?v=custom:(uuid,display,startDatetime,stopDatetime,encounters:(display,uuid,obs:(display,uuid,value),encounterProviders:(display,provider:(uuid,attributes))),patient:(uuid,identifiers:(identifier),person:(display)))`;
    return this.http.get(url);
  }

  getAttribute(visitId): Observable<any> {
    const url = `${this.baseURL}/visit/${visitId}/attribute`;
    return this.http.get(url);
  }

  postAttribute(visitId, json): Observable<any> {
    const url = `${this.baseURL}/visit/${visitId}/attribute`;
    return this.http.post(url, json);
  }

  deleteAttribute(visitId, uuid) {
    const url = `${this.baseURL}/visit/${visitId}/attribute/${uuid}`;
    return this.http.delete(url);
  }

  patientInfo(id): Observable<any> {
    // tslint:disable-next-line: max-line-length
    const url = `${this.baseURL}/patient/${id}?v=custom:(identifiers,person:(display,gender,birthdate,age,preferredAddress:(cityVillage),attributes:(value,attributeType:(display))))`;
    return this.http.get(url);
  }

  getVisitCounts(speciality) {
    return this.http.get(
      `${environment.mindmapURL}/openmrs/getVisitCounts?speciality=${speciality}`
    );
  }

  getVisitData(payload) {
    return this.http.post(
      `${this.baseURL.replace(
        "/openmrs/ws/rest/v1",
        ""
      )}/prescription/prescription/visitData`,
      payload
    );
  }
}
