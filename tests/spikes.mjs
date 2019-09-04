import Fluent       from "../lib/fluent.mjs";

/**
 *
 *
 * @author: blukassen
 */

let builder;
let obj;

let fluent = new Fluent({ description: 'Fluent query builder' });

/*
 * simple function answering input param with "!" appended
 */

fluent
    .rule('query').sym('select').par('what').ref('where').optional.ref('build')
    .rule('where').sym('where').ref('whereCondition')
    .rule('whereCondtion')
        .ref('expression')
        .or.sym('not').ref('expression')
        .or.ref('expression').sym('or').ref('expression')
        .or.ref('expression').sym('and').ref('expression')
    .rule('expression')
        .par('qualifier').sym('is').val
        .or.par('qualifier').sym('isNot').val
        .or.par('qualifier').sym('startsWith').val
        .or.par('qualifier').sym('startsNotWith').val
        .or.par('qualifier').sym('contains').val
        .or.par('qualifier').sym('containsNot').val
        .or.par('qualifier').sym('isLess').val
        .or.par('qualifier').sym('isLessOrEqual').val
        .or.par('qualifier').sym('is').val
        .or.par('qualifier').sym('is').val
        .or.par('qualifier').sym('is').val
    .rule('build').sym('observe').or.sym('then');

builder = fluent.build();
console.log(builder);

let query = builder.select('order').where('address').is(1234);

/*
fluent = new Fluent({ description: 'Fluent component installer' });

fluent
    .rule('');

builder = fluent.build();
*/

