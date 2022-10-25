import {Injectable} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";

@Injectable()
export class EpicAuthGuard extends AuthGuard("epic") {}
