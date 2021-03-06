// for tests
var expect = require("chai").expect;
var should = require('chai').should();

// enable polyfills
var observe = require("../polyfills/object-observe");
require("../polyfills/es6-promise-2.0.1").polyfill();

// variables
var store = require("../source/restrictedstore").Store;
var modelID = 'my_model';
var model;

describe('0.0: State test', function () {

    before(function () {
        model = {
            attr: 1,
            array: [
                1,
                2,
                3
            ],
            obj: {
                attr: 'a'
            }
        };
        store.wrap(modelID, model);
    });

    after(function () {
        store.unwrap(modelID);
    });

    it('0.0.0: Get projection & check initial projection equality', function () {
        var projection = store.getProjection(modelID);
        expect(projection).to.be.a('object');
        (JSON.stringify(projection)).should.equal(JSON.stringify(model));
    });

    it('0.0.1: Get projection after model change', function () {
        var projection;
        model.attr = 2;
        projection = store.getProjection(modelID);
        expect(projection).to.be.a('object');
        (JSON.stringify(projection)).should.equal(JSON.stringify(model));
    });

    it('0.0.2: Update projection by callback', function (done) {
        var projection,
            observer = function (object) {
                (JSON.stringify(object)).should.equal(JSON.stringify(model));
                (JSON.stringify(projection)).should.not.equal(JSON.stringify(model));

                store.unobserve(modelID, observer);
                done();
            };

        projection = store.observe(modelID, observer);

        model.array.push(4);
    });

    it('0.0.3: Detach callback', function (done) {
        var counter = 0,
            observer = function () {
                counter++;
                store.unobserve(modelID, observer);

                model.obj.attr = 'c';
            };

        store.observe(modelID, observer);

        model.obj.attr = 'd';

        setTimeout(function () {
            (counter).should.equal(1);
            done();
        }, 100);
    });

});

describe('0.1: Test of weak mirrors', function () {

    before(function () {
        model = {
            attr: 1,
            array: [
                1,
                2,
                3
            ],
            obj: {
                attr: 'a'
            }
        };
        store.wrap(modelID, model);
    });

    after(function () {
        store.unwrap(modelID);
    });

    it('0.1.0: Create mirrors', function () {
        var mirror1, mirror2,
            observer1 = function (object) {

            },
            observer2 = function (object) {

            };

        mirror1 = store.observe(modelID, observer1, {mirror: true});
        mirror2 = store.observe(modelID, observer2, {mirror: true});

        expect(mirror1).to.be.a('object');
        expect(mirror2).to.be.a('object');

        (JSON.stringify(mirror1)).should.equal(JSON.stringify(model));
        (JSON.stringify(mirror2)).should.equal(JSON.stringify(model));

        (mirror1).should.not.equal(mirror2);

        store.unobserve(modelID, observer1);
        store.unobserve(modelID, observer2);
    });

    it('0.1.1: Update mirrors & notify via callback', function (done) {
        var mirror,
            observer = function (object) {
                (JSON.stringify(object)).should.equal(JSON.stringify(model));
                (mirror).should.equal(object);

                store.unobserve(modelID, observer);
                done();
            };

        mirror = store.observe(modelID, observer, {mirror: true});

        model.obj.attr = 7;
    });

    it('0.1.2: Detach callback', function (done) {
        var counter = 0,
            mirror,
            observer = function () {
                counter++;
                store.unobserve(modelID, observer);

                model.attr = 'c';
            };

        mirror = store.observe(modelID, observer, {mirror: true});

        model.attr = 'd';

        setTimeout(function () {
            (counter).should.equal(1);
            (mirror.attr).should.equal('d');
            done();
        }, 100);
    });

    it('0.1.2: Custom mirror attribute', function (done) {
        var mirror,
            observer = function () {
                store.unobserve(modelID, observer);

                (mirror.attr).should.equal('f');
                (mirror.custom).should.equal('new');
                ('custom' in model).should.equal(false);

                done();
            };

        mirror = store.observe(modelID, observer, {mirror: true});

        model.attr = 'f';
        mirror.custom = 'new';
    });

    it('0.1.3: Custom array element in mirror', function (done) {
        var mirror,
            observer = function () {
                store.unobserve(modelID, observer);

                (mirror.array.indexOf('new')).should.equal(mirror.array.length - 1);
                (model.array.indexOf('new')).should.equal(-1);

                done();
            };

        mirror = store.observe(modelID, observer, {mirror: true});

        model.newAttr = 'z';
        mirror.array.push('new');
    });

});


