import {Controller, Get, UseGuards} from "@nestjs/common";

import {EpicAuthGuard} from "./strategies/epic/guards/epic.guard";
import {GoogleAuthGuard} from "./strategies/google/guards/google.guard";

@Controller("authentication")
export class AuthenticationController {
    @Get("google/login")
    @UseGuards(GoogleAuthGuard)
    async googleLogin(): Promise<string> {
        return "hey";
    }

    @Get("epic/login")
    @UseGuards(EpicAuthGuard)
    async epicLogin(): Promise<string> {
        return "hey";
    }
}
