import { CustomError } from './custom-error';

export class BadRequestError extends CustomError {
    statusCode = 400;

    constructor(public message: string) {
        super(message);

        // built in class estension
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }

    serializeErrors() {
        return [
            { message: this.message }
        ];
    }
}