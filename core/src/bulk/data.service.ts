import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { FranchiseEntity } from '../db/franchise/franchise.entity';
import { ClubEntity } from '../db/club/club.entity';
import { TeamEntity } from '../db/team/team.entity';
import { SeasonEntity } from '../db/season/season.entity';

@Injectable()
export class DataService {
    private readonly logger = new Logger(DataService.name);

    constructor(private readonly dataSource: DataSource) { }

    async exportToJson(entity: 'Franchise' | 'Club' | 'Team' | 'Season'): Promise<string> {
        const repo = this.getRepo(entity);
        const data = await repo.find();
        return JSON.stringify(data, null, 2);
    }

    async exportToCsv(entity: 'Franchise' | 'Club' | 'Team' | 'Season'): Promise<string> {
        const repo = this.getRepo(entity);
        const data = await repo.find();
        if (data.length === 0) return '';

        const headers = Object.keys(data[0]).filter(key => typeof data[0][key] !== 'object');
        const csvRows = [headers.join(',')];

        for (const row of data) {
            const values = headers.map(header => {
                const val = row[header];
                return `"${String(val).replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    }

    async importFromJson(entity: 'Franchise' | 'Club' | 'Team' | 'Season', json: string): Promise<number> {
        const repo = this.getRepo(entity);
        const data = JSON.parse(json);

        return this.dataSource.transaction(async (manager) => {
            const result = await manager.save(repo.target, data);
            return Array.isArray(result) ? result.length : 1;
        });
    }

    private getRepo(entity: 'Franchise' | 'Club' | 'Team' | 'Season') {
        switch (entity) {
            case 'Franchise': return this.dataSource.getRepository(FranchiseEntity);
            case 'Club': return this.dataSource.getRepository(ClubEntity);
            case 'Team': return this.dataSource.getRepository(TeamEntity);
            case 'Season': return this.dataSource.getRepository(SeasonEntity);
        }
    }
}
