import {
  Controller,
  Get,
  Post,
  Res,
  Req,
  Param,
  HttpStatus,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { join } from 'path';
import { Response, Request } from 'express';
import { HttpService } from '@nestjs/axios';
import { readFileSync } from 'fs';
import * as yaml from 'yaml';

@Controller()
@Injectable()
export class AppController {
  private readonly api_url: string = 'localhost:8765';

  constructor(private httpService: HttpService) {}

  @Get('/.well-known/ai-plugin.json')
  serveManifest(@Res() res: Response) {
    console.log('Serving manifest', process.cwd());
    res.sendFile(join(process.cwd() + '/.well-known/', 'ai-plugin.json'));
  }

  @Get('/openapi.yaml')
  async serveOpenapiYaml(@Res() res: Response) {
    const yamlData = readFileSync(join(process.cwd(), 'openapi.yaml'), 'utf8');
    const yamlParsed = yaml.parse(yamlData);
    if (!yamlParsed) {
      throw new NotFoundException('File not found');
    }
    res.status(HttpStatus.OK).json(yamlParsed);
  }

  @Get('/openapi.json')
  serveOpenapiJson(@Res() res: Response) {
    res.sendFile(join(process.cwd(), 'openapi.json'));
  }

  // Define route handlers for GET and POST requests.
  // The path is extracted from the URL and passed into the handler as a parameter.
  @Get('/:path')
  @Post('/:path')
  wrapper(
    @Req() req: Request,
    @Res() res: Response,
    @Param('path') path: string,
  ) {
    const headersRequest = {
      'Content-Type': 'application/json',
    };

    const url = `${this.api_url}/${path}`;
    console.log(`Forwarding call: ${req.method} ${path} -> ${url}`);

    if (req.method === 'GET') {
      this.httpService
        .get(url, { headers: headersRequest, params: req.query })
        .subscribe(
          (response) => res.status(response.status).send(response.data),
          (error) => {
            console.error('Error occurred:', error);
            res
              .status(500)
              .send('An error occurred while processing your request.');
          },
        );
    } else if (req.method === 'POST') {
      console.log(req.headers);
      this.httpService
        .post(url, req.body, { headers: headersRequest, params: req.query })
        .subscribe(
          (response) => res.status(response.status).send(response.data),
          (error) => {
            console.error('Error occurred:', error);
            res
              .status(500)
              .send('An error occurred while processing your request.');
          },
        );
    } else {
      throw new Error(
        `Method ${req.method} not implemented in wrapper for path=${path}`,
      );
    }
  }
}
