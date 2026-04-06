import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatService } from './chat.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('simulate')
  @ApiOperation({ summary: 'Simulate chat response' })
  @UseInterceptors(AnyFilesInterceptor())
  simulate(
    @Body() body: ChatRequestDto,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ) {
    return this.chatService.simulate(body, files ?? []);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload attachments (session-scoped mock)' })
  @UseInterceptors(AnyFilesInterceptor())
  upload(@UploadedFiles() files?: Array<Express.Multer.File>) {
    const metas =
      files?.map((f) => ({
        id: uuidv4(),
        kind: f.mimetype.startsWith('image/')
          ? 'image'
          : f.mimetype.startsWith('video/')
            ? 'video'
            : 'document',
        name: f.originalname,
        mimeType: f.mimetype,
        size: f.size,
      })) ?? [];

    return { attachments: metas };
  }
}
