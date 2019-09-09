import Fluent       from "../lib/fluent.mjs";

/**
 *
 *
 * @author: blukassen
 */

let builder;
let obj;

let fluent = new Fluent({ name: 'QueryBuilder', description: 'Fluent query builder' });

/*
 * simple function answering input param with "!" appended
 */

fluent
    .rule('query').sym('select', 'what').ref('where').optional.ref('build')
    .rule('where').sym('where', 'qualifier').ref('whereCondition')
    .rule('whereCondition')
        .ref('expression')
        .or.ref('expression').sym('or').ref('whereCondition')
        .or.ref('expression').sym('and').ref('whereCondition')
    .rule('expression')
        .sym('is', 'val')
        .or.sym('isNot', 'val')
        .or.sym('startsWith', 'val')
        .or.sym('startsNotWith', 'val')
        .or.sym('contains', 'val')
        .or.sym('containsNot', 'val')
        .or.sym('isLess', 'val')
        .or.sym('isLessOrEqual', 'val')
        .or.sym('in', 'val')
        .or.sym('notIn', 'val')
        .or.sym('between', 'valbegin', 'valend')
    .rule('build').sym('then');

builder = fluent.build();
console.log(builder);

let query = builder.select('order').where('address').is(1234);

query = builder.select('address').where('status').isNot('x').and('zip').between(1000).and(1999);

query.then(observable => console.log(observable));

/*
fluent = new Fluent({ description: 'Fluent component installer' });

fluent
    .rule('');

builder = fluent.build();
*/

