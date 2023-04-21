import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { HalCollection, HalResource } from "./hal-resource";
import { Injectable } from "@angular/core";

type RootResponse = HalCollection<HalResource>;
type SmtmResourceName = 'categories' | 'wallets';

@Injectable({
    providedIn: 'root'
})
export class RootApi {

    private httpOptions = {
        "headers": new HttpHeaders({
            "Accept": "application/smtm.root.v1+json"
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