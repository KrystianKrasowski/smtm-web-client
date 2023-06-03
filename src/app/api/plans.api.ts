import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { Money } from "ts-money";
import { HalResource } from "./hal-resource";
import { ConstraintViolationsProblem } from "./problem";
import { RootApi } from "./root.api";

@Injectable({
    providedIn: 'root'
})
export class PlansApi {

    constructor(private rootApi: RootApi, private http: HttpClient) {}

    post(plan: NewPlanRequest): Observable<Plan | ConstraintViolationsProblem> {
        const planResponse: Plan = {
            _links: {
                "self": {
                    "href": "http://localhost:8080/plans/1"
                }
            },
            id: 1,
            name: "07 July",
            period: {
                start: new Date("2023-07-01"),
                end: new Date("2023-07-31")
            },
            entries: [
                {
                    category: 1,
                    value: Money.fromDecimal(313.59, "PLN")
                }
            ]
        }

        const problemResponse: ConstraintViolationsProblem = {
            title: "Constraint violations detected",
            status: 422,
            violations: [
                {
                    path: "$.name",
                    code: "INVALID_CHARACTERS",
                    message: "Contains invalid characters: <,>,#",
                    parameters: {
                      invalidChars: "<,>,#"
                    }
                  },
                  {
                    path: "$.period.start",
                    code: "INVALID_DATE",
                    message: "Invalid date"
                  },
                  {
                    path: "$.period.end",
                    code: "INVALID_DATE",
                    message: "Invalid date"
                  },
                  {
                    path: "$.entries[0].category",
                    code: "UNKNOWN",
                    message: "Does not exist"
                  },
                  {
                    path: "$.entries[2].value",
                    code: "NOT_A_NUMBER",
                    message: "Invalid number"
                  }
            ]
        }
        return of(problemResponse)
    }
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

    category: number,
    value: Money
}