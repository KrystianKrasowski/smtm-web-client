import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, catchError, map, mergeMap, of } from "rxjs";
import { HalCollection, HalResource } from "./hal-resource";
import { ConstraintViolationsProblem } from "./problem";
import { RootApi } from "./root.api";
import { Injectable } from "@angular/core";

type CategoryListResponse = HalCollection<Category>;

@Injectable({
    providedIn: 'root'
})
export class CategoriesApi {

    constructor(private rootApi: RootApi, private http: HttpClient) {}

    getAll(): Observable<Category[]> {
        const options = {
            'headers': {
                'Accept': 'application/smtm.category-list.v1+json'
            }
        }
        return this.rootApi.getUrlFor('categories')
            .pipe(
                mergeMap((url) => this.http.get<CategoryListResponse>(url, options)),
                map((response) => response._embedded['categories'])
            )
    }

    post(category: NewCategory): Observable<Category | ConstraintViolationsProblem> {
        const options = {
            'headers': {
                'Content-Type': 'application/smtm.new-category.v1+json',
                'Accept': 'application/smtm.category.v1+json'
            }
        }
    
        return this.rootApi.getUrlFor('categories')
            .pipe(
                mergeMap((url) => this.http.post<Category>(url, category, options)),
                catchError((response) => of(this.handleErrorResponse(response))),
            )
    }

    put(category: Category): Observable<Category | ConstraintViolationsProblem> {
        const options = {
            'headers': {
                'Content-Type': 'application/smtm.category.v1+json'
            }
        }

        return this.http.put<Category>(category._links.self.href, category, options)
            .pipe(
                catchError((response) => of(this.handleErrorResponse(response)))
            )
    }

    delete(category: Category): Observable<void> {
        const options = {
            'headers': {
                'Content-Type': 'application/smtm.category.v1+json'
            }
        }
        
        return this.http.delete<void>(category._links.self.href, options)
    }

    private handleErrorResponse(response: HttpErrorResponse): ConstraintViolationsProblem {
        if (response.status === 422) {
            return response.error as ConstraintViolationsProblem
        }

        throw Error("api problem")
    }
}

export interface Category extends HalResource {
    id: number,
    name: string
}

export interface NewCategory {
    name: string
}