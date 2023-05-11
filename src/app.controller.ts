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

  // Define route handlers for GET and POST requests.
  // The path is extracted from the URL and passed into the handler as a parameter.
  @Get('/:path')
  @Post('/:path')
  // Asynchronously handle incoming requests.
  async wrapper(
    // The @Req() decorator injects the Request object. This object contains details about the incoming request.
    @Req() req: Request,
    // The @Res() decorator injects the Response object. This object is used to send a response back to the client.
    @Res() res: Response,
    // The @Param('path') decorator extracts the path parameter from the URL.
    @Param('path') path: string,
  ) {
    // Define headers for the request to be sent to the proxied API.
    const headersRequest = {
      'Content-Type': 'application/json',
    };

    // Construct the URL for the proxied API by appending the path to the base URL.
    const url = `${this.api_url}/${path}`;
    // Log the details of the incoming request and the URL it will be forwarded to.
    console.log(`Forwarding call: ${req.method} ${path} -> ${url}`);

    let response;

    // If the incoming request is a GET request, forward it to the proxied API as a GET request.
    if (req.method === 'GET') {
      response = await this.httpService
        .get(url, { headers: headersRequest, params: req.query })
        .firstValueFrom();
      // If the incoming request is a POST request, forward it to the proxied API as a POST request.
    } else if (req.method === 'POST') {
      console.log(req.headers);
      response = await this.httpService
        .post(url, req.body, { headers: headersRequest, params: req.query })
        .firstValueFrom();
      // If the incoming request is neither a GET nor a POST request, throw an error.
    } else {
      throw new Error(
        `Method ${req.method} not implemented in wrapper for path=${path}`,
      );
    }

    // Send the response from the proxied API back to the client.
    // The status code and data from the proxied API's response are forwarded as the status code and body of the response.
    res.status(response.status).send(response.data);
  }
}
