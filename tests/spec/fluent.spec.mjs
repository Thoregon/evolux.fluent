import fluent       from '../lib/fluent.mjs';

/**
 *
 *
 * @author: blukassen
 */
describe('evolux.fluent', () => {
    it('should build a simple method, answering input param with "!" appended', () => {
        let spec = {
            $ : (param) => `${param}!`
        };

        let fn = fluent(spec);

        expect(fn('ok')).to.eql('ok!');
    });

    it('should create a nested API', () => {
        let spec = {
            'select' : {
                '*',
                'where' : {}
            },
            'then' : () => {},
            'observe' : () => {}
        }
    });

    it('should extend an existing API', () => {

    });

    it('should bind to an existing Object', () => {
        let obj = {
            select(spec) {

            },
            then() {

            },
            observe() {

            }
        }

        let spec =
    })
});
