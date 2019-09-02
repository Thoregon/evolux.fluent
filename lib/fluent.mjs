import { errNoSegmentDefined } from "./errors.mjs";

/**
 * A fluent API builder which itself offers a fluent API
 *
 * @author: blukassen
 */

export default class Fluent {

    constructor({
            description = 'Fluent Builder'
        } = {}) {
        Object.assign(this, {
            description,
            segment: undefined
        });
    }

    bind(obj) {
        this.segment.bind(obj);
        return this;
    }

    begin(selector) {
        let segment = { selector };
        if (this.segment) segment.parent = this.segment;
        this.segment = segment;
        return this;
    }

    optional(selector) {
        this.segment.optional = true;
        return this;
    }

    add(selector) {
        return this;
    }

    addOptional() {
        return this;
    }

    oneMandatory() {
        return this;
    }

    end() {
        return this;
    }

    repeat() {
        return this;
    }

    finalize() {
        return this;
    }

    /*
     * private methods
     */

}

class Segment {

    constructor(selector) {
        Object.assign(this, { selector, obj: {} });
    }

    bind(obj) {
        this.obj = obj;
    }

}
