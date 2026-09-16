import { FirstAidEntity } from 'src/first-aid/entities/first-aid.entity';
import dataSource from '../data-source';
// import { FirstAidEntity } from '../../src/first-aid/entities/first-aid.entity';
import { FIRST_AID_DATA } from '../data/firstAid.data';
// import { FirstAidEntity } from '../../src/first-aid/entities/first-aid.entity';
// import { FIRST_AID_DATA } from 'database/data/firstAid.data';

export const seedFirstAids = async () => {
  try {
    const repo = dataSource.getRepository(FirstAidEntity);

    let existingCodes = await repo.find({
      select: ['code'],
    });

    let codesSet = new Set(existingCodes?.map((i) => i.code));

    let toInsert = FIRST_AID_DATA?.filter((i) => !codesSet.has(i.code))?.map(
      (i) =>
        repo.create({
          code: i.code,
          description: i.description,
        }),
    );

    if (!toInsert?.length) {
      console.log('⏩ No new FirstAid records to seed');
      return;
    }

    await repo.save(toInsert);
    console.log(`✅ Seeded: ${toInsert?.length} items of first aid codes`);
  } catch (error) {
    console.log('Error during seedFirstAids: ', error);
  }
};