describe('0.2: Test of strong mirrors', function () {

    before(function () {
        model = {
            attr: 1,
            array: [
                1,
                2,
                3
            ],
            obj: {
                attr: 'a'
            }
        };
        store.wrap(modelID, model);
    });

    after(function () {
        store.unwrap(modelID);
    });

    it('0.2.0: Create mirrors', function () {
        var mirror1, mirror2,
            observer1 = function (object) {

            },
            observer2 = function (object) {

            };

        mirror1 = store.observe(modelID, observer1, {mirror: true, weak: false});
        mirror2 = store.observe(modelID, observer2, {mirror: true, weak: false});

        expect(mirror1).to.be.a('object');
        expect(mirror2).to.be.a('object');

        (JSON.stringify(mirror1)).should.equal(JSON.stringify(model));
        (JSON.stringify(mirror2)).should.equal(JSON.stringify(model));

        (mirror1).should.not.equal(mirror2);

        store.unobserve(modelID, observer1);
        store.unobserve(modelID, observer2);
    });

    it('0.2.1: Update mirrors & notify via callback', function (done) {
        var mirror,
            observer = function (object) {
                (JSON.stringify(object)).should.equal(JSON.stringify(model));
                (mirror).should.equal(object);

                store.unobserve(modelID, observer);
                done();
            };

        mirror = store.observe(modelID, observer, {mirror: true, weak: false});

        model.obj.attr = 117;
    });

    it('0.2.2: Detach callback', function (done) {
        var counter = 0,
            mirror,
            observer = function () {
                counter++;
                store.unobserve(modelID, observer);

                model.attr = 'c';
            };

        mirror = store.observe(modelID, observer, {mirror: true, weak: false});

        model.attr = 'ddd';

        setTimeout(function () {
            (counter).should.equal(1);
            (mirror.attr).should.equal('ddd');
            done();
        }, 100);
    });

    it('0.2.3: Custom mirror attribute', function (done) {
        var mirror,
            observer = function () {
                store.unobserve(modelID, observer);

                (JSON.stringify(mirror)).should.equal(JSON.stringify(model));

                done();
            };

        mirror = store.observe(modelID, observer, {mirror: true, weak: false});

        model.attr = 'fff';
        mirror.custom = 'new1';
    });

    it('0.2.4: Custom array element in mirror', function (done) {
        var mirror,
            observer = function () {
                store.unobserve(modelID, observer);

                (JSON.stringify(mirror)).should.equal(JSON.stringify(model));

                done();
            };

        mirror = store.observe(modelID, observer, {mirror: true, weak: false});

        model.newAttr = 'zzz';
        mirror.array.push('new1');
    });

});

describe('0.3: Unwrap & change models', function () {
    var newModel = {'new': 'new'};

    before(function () {
        model = {
            attr: 1,
            array: [
                1,
                2,
                3
            ],
            obj: {
                attr: 'a'
            }
        };
        store.wrap(modelID, model);
    });

    it('0.3.0: Change model', function (done) {
        var counter = 0,
            projection,
            observer = function (object) {
                counter++;

                if (counter === 1) {
                    store.change(modelID, newModel);
                }
                projection = object;
            };

        store.observe(modelID, observer);

        model.attr = '_c';

        setTimeout(function () {
            (counter).should.equal(2);
            (JSON.stringify(store.getProjection(modelID))).should.equal(JSON.stringify(newModel));
            (JSON.stringify(projection)).should.equal(JSON.stringify(newModel));

            store.unobserve(modelID, observer);
            done();
        }, 100);
    });

    it('0.3.1: Unwrap model', function (done) {
        var counter = 0,
            observer = function () {
                counter++;
                store.unwrap(modelID);
            };

        store.observe(modelID, observer);

        newModel.attr = 'd';

        setTimeout(function () {
            (counter).should.equal(1);
            expect(store.getProjection(modelID)).to.be.a('undefined');
            done();
        }, 100);
    });
});

describe('0.4: Promises test', function () {

    before(function () {
        model = {
            attr: 0,
            array: [
                1,
                2,
                3
            ],
            obj: {
                attr: 0
            }
        };
        store.wrap(modelID, model);
    });

    after(function () {
        //store.unwrap(modelID);
    });

    it('0.4.0: Create promise for model', function (done) {
        var executor = function (resolve, reject) {
                setTimeout(function () {
                    resolve();
                }, 50);
            },
            promise = store.createPromise(modelID, executor);


        promise.then(done);
    });


    it('0.4.1: Model states', function (done) {
        var promise, state = store.getModelState(modelID);

        function executor(resolve, reject) {
            setTimeout(function () {
                reject('reject value');
            }, 100);
        }

        promise = store.createPromise(modelID, executor);
        state += ' ' + store.getModelState(modelID);
        promise.catch(function (val) {
            state += ' ' + store.getModelState(modelID);
            (state).should.equal('valid pending invalid');
            (val).should.equal('reject value');

            done();
        });
    });

    it('0.4.2: Promises chain', function (done) {
        function createAsync(val) {
            return store.createPromise(modelID, function (resolve, reject) {
                setTimeout(function () {
                    resolve(val + ' ' + store.getModelState(modelID));
                }, 10);
            });
        }

        createAsync(store.getModelState(modelID)).then(function (val) {
            return createAsync(val);
        }).then(function (val) {
            return createAsync(val);
        }).then(function (val) {
            (val + ' ' + store.getModelState(modelID)).should.equal('invalid pending pending pending valid');
            done();
        });
    });

    it('0.4.3: Promises chain with callback notification', function (done) {
        function createAsync(val) {
            return store.createPromise(modelID, function (resolve) {
                setTimeout(function() {
                    model.attr += 1;
                    resolve();
                }, 10);
            });
        }

        function observer() {
            (model.attr).should.equal(3);
            store.unobserve(modelID, observer);
            done();
        }

        store.observe(modelID, observer);

        createAsync(store.getModelState(modelID)).then(function (val) {
            return createAsync(val);
        }).then(function (val) {
            return createAsync(val);
        });
    });

    it('0.4.4: Promises chain with callback notification view "dirty" checking', function (done) {
        function createAsync(val) {
            return store.createPromise(modelID, function (resolve) {
                setTimeout(function() {
                    if (model.obj.attr === 0) {
                        model.obj.attr += 1;
                    }
                    resolve();
                }, 10);
            });
        }

        function observer(object) {
            (object.obj.attr).should.equal(1);
            store.unobserve(modelID, observer);
            done();
        }

        store.observe(modelID, observer);

        createAsync(store.getModelState(modelID)).then(function (val) {
            return createAsync(val);
        }).then(function (val) {
            return createAsync(val);
        });
    });

});