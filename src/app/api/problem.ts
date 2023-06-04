import { HttpErrorResponse } from "@angular/common/http"

export interface ApiProblem {
    type: string,
    title: string
}

export interface ConstraintViolationsProblem extends ApiProblem {
    violations: ConstraintViolation[]
}

export interface ConstraintViolation {
    path: string,
    code: string,
    message?: string,
    parameters?: {
        [key: string]: string
    }
}

export function createConstraintViolationsProblem(response: HttpErrorResponse): ConstraintViolationsProblem | undefined {
    if (response.status === 422) {
        return response.error as ConstraintViolationsProblem
    }

    return undefined
}

export function createUndefinedApiProblem(response: HttpErrorResponse): ApiProblem {
    return {
        'type': 'https:/static.smtm.com/api-problems/general',
        'title': response.error
    }
}

export function isConstraintViolation(object: any | ConstraintViolationsProblem): object is ConstraintViolationsProblem {
    return "violations" in object
}

export function isApiProblem(object: any | ApiProblem): object is ApiProblem {
    return 'title' in object && 'status' in object
}