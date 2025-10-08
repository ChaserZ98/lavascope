export class ErrorResponse extends Error {
    constructor(
        public statusCode: number,
        public override message: string
    ) {
        super(message);
        this.statusCode = statusCode;
    }
}

export class RequestError extends Error {
    constructor(public override message: string) {
        super(message);
    }
}
