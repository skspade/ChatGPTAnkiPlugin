import {
  Controller,
  Get,
  Post,
  Res,
  Req,
  Param,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { join } from 'path';
import { Response, Request } from 'express';
import { HttpService } from '@nestjs/axios';
import { readFileSync } from 'fs';
import * as yaml from 'yaml';

@Controller()
export class AppController {
  private readonly api_url: string = 'https://example.com';

  constructor(private httpService: HttpService) {}

  @Get('/.well-known/ai-plugin.json')
  serveManifest(@Res() res: Response) {
    res.sendFile(join(process.cwd(), 'ai-plugin.json'));
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

  @Get('/:path')
  @Post('/:path')
  async wrapper(
    @Req() req: Request,
    @Res() res: Response,
    @Param('path') path: string,
  ) {
    const headersRequest = {
      'Content-Type': 'application/json',
    };

    const url = `${this.api_url}/${path}`;
    console.log(`Forwarding call: ${req.method} ${path} -> ${url}`);

    let response;

    if (req.method === 'GET') {
      response = await this.httpService
        .get(url, { headers: headersRequest, params: req.query })
        .toPromise();
    } else if (req.method === 'POST') {
      console.log(req.headers);
      response = await this.httpService
        .post(url, req.body, { headers: headersRequest, params: req.query })
        .toPromise();
    } else {
      throw new Error(
        `Method ${req.method} not implemented in wrapper for path=${path}`,
      );
    }

    res.status(response.status).send(response.data);
  }
}
