export interface ApiProblem {
    title: string,
    status: number
}

export interface ConstraintViolationsProblem extends ApiProblem {
    violations: ConstraintViolation[]
}

export interface ConstraintViolation {
    subject: string,
    code: string,
    message?: string,
    parameters?: {
        [key: string]: string
    }
}