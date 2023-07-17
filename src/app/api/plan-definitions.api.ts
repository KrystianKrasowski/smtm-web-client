import { HttpClient } from "@angular/common/http";
import { RootApi, SmtmResourceName } from "./root.api";
import { HalCollection, HalResource } from "./hal-resource";
import { Observable, map, mergeMap } from "rxjs";
import { VERSION_1_JSON } from "./media-types";
import { Injectable } from "@angular/core";

type PlanDefinitionsListResponse = HalCollection<PlanDefinition>

@Injectable({
    providedIn: 'root'
})
export class PlanDefinitionsApi {

    constructor(private rootApi: RootApi, private http: HttpClient) {}

    getCurrentPlans(): Observable<PlanDefinition[]> {
        return this.getPlans('current-plan-definitions')
    }

    getUpcomingPlans(): Observable<PlanDefinition[]> {
        return this.getPlans('upcoming-plan-definitions')
    }

    getArchivedPlans(): Observable<PlanDefinition[]> {
        return this.getPlans('archived-plan-definitions')
    }

    private getPlans(kind: SmtmResourceName): Observable<PlanDefinition[]> {
        const options = {
            'headers': {
                'Accept': VERSION_1_JSON
            }
        }

        return this.rootApi.getUrlFor(kind)
            .pipe(
                mergeMap(url => this.http.get<PlanDefinitionsListResponse>(url, options)),
                map(response => response._embedded['plans'])
            )
    }
}

export interface PlanDefinition extends HalResource {
    id: number,
    name: string,
    period: {
        start: Date,
        end: Date
    }
}