import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, map, mergeMap, of } from "rxjs";
import { Money } from "ts-money";
import { HalCollection, HalResource } from "./hal-resource";
import { ApiProblem, ConstraintViolationsProblem, createConstraintViolationsProblem, createUndefinedApiProblem } from "./problem";
import { RootApi } from "./root.api";
import { VERSION_1_JSON } from "./media-types";
import { Category } from "./categories.api";

type PlanListResponse = HalCollection<PlanListEntry>

@Injectable({
    providedIn: 'root'
})
export class PlansApi {

    constructor(private rootApi: RootApi, private http: HttpClient) {}

    getAll(): Observable<PlanListEntry[]> {
        const options = {
            'headers': {
                'Accept': VERSION_1_JSON
            }
        }
        return this.rootApi.getUrlFor("plans")
            .pipe(
                mergeMap(url => this.http.get<PlanListResponse>(url, options)),
                map(response => response._embedded['plans'])
            )
    }

    post(plan: NewPlanRequest): Observable<Plan | ConstraintViolationsProblem | ApiProblem> {
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
}

export type PlanStatus = 'FUTURE' | 'CURRENT' | 'PAST'

export interface PlanListEntry extends HalResource {
    id: number,
    name: string,
    period: {
        start: Date,
        end: Date
    },
    status: PlanStatus
}

export interface NewPlanRequest {
    name: string,
    period: {
        start: Date,
        end: Date
    },
    entries: Entry[]
}

export interface Plan extends HalResource {

    id: number,
    name: string,
    period: {
        start: Date,
        end: Date
    },
    entries: Entry[]
}

export interface Entry {

    category: Category,
    value: Money
}