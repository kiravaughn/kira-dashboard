import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { ContentReview } from '@prisma/client';

@Controller('api/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  async findAll(): Promise<ContentReview[]> {
    return this.reviewService.findAll();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string): Promise<ContentReview | null> {
    const filePath = `/home/kira/.openclaw/workspace/content/drafts/${slug}.md`;
    const review = await this.reviewService.findOne(filePath);
    
    if (!review) {
      // Auto-create if doesn't exist
      return this.reviewService.create({
        filePath,
        category: 'general',
        status: 'pending',
      });
    }
    
    return review;
  }

  @Post()
  async create(
    @Body() body: { filePath: string; category?: string },
  ): Promise<ContentReview> {
    return this.reviewService.create({
      filePath: body.filePath,
      category: body.category || 'general',
      status: 'pending',
    });
  }

  @Put(':slug')
  async update(
    @Param('slug') slug: string,
    @Body() body: { status?: string; notes?: string; category?: string },
  ): Promise<ContentReview> {
    const filePath = `/home/kira/.openclaw/workspace/content/drafts/${slug}.md`;
    
    try {
      return await this.reviewService.upsert(filePath, body);
    } catch (error) {
      throw new HttpException(
        'Failed to update review',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
