const casual = require('casual');
const {
  BlastUserCollection,
  UserWithIndexCollection,
} = require('../models/BlastUser');

function populateDBWithDummyData(numberOfItems) {
  const docs = [...new Array(numberOfItems)].map((_, index) => ({
    email: casual.email,
    name: casual.name,
    age: casual.integer(0, 50),
    details: casual.array_of_integers(100),
    birthDate: new Date(casual.date('YYYY-MM-DD')),
    favoriteFruit: index % 2 === 0 ? 'tomato' : 'potato',
  }));
  return docs;
}

const addPeople = async (req, res) => {
  const { number } = req.params;

  const data = populateDBWithDummyData(Number(number));
  await BlastUserCollection.deleteMany();
  const addedDB1 = await BlastUserCollection.insertMany(data);
  await UserWithIndexCollection.deleteMany();
  const addedDB2 = await UserWithIndexCollection.insertMany(data);
  res.json('{ addedDB1 }');
};

const getPeople = async (req, res) => {
  console.time('normal');
  const allPeople1 = await BlastUserCollection.find();
  console.timeEnd('normal');
  console.time('with_lean');
  await BlastUserCollection.find().lean();
  console.timeEnd('with_lean');

  console.time('without_details');
  await BlastUserCollection.find().select({ name: 1, email: 1, age: 1 });
  console.timeEnd('without_details');
  console.time('without_details_lean');
  await BlastUserCollection.find().lean().select({ name: 1, email: 1, age: 1 });
  console.timeEnd('without_details_lean');

  console.time('only_details');
  await BlastUserCollection.find().select({ details: 1 });
  console.timeEnd('only_details');
  console.time('only_details_lean');
  await BlastUserCollection.find().lean().select({ details: 1 });
  console.timeEnd('only_details_lean');

  res.json('{ allPeople1 }');
};

const findPerson = async (req, res) => {
  const { id } = req.params;
  // console.time('normal');
  // const user1 = await BlastUserCollection.findOne({ _id: id });
  // console.timeEnd('normal');

  console.time('age_blast_users');
  // const user1 = await BlastUserCollection.find({ age: { $gt: 25 } })
  const user1 = await BlastUserCollection.find({ _id: id })
    .select({
      name: 1,
    })
    .lean();
  console.timeEnd('age_blast_users');
  console.time('age_indexed_users');
  // const user2 = await UserWithIndexCollection.find({ age: { $gt: 25 } })
  const user2 = await UserWithIndexCollection.find({ _id: id })
    .select({
      name: 1,
    })
    .lean();
  console.timeEnd('age_indexed_users');

  res.json('users');
};

module.exports = {
  addPeople,
  getPeople,
  findPerson,
};
