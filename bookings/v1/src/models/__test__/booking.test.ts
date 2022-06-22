import { Booking } from "../booking";

it('Implements optimistic concurrency control', async () => {
    const booking = Booking.build({
        net_weight:10,
        trucking_note:'test',
        user_id:'123'
    });
    await booking.save();

    const firstInstance = await Booking.findById(booking.id);
    const secondInstance = await Booking.findById(booking.id);

    firstInstance?.set({net_weight: 15});
    secondInstance?.set({net_weight: 25});

    await firstInstance?.save();

    try{
        await secondInstance?.save();
    } catch (err){
        return;
    }

    throw new Error('Should not reach this line');
});

it('increments the version number on multiple events', async () => {
    const booking = Booking.build({
        net_weight:10,
        trucking_note:'test',
        user_id:'123'
    });

    await booking.save();
    expect(booking.version).toEqual(0);
    await booking.save();
    expect(booking.version).toEqual(1);
    await booking.save();
    expect(booking.version).toEqual(2);
});