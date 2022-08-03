import { Event } from "./event.entity"

describe('Event entity tests', () => {
  test('Event shoud be initialized through constructor', () => {
    const event = new Event({
      name: 'Evento interessante',
      description: 'Vai ser legal'
    })

    expect(event).toEqual({
      name: 'Evento interessante',
      description: 'Vai ser legal',
      id: undefined,
      when: undefined,
      address: undefined,
      attendees: undefined,
      organizer: undefined,
      organizerId: undefined,
      event: undefined,
      attendeeCount: undefined,
      attendeeRejected: undefined,
      attendeeMaybe: undefined,
      attendeeAccepted: undefined,
    })
  })
})