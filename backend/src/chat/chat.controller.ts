import { Body, Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatService } from './chat.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

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
}
