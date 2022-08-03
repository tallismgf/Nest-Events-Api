import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendee } from './attendee.entity';
import { AttendeesService } from './attendees.service';
import { CurrentUserEventAttendanceController } from './current-user-event-attendance.controller';
import { EventAttendeesController } from './event-attendees.controller';
import { EventsController } from './event.controller';
import { Event } from './event.entity';
import { EventsService } from './event.service';
import { EventsOrganizedByUserController } from './events-organized-by-user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Attendee]),
  ],
  controllers: [
    EventsController,
    EventAttendeesController,
    EventsOrganizedByUserController,
    CurrentUserEventAttendanceController
  ],
  providers: [
    EventsService,
    AttendeesService
  ]
})
export class EventsModule { }
