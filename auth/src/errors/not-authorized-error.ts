import { CustomError } from './custom-error';

export class NotAuthorizedError extends CustomError {
    statusCode = 401;

    constructor() {
        super('Not Authorized');

        // built in class estension
        Object.setPrototypeOf(this, NotAuthorizedError.prototype);
    }

    serializeErrors() {
        return [
            { message: 'Not Authorized' }
        ];
    }
}