import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { HalCollection, HalResource } from "./hal-resource";
import { Injectable } from "@angular/core";
import { VERSION_1_JSON } from "./media-types";

type RootResponse = HalCollection<HalResource>

export type SmtmResourceName = 'categories'
    | 'wallets'
    | 'plans'
    | 'current-plan-definitions'
    | 'upcoming-plan-definitions'
    | 'archived-plan-definitions'

@Injectable({
    providedIn: 'root'
})
export class RootApi {

    private httpOptions = {
        "headers": new HttpHeaders({
            "Accept": VERSION_1_JSON
        })
    };

    private apiRoot = "http://localhost:8080/"

    constructor(private http: HttpClient) { }

    getUrlFor(resource: SmtmResourceName): Observable<string> {
        return this.http.get<RootResponse>(this.apiRoot, this.httpOptions)
            .pipe(
                map((response) => response._links[resource].href)
            )
    }
}
