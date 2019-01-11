const graphql = require('graphql');

const Instructor = require('../models/instructor')
const Lesson = require('../models/lesson')
const Content = require('../models/content')

const bcrypt = require("bcrypt")
const SALT_WORK_FACTOR = 10;

const { 
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLBoolean,
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
                return Lesson.find({instructorId: parent.id});
            }
        }
    })
})

const LessonType = new GraphQLObjectType({
    name: "Lesson",
    fields: () => ({
        id: {type: GraphQLID},
        type: {type: GraphQLString},
        title: {type: GraphQLString},
        description: {type: GraphQLString},
        published: {type: GraphQLBoolean},
        tags: {type: new GraphQLList(GraphQLString)},
        instructorId: {type: GraphQLID},
        contents: {
            type: new GraphQLList(ContentType),
            resolve(parent,args){
                return Content.find({lessonId: parent.id});
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
        lessonId: {type: GraphQLID},
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
            type: new GraphQLList(InstructorType),
            args: {
                name: {type: GraphQLString}
            },
            resolve(parent, args){
                return Instructor.find({name: args.name});
            }
        },
        instructorByEmail: {
            type: new GraphQLList(InstructorType),
            args: {
                email: {type: GraphQLString},
                password: {type: GraphQLString}
            },
            async resolve(parent, args){
                let instructor = await Instructor.find({email: args.email});
                let compared = await bcrypt.compare(args.password, instructor[0].password)
                if(compared){
                    return instructor
                }
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
                return Lesson.findById(args.id)
            }
        },
        lessons: {
            type: new GraphQLList(LessonType),
            resolve(parent, args){
                return Lesson.find()
            }
        },
        lessonsByTag: {
            type: new GraphQLList(LessonType),
            args: {
                tag: {type: GraphQLString}
            },
            resolve(parent, args){
                return Lesson.find({tags: args.tag})
            }
        },
        content: {
            type: ContentType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args){
                return Content.findById(args.id);
            }
        },
    }
})


const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        createInstructor: {
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
        
        createLesson: {
            type: LessonType,
            args: {
                instructorId: {type: new GraphQLNonNull(GraphQLID)},
                type: {type: new GraphQLNonNull(GraphQLString)},
                title: {type: new GraphQLNonNull(GraphQLString)},
                description: {type: new GraphQLNonNull(GraphQLString)},
                tags: {type: new GraphQLList(GraphQLString)}
            },
            resolve(parent,args){
                let lesson = new Lesson({
                    instructorId: args.instructorId,
                    type: args.type,
                    title: args.title,
                    description: args.description,
                    published: false,
                    tags: args.tags
                })
                return lesson.save()
            }
        },

        publishLesson: {
            type: LessonType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
                published: {type: new GraphQLNonNull(GraphQLBoolean)}
            },
            resolve(parent, args){
                return Lesson.findByIdAndUpdate(
                    args.id,
                    {$set: {published: args.published}}
                ).catch(err => new Error(err))
            }
        },

        creatContent: {
            type: ContentType,
            args: {
                lessonId: {type: new GraphQLNonNull(GraphQLID)},
                type: {type: new GraphQLNonNull(GraphQLString)},
                data: {type: new GraphQLNonNull(GraphQLString)},
            },
            resolve(parent, args){
                let content = new Content(args)
                return content.save();
            }
        }

    }
})




module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})