import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles, RolesGuard } from 'src/common/guards/roles.guard';
import { TActorTypeEnum } from 'src/common/enums/database.enum';
import { DoctorService } from './doctor.service';
import {
  CompleteConsultationDTO,
  CreateConsultationDTO,
  CreateDoctorServiceDTO,
  DoctorLoginDTO,
  DoctorLoginResponseDTO,
  DoctorRegistrationDTO,
  DoctorRegistrationResponseDTO,
  UpdateDoctorServiceDTO,
  UpdateConsultationScheduleDTO,
  UpdateConsultationDurationDTO,
} from './doctor.dto';

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) { }

  // ─── Public Auth Routes ─────────────────────────────────

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: DoctorRegistrationResponseDTO,
    excludeExtraneousValues: true,
  })
  @Post('/registration')
  @ApiOperation({ summary: 'Register a new doctor with profile and service info' })
  async registration(
    @Body() body: DoctorRegistrationDTO,
  ): Promise<DoctorRegistrationResponseDTO> {
    return this.doctorService.doctorRegistration(body);
  }

  @Throttle({ default: { limit: 2, ttl: 40 } })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: DoctorLoginResponseDTO,
    excludeExtraneousValues: true,
  })
  @Post('/login')
  @ApiOperation({ summary: 'Login as doctor with email and password' })
  async login(
    @Body() body: DoctorLoginDTO,
  ): Promise<DoctorLoginResponseDTO> {
    return this.doctorService.doctorLogin(body);
  }

  // ─── Protected Service (pricing) Routes ─────────────────
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TActorTypeEnum.DOCTOR])
  @Get('/services')
  @ApiOperation({ summary: 'List all services/pricing for the logged-in doctor' })
  async getServices(@Req() req) {
    return this.doctorService.getServices(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TActorTypeEnum.DOCTOR])
  @Post('/services')
  @ApiOperation({ summary: 'Create a new service/pricing entry' })
  async createService(
    @Req() req,
    @Body() body: CreateDoctorServiceDTO,
  ) {
    return this.doctorService.createService(req.user.userId, body);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TActorTypeEnum.DOCTOR])
  @Patch('/services/:serviceId')
  @ApiOperation({ summary: 'Update an existing service/pricing entry' })
  async updateService(
    @Req() req,
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @Body() body: UpdateDoctorServiceDTO,
  ) {
    return this.doctorService.updateService(
      req.user.userId,
      serviceId,
      body,
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TActorTypeEnum.DOCTOR])
  @Delete('/services/:serviceId')
  @ApiOperation({ summary: 'Delete a service/pricing entry' })
  async deleteService(
    @Req() req,
    @Param('serviceId', ParseIntPipe) serviceId: number,
  ) {
    return this.doctorService.deleteService(req.user.userId, serviceId);
  }

  // ─── Protected Dashboard Route ──────────────────────────

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TActorTypeEnum.DOCTOR])
  @Get('/dashboard')
  @ApiOperation({
    summary: 'Get doctor dashboard with total earnings and consultation time',
  })
  async getDashboard(@Req() req) {
    return this.doctorService.getDashboard(req.user.userId);
  }

  // ─── Protected Consultation Routes ──────────────────────

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TActorTypeEnum.DOCTOR])
  @Get('/consultations')
  @ApiOperation({ summary: 'List all consultations for the logged-in doctor' })
  async getConsultations(@Req() req) {
    return this.doctorService.getConsultations(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TActorTypeEnum.DOCTOR])
  @Post('/consultations')
  @ApiOperation({ summary: 'Create/log a new consultation session' })
  async createConsultation(
    @Req() req,
    @Body() body: CreateConsultationDTO,
  ) {
    return this.doctorService.createConsultation(req.user.userId, body);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TActorTypeEnum.DOCTOR])
  @Patch('/consultations/:id/complete')
  @ApiOperation({ summary: 'Mark a consultation as completed' })
  async completeConsultation(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CompleteConsultationDTO,
  ) {
    return this.doctorService.completeConsultation(
      req.user.userId,
      id,
      body,
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TActorTypeEnum.DOCTOR])
  @Patch('/consultations/:id/schedule')
  @ApiOperation({ summary: 'Update the scheduled time of a consultation' })
  async updateConsultationSchedule(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateConsultationScheduleDTO,
  ) {
    return this.doctorService.updateConsultationSchedule(
      req.user.userId,
      id,
      body,
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TActorTypeEnum.DOCTOR])
  @Patch('/consultations/:id/duration')
  @ApiOperation({ summary: 'Update the duration spent in a consultation' })
  async updateConsultationDuration(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateConsultationDurationDTO,
  ) {
    return this.doctorService.updateConsultationDuration(
      req.user.userId,
      id,
      body,
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TActorTypeEnum.DOCTOR])
  @Get('/consultations/:id/prescriptions')
  @ApiOperation({ summary: 'Get prescriptions for a specific consultation' })
  async getConsultationPrescriptions(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.doctorService.getPrescriptionsByConsultationId(
      req.user.userId,
      id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TActorTypeEnum.DOCTOR])
  @Post('/consultations/:id/prescriptions')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a prescription for a specific consultation' })
  async uploadConsultationPrescription(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /^(application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document|image\/jpeg|image\/png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.doctorService.uploadPrescription(req.user.userId, id, file);
  }
}
