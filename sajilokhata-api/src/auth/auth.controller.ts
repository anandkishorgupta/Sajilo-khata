import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    // REGISTER SHOP + OWNER
    @Post('register')
    @Public()
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @Public()
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
}
