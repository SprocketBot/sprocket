import {Injectable} from "@nestjs/common";

@Injectable()
export class NanoidService {
    private genId: (size: number) => string;

    async onApplicationBootstrap(): Promise<void> {
        this.genId = await import("nanoid").then(r => r.nanoid);
    }

    gen(size: number = 6): string {
        return this.genId(size);
    }
}
