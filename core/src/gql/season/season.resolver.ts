import { Args, Query, Resolver, ResolveField, Root } from '@nestjs/graphql';
import { SeasonObject } from './season.object';
import { SeasonService } from './season.service';

@Resolver(() => SeasonObject)
export class SeasonResolver {
	constructor(private readonly seasonService: SeasonService) {}

	@Query(() => [SeasonObject])
	async seasons(): Promise<SeasonObject[]> {
		const entities = await this.seasonService.getAllSeasons();
		return entities as unknown as SeasonObject[];
	}

	@Query(() => SeasonObject)
	async season(@Args('id') id: string): Promise<SeasonObject> {
		const entity = await this.seasonService.getSeasonById(id);
		return entity as unknown as SeasonObject;
	}
}
