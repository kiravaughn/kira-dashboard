import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ContentReview, Prisma } from '@prisma/client';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<ContentReview[]> {
    return this.prisma.contentReview.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(filePath: string): Promise<ContentReview | null> {
    return this.prisma.contentReview.findUnique({
      where: { filePath },
    });
  }

  async create(data: Prisma.ContentReviewCreateInput): Promise<ContentReview> {
    return this.prisma.contentReview.create({ data });
  }

  async update(
    filePath: string,
    data: Prisma.ContentReviewUpdateInput,
  ): Promise<ContentReview> {
    return this.prisma.contentReview.update({
      where: { filePath },
      data: {
        ...data,
        reviewedAt: new Date(),
      },
    });
  }

  async upsert(
    filePath: string,
    data: Prisma.ContentReviewUpdateInput,
  ): Promise<ContentReview> {
    return this.prisma.contentReview.upsert({
      where: { filePath },
      update: {
        ...data,
        reviewedAt: new Date(),
      },
      create: {
        filePath,
        ...(data as any),
      },
    });
  }
}
