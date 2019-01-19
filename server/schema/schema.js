const graphql = require('graphql');

const Instructor = require('../models/instructor')
const Lesson = require('../models/lesson')
const Content = require('../models/content')

const bcrypt = require("bcrypt")

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
        data: {type: new GraphQLList(GraphQLString)},
        lessonId: {type: GraphQLID},
        position: {type: GraphQLInt}
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
        lessonsByInstructor: {
            type: new GraphQLList(LessonType),
            args: {
                instructorId: {type: GraphQLID}
            },
            resolve(parent,args){
                return Lesson.find({instructorId: args.instructorId})
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

        toggleLessonPublish: {
            type: LessonType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
            },
            async resolve(parent, args){
                let lesson = await Lesson.findById(args.id);
                lesson.published = !lesson.published;
                return lesson.save()
            }
        },

        deleteLesson: {
            type: LessonType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)}
            },
            async resolve(parent, {id}){
                let contents = await Content.find({lessonId: id})
                contents.forEach(content => content.remove())
                return Lesson.findByIdAndRemove(id);
            }
        },
        
        createContent: {
            type: ContentType,
            args: {
                lessonId: {type: new GraphQLNonNull(GraphQLID)},
                type: {type: new GraphQLNonNull(GraphQLString)},
                data: {type: new GraphQLNonNull(new GraphQLList(GraphQLString))},
                position: {type: new GraphQLNonNull(GraphQLInt)},
                
            },
            resolve(parent, args){
                let content = new Content(args)
                return content.save();
            }
        },
        
        deleteContent:{
            type: ContentType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
            },
            resolve(parent, {id}){
                return Content.findByIdAndRemove(id);
            }
        },

        reorderContents:{
            type: new GraphQLList(ContentType),
            args: {
                lessonId: {type: new GraphQLNonNull(GraphQLID)},
                id: {type: new GraphQLNonNull(GraphQLID)},
                position: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve(parent, {lessonId, id, position}){
                 return Content.reorderContents(lessonId, id, position)
            }
        },

        updateContent: {
            type: new GraphQLList(ContentType),
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
                data: {type: new GraphQLNonNull(new GraphQLList(GraphQLString))},
                position: {type: GraphQLInt},
            },
            async resolve(parent, {id, data, position}){
                let content = await Content.findById(id);
                content.data = data;
                content.save()                
                // we return all the contents of the lesson so that we can reset 
                // our main application state with a new version of our currentLesson contents
                return await Content.find({lessonId: content.lessonId})
            }
        }

    }
})




module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})