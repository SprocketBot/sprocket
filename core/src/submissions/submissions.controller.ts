import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionStatus } from '../db/internal';

@Controller('submissions')
export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) { }

    @Post()
    async createSubmission(
        @Body('matchId') matchId: string,
        @Body('userId') userId: string,
        @Body('data') data: Record<string, any>,
    ) {
        return this.submissionsService.createSubmission(matchId, userId, data);
    }

    @Get(':id')
    async getSubmission(@Param('id') id: string) {
        return this.submissionsService.getSubmission(id);
    }

    @Put(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: SubmissionStatus,
        @Body('reviewedBy') reviewedBy?: string,
        @Body('reason') reason?: string,
    ) {
        return this.submissionsService.updateStatus(id, status, reviewedBy, reason);
    }
}