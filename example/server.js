var BrassTacks = require('../src/brasstacks');

var bt = new BrassTacks({
    url : '',
    controller : function() {
        console.log('always triggered');
    },
    routes : [
        {
            id : 'dashboard',
            url : '/dashboard',
            controller : function() {
                console.log('dashboard');
            },
            resetParentStack : true,
            routes : [
                {
                    id : 'add',
                    url : '/add',
                    controller : function() {
                        console.log('add');
                    },
                    runParentRoutes : true
                },
                {
                    id : 'edit',
                    url : '/edit/:id',
                    controller : function(a) {
                        console.log('edit');
                    },
                    runParentRoutes : true,
                    routes : [
                        {
                            url : '/name/:yah',
                            controller : function(pars) {
                                console.log(pars);
                            }
                        }
                    ]
                }
            ]
        }
    ]
});


bt.route('/dashboard');
bt.route('/dashboard/add');
bt.route('/dashboard/edit/123/name/something');
