import Fluent       from "../lib/fluent.mjs";

/**
 *
 *
 * @author: blukassen
 */

let spec;
let obj;

let fluent = new Fluent();

/*
 * simple function answering input param with "!" appended
 */
spec = fluent.begin('select', 'what')
                .begin('where', 'clause')
                    .optional()
                    .oneMandatory()
                    .add('is', 'value').optional()
                    .add('isNot', 'value')
                    .add('startsWith', 'value')
                .end()
                .begin('and').repeat('where')
                .begin('or').repeat('where')
                .end()
                .add('observe').optional()
                .add('then').optional();

fluent
    .rule('select').param('what').def.ref('where').optional.end
    .rule('where').param('param').def
        .block
            .atLeastOne
            .ref('is').param('value').optional
            .ref('isNot').param('value').optional
            .ref('startsWith').param('value').optional
        .end
    .end;

spec = fluent.build();
