import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, catchError, map, mergeMap, of } from "rxjs";
import { HalCollection, HalResource } from "./hal-resource";
import { ConstraintViolationsProblem } from "./problem";
import { RootApi } from "./root.api";
import { Injectable } from "@angular/core";
import { VERSION_1_JSON } from "./media-types";

type LabelListResponse = HalCollection<Label>;

@Injectable({
    providedIn: 'root'
})
export class LabelsApi {

    constructor(private rootApi: RootApi, private http: HttpClient) {}

    getAll(): Observable<Label[]> {
        const options = {
            'headers': {
                'Accept': VERSION_1_JSON
            }
        }
        return this.rootApi.getUrlFor('labels')
            .pipe(
                mergeMap((url) => this.http.get<LabelListResponse>(url, options)),
                map((response) => response._embedded['labels'])
            )
    }

    post(label: Label): Observable<Label | ConstraintViolationsProblem> {
        const options = {
            'headers': {
                'Content-Type': VERSION_1_JSON,
                'Accept': VERSION_1_JSON
            }
        }

        return this.rootApi.getUrlFor('labels')
            .pipe(
                mergeMap((url) => this.http.post<Label>(url, label, options)),
                catchError((response) => of(this.handleErrorResponse(response))),
            )
    }

    put(label: Label): Observable<Label | ConstraintViolationsProblem> {
        const options = {
            'headers': {
                'Content-Type': VERSION_1_JSON
            }
        }

        return this.http.put<Label>(label._links!.self.href, label, options)
            .pipe(
                catchError((response) => of(this.handleErrorResponse(response)))
            )
    }

    delete(label: Label): Observable<void> {
        const options = {
            'headers': {
                'Content-Type': VERSION_1_JSON
            }
        }

        return this.http.delete<void>(label._links!.self.href, options)
    }

    private handleErrorResponse(response: HttpErrorResponse): ConstraintViolationsProblem {
        if (response.status === 422) {
            return response.error as ConstraintViolationsProblem
        }

        throw Error("api problem")
    }
}

export interface Label extends HalResource {
    id?: number,
    name: string
}
