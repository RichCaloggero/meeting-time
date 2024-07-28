# MeetingTime

This webapp is meant to help coordinate events such as online meetings among several remote participants. It is designed to store only data about the event which is absolutely necessary for it's function. Users do not need to create accounts or provide eMail addresses to use the app!

## Operation

- Click "New meeting" to create an entry
   + the URL shown as the meeting ID must be copied and saved
   + the creator is responsible for providing this URL to all other participants
   + click "submit" to create the entry
- Updating
   + anyone with the URL can update the meeting with new timeslot proposals, as well as vote on existing proposals which increases their vote count by one
   + proposals sort with highest vote count first
   + Click "submit" to update the entry
- entries are automatically removed after they remain static for 7 days (i.e. not updated)

## Concurrent updates

If another user updates the meeting you are currently updating, a warning is generated and the entry is reloaded displaying the changes entered by the other user, possibly overwriting any changes you may have made. This shouldn't happen often, and the amount of data lost is minimal, essentially any timeslot proposals you may have voted on would be lost.

