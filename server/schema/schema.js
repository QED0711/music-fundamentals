const graphql = require('graphql');

const Instructor = require('../models/instructor')
const Lesson = require('../models/lesson')
const Content = require('../models/content')

const { 
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull
} = graphql;

const InstructorType = new GraphQLObjectType({
    name: "Instructor",
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        email: {type: GraphQLString},
        password: {type: GraphQLString},
        authorization: {type: GraphQLString},
        lessons: {
            type: new GraphQLList(LessonType),
            resolve(parent, args){
                return Instructor.findById(parent.instructorId);
            }
        }
    })
})

const LessonType = new GraphQLObjectType({
    name: "Lesson",
    fields: () => ({
        id: {type: GraphQLID},
        title: {type: GraphQLString},
        description: {type: GraphQLString},
        constents: {
            type: new GraphQLList(ContentType),
            resolve(parent,args){
                console.log("Hit Lesson => Contents")
            }
        }
    })
})

const ContentType = new GraphQLObjectType({
    name: "Content",
    fields: () => ({
        id: {type:GraphQLID},
        type: {type: GraphQLString},
        data: {type: GraphQLString},
    })
})


const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        instructor: {
            type: InstructorType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args){
                return Instructor.findById(args.id)
            }
        },
        instructorByName: {
            type: InstructorType,
            args: {name: {type: GraphQLString}},
            resolve(parent, args){
                console.log(args)
                
                return Instructor.find({name: args.name});
            }
        },
        instructors: {
            type: new GraphQLList(InstructorType),
            resolve(parent, args){
                return Instructor.find();
            }
        },
        lesson: {
            type: LessonType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args){
                return "LESSON TYPE"
            }
        }
    }
})


const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        addInstructor: {
            type: InstructorType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                email: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)}
            }, 
            resolve(parent, args){
                let instructor = new Instructor({
                    name: args.name,
                    email: args.email,
                    password: args.password,
                    authorization: "user",
                })
                return instructor.save();
            }
        },
    }
})




module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})