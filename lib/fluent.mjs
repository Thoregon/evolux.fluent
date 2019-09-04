import { errNoSegmentDefined, errNoBeginDefined } from "./errors.mjs";

/**
 * A fluent API builder which itself offers a fluent API
 *
 * predefined rules:
 *  - number
 *  - string
 *  - int
 *
 *  predefined values:
 *  - true/false
 *  - now (timestamp)
 *  - today (date w/o time)
 *  - any ... just a val() w/o specification
 *
 * @author: blukassen
 */

export default class Fluent {

    constructor({
            description = 'Fluent Builder'
        } = {}) {
        Object.assign(this, {
            description,
            rules: []
        });
    }

    rule(qualifier) {
        return this._pushRule(new Rule()._name(qualifier)._parent(this));
    }

    _pushRule(rule) {
        this.rules.push(rule);
        return rule;
    }

    get base() {
        return this;
    }

    /*
     * build fluent interface
     */

    build() {
        let fluent = this.newClass();
        let toprules = this.topRules();
        return this;
    }

    newClass() {
        // is there a create method
        return this._onCreate ? this._onCreate() : class {};
    }

    topRules() {
        return this.rules.filter(rule => rule.isTop(this.rules))
    }
}

/*
    EBNF for the fluent builder itself
    rule :=   sym | ref | par
    ref  :=   sym | ref |       or | rule | build | val | optional
    sym  :=         ref | par | or | rule | build | val | optional
    val  :=   sym | ref |       or | rule | build
    par  :=   sym | ref | par | or | rule | build
    or   :=   sym | ref | par
 */

class Segment {

    bind(obj) {
        this.obj = obj;
    }

    _parent(parent) {
        this.parent = parent;
        return this;
    }

    get base() {
        return this.parent ? this.parent.base : this;
    }

    /*
     * build
     */

    isReferenced(rule) {
        return false;
    }
}

class Rule extends Segment {

    constructor(props) {
        super(props);
        this.defs = [];
    }

    sym(symbol) {
        return this.pushDef(new Sym()._symbol(symbol)._parent(this));
    }

    ref(reference) {
        return this.pushDef(new Ref()._reference(reference)._parent(this));
    }

    par(qualifier) {
        return this.pushDef(new Par()._qualifier(qualifier)._parent(this));
    }

    /*
     * creation
     */

    addDef() {
        this.defs.push([]);
        return this._currentDef;
    }

    pushDef(def) {
        this._currentDef.push(def);
        return def;
    }

    /*
     * build
     */

    isTop(rules) {
        return !!rules.find(rule => rule.isReferenced(this))
    }

    isReferenced(rule) {
        return !!this.defs.find(def => def.find( subdef => subdef.isReferenced(rule)));
    }

    /*
     * private
     */

    _name(name) {
        this.name = name;
        return this;
    }

    get _currentDef() {
        return (this.defs.length === 0)
            ? this.addDef()
            : this.defs[this.defs.length - 1];
    }
}

/**
 * belongs to a rule
 */
class Expr extends Segment {

    get or() {
        this.parent.addDef();
        return new Or()._parent(this.parent);
    }
}

class Ref extends Expr {

    sym(symbol) {
        return this.parent.pushDef(new Sym()._symbol(symbol)._parent(this.parent));
    }

    ref(reference) {
        return this.parent.pushDef(new Ref()._reference(reference)._parent(this.parent));
    }

    rule(rule) {
        return this.base.rule(rule);
    }

    build() {
        return this.base.build();
    }

    get val() {
        return this.parent.pushDef(new Val()._parent(this.parent));
    }

    get optional() {
        this._optional = true;
        return this;
    }

    /*
     * build
     */

    isReferenced(rule) {
        return this.reference === rule.name;
    }

    /*
      * private
      */

    _reference(reference) {
        this.reference = reference;
        return this;
    }
}

class Sym extends Expr {

    ref(reference) {
        return this.parent.pushDef(new Ref()._reference(reference)._parent(this.parent));
    }

    par(qualifier) {
        return this.parent.pushDef(new Par()._qualifier(qualifier)._parent(this.parent));
    }

    rule(rule) {
        return this.base.rule(rule);
    }

    build() {
        return this.base.build();
    }

    get val() {
        return this.parent.pushDef(new Val()._parent(this.parent));
    }

    get optional() {
        this._optional = true;
        return this;
    }

    /*
     * private
     */
    _symbol(symbol) {
        this.symbol = symbol;
        return this;
    }
}

class Val extends Expr {

    sym(symbol) {
        return this.parent.pushDef(new Sym()._symbol(symbol)._parent(this.parent));
    }

    ref(reference) {
        return this.parent.pushDef(new Ref()._reference(reference)._parent(this.parent));
    }

    rule(rule) {
        return this.base.rule(rule);
    }

    build() {
        return this.base.build();
    }

}

/**
 * build: find last 'sym' and add as param
 */
class Par extends Expr {

    sym(symbol) {
        return this.parent.pushDef(new Sym()._symbol(symbol)._parent(this.parent));
    }

    ref(reference) {
        return this.parent.pushDef(new Ref()._reference(reference)._parent(this.parent));
    }

    par(qualifier) {
        return this.parent.pushDef(new Par()._qualifier(qualifier)._parent(this.parent));
    }

    rule(rule) {
        return this.base.rule(rule);
    }

    build() {
        return this.base.build();
    }

    /*
     * private
     */
    _qualifier(qualifier) {
        this.qualifier = qualifier;
        return this;
    }
}

/**
 *
 */
class Or extends Segment {

    sym(symbol) {
        return this.parent.pushDef(new Sym()._symbol(symbol)._parent(this.parent));
    }

    ref(reference) {
        return this.parent.pushDef(new Ref()._reference(reference)._parent(this.parent));
    }

    par(qualifier) {
        return this.parent.pushDef(new Par()._qualifier(qualifier)._parent(this.parent));
    }

}
