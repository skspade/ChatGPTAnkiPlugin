import {
  Controller,
  Get,
  Post,
  Res,
  HttpStatus,
  NotFoundException,
  Injectable,
  Body,
} from '@nestjs/common';
import { join } from 'path';
import { Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { readFileSync } from 'fs';
import * as yaml from 'yaml';
import { DeckRequest, NotesRequest } from './types';

@Controller()
@Injectable()
export class AppController {
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

  @Get('/logo.png')
  serveLogo(@Res() res: Response) {
    res.sendFile(join(process.cwd(), 'logo.png'));
  }

  async invoke(action, version, params = {}) {
    try {
      const response = await this.httpService
        .post('http://127.0.0.1:8765', { action, version, params })
        .toPromise();
      const data = response.data;

      if (Object.getOwnPropertyNames(data).length != 2) {
        throw 'response has an unexpected number of fields';
      }
      if (!data.hasOwnProperty('error')) {
        throw 'response is missing required error field';
      }
      if (!data.hasOwnProperty('result')) {
        throw 'response is missing required result field';
      }
      if (data.error) {
        throw data.error;
      }
      return data.result;
    } catch (e) {
      throw e;
    }
  }

  @Post('/createDeck')
  createDeck(@Body() req: DeckRequest) {
    console.log('createDeck', req.deck);
    return this.invoke('createDeck', 6, { deck: req.deck });
  }

  @Post('/addCards')
  addNotes(@Body() req: NotesRequest) {
    console.log('addCards', req);
    return this.invoke('addNotes', 6, req);
  }
}
