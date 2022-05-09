import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import shortHash from "shorthash2";

@Injectable()
export class AnonymousAuthService {
    private readonly SIGNED_INT_32_MAX = 2147483647;

    constructor(private readonly jwtService: JwtService) {}

    generateAnonymousJwt(username: string): string {
        // return this.jwtService.sign({
        //     username: username,
        //     randomInvalidData: new Array(50).fill(Math.random()).join(Math.random().toString()),
        //     userId: this.generateUserId(username),
        //     sub: this.generateUserId(username),
        // });
        return this.jwtService.sign({
            "sub": "112140878637707264",
            "username": "bmdonald1998@gmail.com",
            "userId": 7,
            "orgs": [
                69
            ],
            "iat": 1652057047,
        })
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
