import { HttpErrorResponse } from "@angular/common/http"

export interface ApiProblem {
    title: string,
    status: number
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

export function isConstraintViolation(object: any | ConstraintViolationsProblem): object is ConstraintViolationsProblem {
    return "violations" in object
  }