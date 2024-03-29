import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {catchError, map, mergeMap, Observable, of} from "rxjs";
import {Money} from "ts-money";
import {HalCollection, HalResource} from "./hal-resource";
import {
  ApiProblem,
  ConstraintViolationsProblem,
  createConstraintViolationsProblem,
  createUndefinedApiProblem
} from "./problem";
import {RootApi} from "./root.api";
import {VERSION_1_JSON} from "./media-types";
import {Label} from "./labels-api.service";

type PlanListResponse = HalCollection<PlanListEntry>

@Injectable({
  providedIn: 'root'
})
export class PlansApi {

  constructor(private rootApi: RootApi, private http: HttpClient) {
  }

  getAll(): Observable<PlanList> {
    const options = {
      'headers': {
        'Accept': VERSION_1_JSON
      }
    }
    return this.rootApi.getUrlFor("plans")
      .pipe(
        mergeMap(url => this.http.get<PlanListResponse>(url, options)),
        map(response => {
          return {
            active: response._embedded['active'],
            future: response._embedded['future'],
            past: response._embedded['past']
          }
        })
      )
  }

  get(planUrl: string): Observable<Plan> {
    return this.http.get<Plan>(planUrl, {
      'headers': {
        'Accept': VERSION_1_JSON
      }
    })
  }

  post(plan: PlanRequest): Observable<Plan | ConstraintViolationsProblem | ApiProblem> {
    const options = {
      'headers': {
        'Content-Type': VERSION_1_JSON,
        'Accept': VERSION_1_JSON
      }
    }
    return this.rootApi.getUrlFor('plans')
      .pipe(
        mergeMap(url => this.http.post<Plan>(url, plan, options)),
        catchError(error => of(createConstraintViolationsProblem(error) ?? createUndefinedApiProblem(error)))
      )
  }

  put(uri: string, request: PlanRequest): Observable<Plan | ConstraintViolationsProblem | ApiProblem> {
    const options = {
      'headers': {
        'Content-Type': VERSION_1_JSON,
        'Accept': VERSION_1_JSON
      }
    }
    return this.http.put<Plan>(uri, request, options)
      .pipe(
        catchError(error => of(createConstraintViolationsProblem(error) ?? createUndefinedApiProblem(error)))
      )
  }
}

export interface PlanList {
  active: PlanListEntry[],
  future: PlanListEntry[],
  past: PlanListEntry[]
}

export interface PlanListEntry extends HalResource {
  id: number,
  name: string,
  period: {
    start: Date,
    end: Date
  }
}

export interface PlanRequest {
  id?: number,
  name: string,
  period: {
    start: Date,
    end: Date
  },
  entries: Entry[]
}

export interface Plan extends HalResource {

  id?: number,
  name: string,
  period: {
    start: Date,
    end: Date
  },
  entries: Entry[]
}

export interface Entry {

  category: Label,
  value: Money
}
