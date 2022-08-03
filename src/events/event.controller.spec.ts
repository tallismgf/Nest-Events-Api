import { NotFoundException } from '@nestjs/common';
import { User } from './../auth/user.entity';
import { Repository } from 'typeorm';
import { EventsController } from './event.controller';
import { Event } from './event.entity';
import { EventsService } from './event.service';
import { ListEvents } from './input/list.event';

describe('EventsController', () => {
  let eventsController: EventsController
  let eventsService: EventsService;
  let eventsRepository: Repository<Event>

  beforeEach(() => {
    eventsService = new EventsService(eventsRepository);
    eventsController = new EventsController(eventsService)
  });

  it('Should return a list of events', async () => {
    const result = {
      first: 1,
      last: 1,
      limit: 10,
      data: []
    };

    // eventsService.getEventsWithAttendeeCountFilteredPaginated
    //   = jest.fn().mockImplementation((): any => result);

    const spy = jest.spyOn(eventsService, 'getEventsWithAttendeeCountFilteredPaginated')
      .mockImplementation((): any => result);

    expect(await eventsController.findAll(new ListEvents))
      .toEqual(result);

    expect(spy).toBeCalledTimes(1);
  });

  it('should not delete an event, whe it\'s not found', async () => {
    const deleteSpy = jest.spyOn(eventsService, 'deleteEvent');

    const findSpy = jest.spyOn(eventsService, 'findOne')
      .mockImplementation((): any => undefined)

    try {
      await eventsController.remove(1, new User())
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }

    expect(deleteSpy).toBeCalledTimes(0);
    expect(findSpy).toBeCalledTimes(1);
  })

});