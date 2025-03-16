export class ErrorResponse extends Error {
    constructor(
        public statusCode: number,
        public message: string
    ) {
        super(message);
        this.statusCode = statusCode;
    }
}

export class RequestError extends Error {
    constructor(public message: string) {
        super(message);
    }
}
