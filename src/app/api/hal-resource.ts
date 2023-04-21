export interface HalResource {
    _links: {
        self: {
            href: string
        },
        [rel: string]: {
            href: string
        }
    }
}

export interface HalCollection<T extends HalResource> {
    _links: {
        self: {
            href: string
        },
        [rel: string]: {
            href: string
        }
    },
    count: number,
    total: number,
    _embedded: {
        [resource: string]: T[]
    }
}