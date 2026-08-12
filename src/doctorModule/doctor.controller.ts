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
  BadRequestException,
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
import { VerifyPrescriptionResponseDTO } from 'src/userModule/user.dto';

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
    @Body() body: DoctorLoginDTO,){
    return this.doctorService.doctorLogin(body);
  }

  // ─── Protected Profile Routes ───────────────────────────
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TActorTypeEnum.DOCTOR])
  @Get('/profile')
  @ApiOperation({ summary: 'Get doctor profile' })
  async getProfile(@Req() req) {
    return this.doctorService.getProfile(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TActorTypeEnum.DOCTOR])
  @Patch('/profile')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Update doctor profile and image' })
  async updateProfile(
    @Req() req,
    @Body() body: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^(image\/jpeg|image\/png)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.doctorService.updateProfile(req.user.userId, body, file);
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

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TActorTypeEnum.DOCTOR])
  @Post('/consultations/:id/upload-audio')
  @UseInterceptors(FileInterceptor('audio'))
  @ApiOperation({ summary: 'Upload audio recording for a consultation' })
  async uploadConsultationAudio(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100MB
          new FileTypeValidator({ fileType: /^(audio\/webm|audio\/ogg|audio\/mp4|audio\/mpeg|video\/webm)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.doctorService.uploadConsultationAudio(req.user.userId, id, file);
  }


  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles([TActorTypeEnum.DOCTOR])
  @Post('/consultations/prescriptions/:prescriptionId/verify')
  @ApiOperation({ summary: 'Verify a prescription file against DB and Blockchain' })
  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('file'))
  @SerializeOptions({
    type: VerifyPrescriptionResponseDTO,
    excludeExtraneousValues: true,
  })
  async verifyPrescription(
    @Param('prescriptionId') prescriptionId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required for verification');
    }
    return this.doctorService.verifyPrescription(Number(prescriptionId), file);
  }
}
