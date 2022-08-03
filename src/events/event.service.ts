import { SelectQueryBuilder } from 'typeorm';
import { CreateEventDto } from './input/create-event.dto';
import { paginate, PaginateOptions } from './../pagination/paginator';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { AttendeeAnswerEnum } from './attendee.entity';
import { Event, PaginatedEvents } from './event.entity';
import { ListEvents, WhenEventFilter } from './input/list.event';
import { User } from './../auth/user.entity';
import { UpdateEventDto } from './input/update-event.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>
  ) {}

  private getEventsBaseQuery(): SelectQueryBuilder<Event> {
    return this.eventsRepository
      .createQueryBuilder('e')
      .orderBy('e.id', 'DESC')
  }

  public getEventsWithAttendeeCountQuery() {
    return this.getEventsBaseQuery()
      .loadRelationCountAndMap(
        'e.attendeeCount', 'e.attendees'
      )
      .loadRelationCountAndMap(
        'e.attendeeAccepted',
        'e.attendees',
        'attendee',
        (qb) => qb
          .where(
            'attendee.answer = :answer',
            { answer: AttendeeAnswerEnum.Accepted }
          )
      )
      .loadRelationCountAndMap(
        'e.attendeeMaybe',
        'e.attendees',
        'attendee',
        (qb) => qb
          .where(
            'attendee.answer = :answer',
            { answer: AttendeeAnswerEnum.Maybe }
          )
      )
      .loadRelationCountAndMap(
        'e.attendeeRejected',
        'e.attendees',
        'attendee',
        (qb) => qb
          .where(
            'attendee.answer = :answer',
            { answer: AttendeeAnswerEnum.Rejected }
          )
      );
  }

  private getEventsWithAttendeeCountFilteredQuery(filter ?: ListEvents): SelectQueryBuilder<Event> {
    let query = this.getEventsWithAttendeeCountQuery();

    if (!filter) return query;

    if (filter.when) {
      if(filter.when == WhenEventFilter.Today) {
        query = query.andWhere(
          `e.when >= CURDATE() AND e.when <= CURDATE() + INTERVAL 1 DAY`
        )
      }

      if(filter.when == WhenEventFilter.Tommorow) {
        query = query.andWhere(
          `e.when >= CURDATE() + INTERVAL 1 DAY AND e.when <= CURDATE() + INTERVAL 2 DAY`
        )
      } 

      if(filter.when == WhenEventFilter.ThisWeek) {
        query = query.andWhere(
          `YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1)`
        )
      } 

      if(filter.when == WhenEventFilter.NextWeek) {
        query = query.andWhere(
          `YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1 ) + 1`
        )
      } 
    }

    return query;
  }

  public async getEventsWithAttendeeCountFilteredPaginated(
    filter: ListEvents,
    paginateOptions: PaginateOptions
  ): Promise<PaginatedEvents> {
    return await paginate(
      await this.getEventsWithAttendeeCountFilteredQuery(filter),
      paginateOptions
    )
  }

  public async getEventWithAttendeeCount(id: number): Promise<Event | undefined> {
    const query = this.getEventsWithAttendeeCountQuery()
      .andWhere('e.id = :id', { id });
      
    this.logger.debug(query.getSql());

    return await query.getOne();
  }

  public async updateEvent(event: Event, input: UpdateEventDto): Promise<Event> {
    return await this.eventsRepository.save(
      new Event({
        ...event,
        ...input,
        when: input.when ? new Date(input.when) : event.when,
      })
    );
  }

  public async findOne(id: number): Promise<Event | undefined> {
    return this.eventsRepository.findOne({
      where: { id }
    })
  }

  public async createEvent(input: CreateEventDto, user: User): Promise<Event> {
    return await this.eventsRepository.save(
      new Event({
        ...input,
        organizer: user,
        when: new Date(input.when)
      })
    )
  }

  public async deleteEvent(id: number): Promise<DeleteResult> {
    return await this.eventsRepository
      .createQueryBuilder('e')
      .delete()
      .where('id = :id', { id })
      .execute()
  }

  private getEventsOrganizedByUserIdQuery(
    userId: number
  ): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery()
      .where('e.organizerId = :userId', { userId })
  }

  public async getEventsOrganizedByUserIdPaginated(
    userId: number,
    paginateOptions: PaginateOptions
  ): Promise<PaginatedEvents> {
    return await paginate<Event>(
      this.getEventsOrganizedByUserIdQuery(userId),
      paginateOptions
    );
  }

  private getEventsAttendedByUserIdQuery(
    userId: number
  ): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery()
      .leftJoinAndSelect('e.attendees', 'a')
      .where('a.userId = :userId', { userId });
  }

  public async getEventsAttendedByUserIdPaginated(
    userId: number,
    paginateOptions: PaginateOptions
  ): Promise<PaginatedEvents> {
    return await paginate<Event>(
      this.getEventsAttendedByUserIdQuery(userId),
      paginateOptions
    );
  }
}