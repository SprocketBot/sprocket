import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import shortHash from "shorthash2";

@Injectable()
export class AnonymousAuthService {
    private readonly SIGNED_INT_32_MAX = 2147483647;

    constructor(private readonly jwtService: JwtService) {}

    generateAnonymousJwt(username: string): string {
        return this.jwtService.sign({
            username: username,
            userId: this.generateUserId(username),
            sub: this.generateUserId(username),
        });
    }

    generateUserId(username: string): number {
        const h = shortHash(username);
        let id = parseInt(Array.from(h)
            .map(char => char.charCodeAt(0))
            .join(""));
        while (id > this.SIGNED_INT_32_MAX) {
            const strId = id.toString();
            id = parseInt(strId.substring(0, strId.length - 1));
        }

        return id;
    }
}
