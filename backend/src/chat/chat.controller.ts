import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('simulate')
  @ApiOperation({ summary: 'Simulate chat response' })
  simulate(@Body() body: ChatRequestDto) {
    return this.chatService.simulate(body);
  }
}
