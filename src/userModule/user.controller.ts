import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Req,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  GoogleOAuthDTO,
  UserLoginDTO,
  UserLoginResponseDTO,
  UserRegistrationDTO,
  UserRegistrationResponseDTO,
  BookAppointmentDTO,
  UsersAppointmentListDTO,
} from './user.dto';
import { UserService } from './user.service';
import { DoctorService } from 'src/doctorModule/doctor.service';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles, RolesGuard } from 'src/common/guards/roles.guard';
import { TActorTypeEnum } from 'src/common/enums/database.enum';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly doctorService: DoctorService,
  ) { }

  @Get('/hello')
  async hello() {
    return 'Hello from user controller';
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: UserRegistrationResponseDTO,
    excludeExtraneousValues: true,
  })
  @Post('/registration')
  @ApiOperation({ summary: 'Register a new user with email and password' })
  async registration(
    @Body() body: UserRegistrationDTO,
  ): Promise<UserRegistrationResponseDTO> {
    const createdUser = await this.userService.userRegistration(body);
    return createdUser;
  }

  @Throttle({ default: { limit: 2, ttl: 40 } })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: UserLoginResponseDTO,
    excludeExtraneousValues: true,
  })
  @Post('/login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() body: UserLoginDTO): Promise<UserLoginResponseDTO> {
    const loginInformation = await this.userService.userLogin(body);
    return loginInformation;
  }

  @Throttle({ default: { limit: 5, ttl: 60 } })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: UserLoginResponseDTO,
    excludeExtraneousValues: true,
  })
  @Post('/google-oauth')
  @ApiOperation({
    summary: 'Login or register via Google OAuth (mobile ID token)',
    description:
      'Accepts a Google ID token obtained from the mobile SDK, validates it, creates the user if they do not exist, and returns a JWT access token.',
  })
  async googleOAuth(@Body() body: GoogleOAuthDTO): Promise<UserLoginResponseDTO> {
    return this.userService.googleOAuthLogin(body);
  }

  // ─── Doctor & Appointment Booking ────────────────────────
  @Get('/doctors')
  @ApiOperation({ summary: 'List all doctors and their services for patients' })

  async getAllDoctors() {
    return this.doctorService.getAllDoctorsWithServices();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TActorTypeEnum.USER])
  @Post('/appointments')
  @ApiOperation({ summary: 'Book an appointment with a doctor' })

  async bookAppointment(@Req() req, @Body() body: BookAppointmentDTO) {
    return this.doctorService.createConsultation(body.doctorId, {
      ...body,
      userId: req.user.userId,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TActorTypeEnum.USER])
  @Get('/appointments')
  @ApiOperation({ summary: 'List all appointments taken by the logged-in user' })
  @SerializeOptions({
    type: UsersAppointmentListDTO,

    excludeExtraneousValues: true,
  })
  async getUserAppointments(@Req() req) {
    return this.doctorService.getUserConsultations(req.user.userId);
  }
}
