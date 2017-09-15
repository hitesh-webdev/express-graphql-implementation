const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = require('graphql');

/* Hardcoded Data
================================================ */

let persons = [
    {id: 1, name: 'Max', email: 'max@gmail.com', age: 21, friends: [3]},
    {id: 2, name: 'John', email: 'john@gmail.com', age: 23, friends: [1, 3]},
    {id: 3, name: 'Harry', email: 'harry@gmail.com', age: 19, friends: [1, 2]}
];

/* GraphQL Types
================================================= */

// Person GraphQL Type
const PersonType = new GraphQLObjectType({
    name: 'PersonType',
    fields: () => ({
        id: {type: GraphQLInt},
        name: {type: GraphQLString},
        email: {type: GraphQLString},
        age: {type: GraphQLInt},
        friends: {
            type: new GraphQLList(PersonType),
            resolve(parentValue, args){

                let personFriends = [];

                for(let i = 0; i < persons.length; i++){
                    if(parentValue.friends.indexOf(persons[i].id) !== -1){
                        personFriends.push(persons[i]);
                    }
                }

                return personFriends;

                /* Mongoose(MongoDB) Counterpart code
                ========================================
                return Person.find({id: parentValue.id}).populate('friends').exec().then((person) => {
                    return person.friends;
                });
                */
            }
        }
    })
});


/* Defining Query Root
====================================================== */
const QueryRoot = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: () => ({
        person: {
            type: PersonType,
            args: {
                id: {type: GraphQLInt}
            },
            resolve(parentValue, args){

                for(let i = 0; i < persons.length; i++){
                    if(persons[i].id == args.id){
                        return persons[i];
                    }
                }

                /* Mongoose(MongoDB) Counterpart code
                ========================================
                return Person.find({id: args.id}).then((person) => {
                    return person;
                });
                */
            }
        },
        allPersons: {
            type: new GraphQLList(PersonType),
            resolve(parentValue, args){

                return persons;

                /* Mongoose(MongoDB) Counterpart code
                ========================================
                return Person.find({}).then((persons) => {
                    return persons;
                });
                */
            }
        }
    })
});


/* Defining Mutation Query
====================================================== */
const MutationRoot = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        addPerson: {
            type: PersonType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                email: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve(parentValue, args){

                persons.push({id: persons.length+1, name: args.name, email: args.email, age: args.age, friends: []});
                return persons[persons.length-1];

                /* Mongoose(MongoDB) Counterpart code
                ========================================
                const person = new Person({{id: persons.length+1, name: args.name, email: args.email, age: args.age});
                return person.save().then((person) => {
                    return person;
                })
                */
            }
        },
        deletePerson: {
            type: new GraphQLList(PersonType),
            args: {
                id: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve(parentValue, args) {

                persons = persons.filter((person) => {
                    return person.id !== args.id;
                });

                return persons;

                /* Mongoose(MongoDB) Counterpart code
                ========================================
                Person.find({id: args.id}).remove().exec().then((person) => {
                    return person;
                })
                */
            }
        },
        updatePerson: {
            type: PersonType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLInt)},
                name: {type: GraphQLString},
                email: {type: GraphQLString},
                age: {type: GraphQLInt}
            },
            resolve(parentValue, args) {

                let currentPerson = null, i;
                persons.every((person, index) => {
                    if(person.id === args.id) {
                        i = index;
                        currentPerson = person;
                        return false; // To break the Loop
                    }
                    return true;
                });

                if(currentPerson == null){
                    return null;
                }

                const personName = args.name || currentPerson.name;
                const personAge = args.age || currentPerson.age;
                const personEmail = args.email || currentPerson.email;
                const personFriends = args.friends || currentPerson.friends;

                persons[i] = {id: args.id, name: personName, email: personEmail, age: personAge, friends: personFriends};
                
                return persons[i];

                /* Mongoose(MongoDB) Counterpart code
                ========================================
                return Person.find({id: args.id}).then((person) => {
                    person.name = args.name || person.name;
                    person.age = args.age || person.age;
                    person.email = args.email || person.email;
                    return person.save().then((person) => person);
                });
                */
            }
        }
    })
});

/* Defining Root Entry points of our GraphQL Schema
============================================================== */

module.exports = new GraphQLSchema({
    query: QueryRoot,
    mutation: MutationRoot
});