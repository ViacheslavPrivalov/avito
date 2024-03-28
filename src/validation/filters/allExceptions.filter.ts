import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

interface FilterResponse {
  message: string | string[];
  status: number;
  error: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let response: FilterResponse;

    if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
      response = {
        message: "Что-то пошло не так...",
        status: httpStatus,
        error: "Ошибка сервера",
      };
    } else {
      response = { ...exception.response };
    }

    httpAdapter.reply(ctx.getResponse(), response, httpStatus);
  }
}
