import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { Response } from 'express';

@Catch(EntityNotFoundError)
export class EntityNotFoundFilter implements ExceptionFilter {
    catch(exception: EntityNotFoundError, host: ArgumentsHost) {

        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        // Get the name of entity from the string (Could not find any entity of type "xxxx" matching: ......)
        const entityType = exception.message.split('"')[1].split('"')[0].toLowerCase();

        response
            .status(HttpStatus.NOT_FOUND)
            .json({
                message: `The requested ${entityType} was not found.`
            });
    }
}