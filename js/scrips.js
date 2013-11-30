// global app, so you can see what here happening from console
var app,
// tree redactor of questions and notes
trees = {
    question: {
        1: {
            title: 'First question, without nesting',
            notes: []
        },
        2: {
            title: 'Second question, 1-level nesting',
            notes: [1]
        },
        3: {
            title: 'Third question, multi-level nesting',
            notes: [1, 2,3]
        }
    },
    note: {
        1: {
            title: '1st note',
            notes: []
        },
        2: {
            title: '2nd note',
            notes: [4,5]
        },
        3: {
            title: '3rd note',
            notes: []
        },
        4: {
            title: '4th note',
            notes: [7,8]
        },
        5: {
            title: '5th note',
            notes: [6]
        },
        6: {
            title: '6th note',
            notes: []
        },
        7: {
            title: '7th note',
            notes: []
        },
        8: {
            title: '8th note',
            notes: []
        },
        9: {
            title: '9th note',
            notes: [10]
        },
        10: {
            title: '10th note',
            notes: [11]
        },
        11: {
            title: '11 note',
            notes: [12]
        },
        12: {
            title: '12 note',
            notes: [13]
        },
        13: {
            title: '13 note',
            notes: [14]
        },
        14: {
            title: '14 note',
            notes: [15]
        },
        15: {
            title: '15 note',
            notes: [16]
        },
        16: {
            title: '16 note',
            notes: [17]
        },
        17: {
            title: '17 note',
            notes: [18]
        },
        18: {
            title: '18 note',
            notes: []
        }
    }
};

$(function(){
    app = {
        // getData called when click "edit"
        getData: function() {
            var self = this,
                $button = $(this),
                $item = $button.closest('div'),
                $li = $item.closest('li'),
                
                id = $item.attr('id').replace(/[^0-9.]/g, ""),
                inputs = $item.find(':input'),
                mode = $button.attr('class'),
                type = $item.attr('class');

            $.ajax({
                type: 'GET',
                url: '/',
                dataType: 'json',
                data: inputs.serialize() + '&id=' + id + '&mode=' + mode + '&type=' + type,
                beforeSend: function(xhr){
                    var $inner_notes = $li.find('ul .save').not('.ignore'),
                        $children_notes = app.getClosestChildrens($inner_notes);
                    if($children_notes.length) {
                        var deferreds = [];
                        $children_notes.each(function() {
                            deferreds.push(app.saveData.call(this));
                        });
                        $.when.apply(null, deferreds).always(function() {
                            app.getData.call(self);
                        });
                        xhr.abort();
                    }
                },
                success: function(response){
                    if ( ! response.errors) {
                        // Rendering new branch
                        var emulateResponseData = emulator.getTree({
                            id: response.data.id,
                            mode: response.data.mode,
                            type: response.data.type,
                            title: response.data.title
                        });
                        // Logging to console
                        emulator.logResponse({
                            response: response,
                            template: emulateResponseData,
                            mode: 'editing'
                        });
                        $li.replaceWith(emulateResponseData);
                    }
                }
            });
        },
        // saveData called when click "save"
        saveData: function() {
            var self = this,
                $button = $(this),
                $item = $button.closest('div'),
                $li = $item.closest('li'),
                
                id = $item.attr('id').replace(/[^0-9.]/g, ""),
                inputs = $item.find(':input'),
                mode = $button.attr('class'),
                type = $item.attr('class');

            return $.Deferred(function() {
                var def = this;
                $.ajax({
                    type: 'GET',
                    url: '/',
                    dataType: 'json',
                    data: inputs.serialize() + '&id=' + id + '&mode=' + mode + '&type=' + type,
                    beforeSend: function(xhr){
                        var $inner_notes = $li.find('ul .save').not('.ignore'),
                            $children_notes = app.getClosestChildrens($inner_notes);

                        if($children_notes.length) {
                            var deferreds = [];
                            $children_notes.each(function() {
                                deferreds.push(app.saveData.call(this));
                            });
                            $.when.apply(null, deferreds).always(function() {
                                app.saveData.call(self);
                            });
                            xhr.abort();
                        }
                    },
                    success: function(response){
                        if ( ! response.errors) {
                            // Emulate saving to DB (of course it should be executed at server, in real world)
                            emulator.trees[response.data.type][response.data.id].title = response.data.title;
                            // Rendering new branch
                            var emulateResponseData = emulator.getTree({
                                id: response.data.id,
                                mode: response.data.mode,
                                type: response.data.type,
                                title: response.data.title
                            });
                            // Logging to console
                            emulator.logResponse({
                                response: response,
                                template: emulateResponseData,
                                mode: 'saving'
                            });
                            $li.replaceWith(emulateResponseData);
                        } else {
                            $button.addClass('ignore');
                        }
                    },
                    error: function() {
                        $button.addClass('ignore');
                    }
                }).complete(function() {
                    def.resolve();
                });
            });
        },
        // get closest nested items 
        getClosestChildrens: function($inner_notes) {
            var children_notes = $.grep($inner_notes, function(value, key) {
                var is_child_of = false,
                    $btn = $(value),
                    $parent_li = $btn.closest('li');
                $inner_notes.not($btn).each(function(key,v) {
                    if($(this).closest($parent_li).length) {
                        is_child_of = true;
                    }
                });
                return is_child_of ? false : true;
            });
            return $(children_notes);
        },
        initEventListeners: function() {
            var self = this;
            // Editing
            $('.container').on('click', '.edit', function() {
                self.getData.call(this);
            });
            // Saving
            $('.container').on('click', '.save', function() {
                self.saveData.call(this);
            });
            // Draw dummy line to console for convenient debugging
            $('.container').on('click', '.edit, .save', function() {
                emulator.logSeparatorLine();
            });
        },
        init: function() {
            // Render all tree
            $.each(emulator.trees.question, function(id) {
                $('.questions').append(emulator.getTree({id: id}))
            });
            this.initEventListeners();
        }
    };
    
    // Server emulator, like templating render
    // + some utilities for console
    var emulator = {
        trees: trees,
        getTree: function(data) {
            var self = this,
                li = '<li>',
                mode = typeof data.mode != 'undefined' ? data.mode : 'save',
                type = typeof data.type != 'undefined' ? data.type : 'question',
                id = typeof data.id == 'string' ? data.id.replace(/[^0-9.]/g, "") : data.id,
                item = self.trees[type][id];

            if(typeof item == 'undefined')
                return false;

            li += self.templates[mode]
                .replace('{{id}}', id)
                .replace('{{title}}', data.title || item.title)
                .replace('{{type}}', type);

            if(item.notes.length) {
                li += '<ul>';
                $.each(item.notes, function(key, note_id) {
                    li += self.getTree({
                        id: note_id,
                        type: 'note'
                    }) || '';
                });
                li += '</ul>';
            }
            li += '</li>'
            return li;
        },
        templates: {
            edit: '<div class="{{type}}" id="id{{id}}"><input type="text" name="title" value="{{title}}"><span class="save">save</span></div>',
            save: '<div class="{{type}}" id="id{{id}}"><span class="text">{{title}}</span><span class="edit">edit</span></div>'
        },
        logSeparatorLine: function() {
            console && typeof console.warn != 'undefined' ? console.warn('---------') : console.log('---------');
        },
        logResponse: function(data) {
            var response = data.response.data,
                mode = data.mode.toUpperCase(),
                template = data.template;
            console && console.log('Just imagine that server returned this template to your '+mode+' request');
            console.log(response);
            console && typeof console.dirxml != 'undefined' ? console.dirxml($(template)) : console.log(template);
        }
    }

    app.init();
});