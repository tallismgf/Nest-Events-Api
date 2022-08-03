import { AuthGuardJwt } from './../auth/auth-guard.jwt';
import { Body, ClassSerializerInterceptor, Controller, Delete, ForbiddenException, Get, HttpCode, Logger, NotFoundException, Param, ParseIntPipe, Patch, Post, Query, SerializeOptions, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { UpdateEventDto } from './input/update-event.dto';
import { CreateEventDto } from './input/create-event.dto';
import { EventsService } from './event.service';
import { ListEvents } from './input/list.event';
import { CurrentUser } from './../auth/current-user.decorator';
import { User } from './../auth/user.entity';

@Controller('/events')
@SerializeOptions({ strategy: 'excludeAll' })
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(
    private readonly eventsService: EventsService
  ) { }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@Query() filter: ListEvents) {
    const events = await this.eventsService
    .getEventsWithAttendeeCountFilteredPaginated(
      filter,
      {
        total: true,
        currentPage: filter.page,
        limit: 2
      }
    );

    this.logger.debug(`Found ${events.data.length} events`);
    return events;
  }

  // @Get('practice2')
  // async practice2() {
  //   return await this.repository.findOne({
  //     where: { id: 1 },
  //     relations: ['attendees']
  //   });
  //   const event = await this.repository.findOne({
  //     where: { id: 1 }
  //   })

  //   const event = new Event();
  //   event.id = 1;

  //   const attendee = new Attendee();
  //   attendee.name = 'Tomzera segundo';
  //   attendee.event = event;

  //   await this.attendeerepository.save(attendee);

  //   return event;

  //   return await this.repository.createQueryBuilder('e')
  //     .select(['e.id', 'e.name'])
  //     .orderBy('e.id', 'DESC')
  //     .take(3)
  //     .getMany()
  // }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const event = await this.eventsService.getEventWithAttendeeCount(id);

    if (!event) throw new NotFoundException();

    return event;
  }

  @Post()
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @Body() input: CreateEventDto,
    @CurrentUser() user: User
  ) {
    return this.eventsService.createEvent(input, user)
  }

  @Patch(':id')
  @UseGuards(AuthGuardJwt)@UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() input: UpdateEventDto,
    @CurrentUser() user: User
  ) {
    const event = await this.eventsService.findOne(id);

    if (!event) throw new NotFoundException();

    if (event.organizerId !== user.id) throw new ForbiddenException(
      null, 
      `You are not authorized to change this event`
    )

    return await this.eventsService.updateEvent(event, input)
  }

  @Delete(':id')
  @UseGuards(AuthGuardJwt)
  @HttpCode(204)
  async remove(
    @Param('id', ParseIntPipe) id: number, 
    @CurrentUser() user: User
  ) {
    const event = await this.eventsService.findOne(id);

    if (!event) throw new NotFoundException();

    if (event.organizerId !== user.id) throw new ForbiddenException(
      null, 
      `You are not authorized to remove this event`
    )

    await this.eventsService.deleteEvent(id);
  }
}
