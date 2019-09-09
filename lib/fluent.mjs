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
            name,
            description = 'Fluent Builder'
        } = {}) {
        Object.assign(this, {
            name,
            description,
            rules:  [],
            on:     {},
            classBuilder: undefined
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
        let toprules = this.topRules();
        toprules.forEach(rule => rule.attach(this));
        let FluentBuilder = this.newClass();
        this.classBuilder.build(FluentBuilder);
        return new FluentBuilder();
    }

    newClass() {
        // is there a create method
        return this.on.create ? this.on.create() : class { };
    }

    topRules() {
        return this.rules.filter(rule => rule.isTop(this.rules))
    }

    findRule(name) {
        return this.rules.find(rule => rule.name === name);
    }
}

/*
    methods for the fluent builder itself
    rule :   sym | ref
    ref  :   sym | ref | or | rule | build | optional | repeat
    sym  :         ref | or | rule | build | optional
    val  :   sym | ref | or | rule | build
    par  :   sym | ref | or | rule | build
    or   :   sym | ref
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

    references(rule) {
        return false;
    }

    prepare(cls) {
        // do nothing; implement by subclass
        console.log(`Segment.prepare`);
    }

    attach(fluent) {
        console.log(`Segment.attach`);
    }

    /*
     * reflection
     */

    isRef() { return false; }
    isSym() { return false; }
    isOr() { return false; }
}

class Rule extends Segment {

    constructor(props) {
        super(props);
        this.defs = [];
        this.processed = false;
    }

    sym(symbol, ...pars) {
        return this.pushDef(new Sym()._symbol(symbol)._params(...pars)._parent(this));
    }

    ref(reference) {
        return this.pushDef(new Ref()._reference(reference)._parent(this));
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
        return !rules.find(rule => rule.isReferenced(this))
    }

    isReferenced(rule) {
        return !!this.defs.find(def => !!def.find( subdef => subdef.references(rule)));
    }

    attach(fluent, parentbuilder, optional) {
        console.log(`Rule.attach ${this.name}`);
        this.defs.forEach(def => {
            let builder = parentbuilder;
            def.forEach(item => {
                builder = item.prepare(fluent, builder);
                if (!fluent.classBuilder) fluent.classBuilder = builder;
            } );
        });
    }

    prepare(fluent, parentbuilder) {
        console.log(`Rule.prepare ${this.name}`);
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

    sym(symbol, ...pars) {
        return this.parent.pushDef(new Sym()._symbol(symbol)._params(...pars)._parent(this.parent));
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

    get optional() {
        this._optional = true;
        return this;
    }

    repeat(times) {
        this._repeat = times ? times : -1;
    }

    /*
     * build
     */

    references(rule) {
        return this.reference === rule.name;
    }

    prepare(fluent, parentbuilder) {
        console.log(`Ref.prepare ${this.reference}`);
        let rule = this.base.findRule(this.reference);
        if (rule.processed) {
            // todo: reuse rule: with new Classbuilder, attach to prevoius parent
            console.log(`Ref.circular ${this.reference}`)
        } else {
            rule.processed = true;
            rule.parentBuilder = parentbuilder;
            // todo: optional
            rule.attach(fluent, parentbuilder, this._optional);
        }
    }

    isCircular() {
        return false;
    }

    /*
     * reflection
     */

    isRef() { return true; }

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

    rule(rule) {
        return this.base.rule(rule);
    }

    build() {
        return this.base.build();
    }

    get optional() {
        this._optional = true;
        return this;
    }

    /*
     * build
     */

    prepare(fluent, parentbuilder) {
        console.log(`Sym.prepare ${this.symbol}`);
        let builder = new ClassBuilder(this.symbol);
        if (parentbuilder) parentbuilder.addChild(builder);

        // add method
        builder.addCurrentMethod(new MethodBuilder(this.symbol, this,this._optional).addParams());

        return builder;
    }
    /*
     * reflection
     */

    isSym() { return true; }

    /*
     * private
     */
    _symbol(symbol) {
        this.symbol = symbol;
        return this;
    }

    _params(...pars) {
        this.pars = pars;
        return this;
    }
}

/**
 *
 */
class Or extends Segment {

    sym(symbol, ...pars) {
        return this.parent.pushDef(new Sym()._symbol(symbol)._params(...pars)._parent(this.parent));
    }

    ref(reference) {
        return this.parent.pushDef(new Ref()._reference(reference)._parent(this.parent));
    }

    /*
     * build
     */

    prepare(fluent, parentbuilder) {
        console.log(`$$$ Or.prepare`);  // should never happen
    }

    /*
     * reflection
     */

    isOr() { return true; }

}

/**
 *
 */

class ClassBuilder {

    constructor(name, optional) {
        Object.assign(this, {
            name,
            optional,
            methods: [],
            children: []
        });
    }

    withRules(rules) {
        this.rules = rules;
        return this;
    }

    findRule(name) {
        return this.rules.find(rule => rule.name === name);
    }

    build(cls) {
        return cls;
    }

    addCurrentMethod(mth) {
        this.methods.push(mth);
        this.currentMethod = mth;
        return this;
    }

    addChild(clsbuilder) {
        clsbuilder.parent = this;
        this.children.push(clsbuilder);
    }
}

class MethodBuilder {

    constructor(name, optional) {
        Object.assign(this, {
            name,
            optional,
            params: []
        });
    }

    addParams(...pars) {
        this.params.push(...pars);
        return this;
    }
}
