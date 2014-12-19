'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        // -- clean config -------------------------------------------------------
        clean: {
            files: ['dist', 'css']
        },

        // -- concat config ------------------------------------------------------
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },

            dist: {
                src: ['src/jquery.asScrollable.js'],
                dest: 'dist/jquery.asScrollable.js',
            },

            all: {
                src: ['libs/jquery.asScrollbar.js', 'src/jquery.asScrollable.js'],
                dest: 'dist/jquery.asScrollable.all.js',
            }
        },

        // -- uglify config -------------------------------------------------------
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/jquery.asScrollable.min.js',
            },
            all: {
                src: '<%= concat.all.dest %>',
                dest: 'dist/jquery.asScrollable.all.min.js',
            }
        },

        // -- copy config -------------------------------------------------------
        copy: {
            bower: {
                files: [{
                    expand: true,
                    flatten: true,
                    cwd: 'bower_components/',
                    src: [
                        'jquery/dist/jquery.min.js',
                        'jquery-wheel/jquery.mousewheel.min.js',
                        'jquery-asScrollbar/src/jquery.asScrollbar.js',
                        'holderjs/holder.js'
                    ],
                    dest: 'libs/'
                }]
            }
        },

        // -- jsbeautifier config --------------------------------------------------
        jsbeautifier: {
            files: ["src/**/*.js", 'Gruntfile.js'],
            options: {
                "indent_size": 4,
                "indent_char": " ",
                "indent_level": 0,
                "indent_with_tabs": false,
                "preserve_newlines": true,
                "max_preserve_newlines": 10,
                "jslint_happy": false,
                "brace_style": "collapse",
                "keep_array_indentation": false,
                "keep_function_indentation": false,
                "space_before_conditional": true,
                "eval_code": false,
                "indent_case": false,
                "unescape_strings": false
            }
        },

        // -- jshint config ---------------------------------------------------------
        jshint: {
            gruntfile: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: 'Gruntfile.js'
            },
            src: {
                options: {
                    jshintrc: 'src/.jshintrc'
                },
                src: ['src/**/*.js']
            }
        },

        // -- watch config -----------------------------------------------------------
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            src: {
                files: '<%= jshint.src.src %>',
                tasks: ['jshint:src', 'qunit']
            }
        },

        // -- Clean Config -----------------------------------------------------------
        less: {
            dist: {
                files: {
                    'css/asScrollable.css': 'less/asScrollable.less'
                }
            }
        },

        // -- autoprefixer config ----------------------------------------------------------
        autoprefixer: {
            options: {
                browsers: [
                    "Android 2.3",
                    "Android >= 4",
                    "Chrome >= 20",
                    "Firefox >= 24",
                    "Explorer >= 8",
                    "iOS >= 6",
                    "Opera >= 12",
                    "Safari >= 6"
                ]
            },
            src: {
                expand: true,
                cwd: 'css/',
                src: ['*.css', '!*.min.css'],
                dest: 'css/'
            }
        },

        // -- replace Config ----------------------------------------------------------
        replace: {
            bower: {
                src: ['bower.json'],
                overwrite: true, // overwrite matched source files
                replacements: [{
                    from: /("version": ")([0-9\.]+)(")/g,
                    to: "$1<%= pkg.version %>$3"
                }]
            },
            jquery: {
                src: ['asScrollable.jquery.json'],
                overwrite: true, // overwrite matched source files
                replacements: [{
                    from: /("version": ")([0-9\.]+)(")/g,
                    to: "$1<%= pkg.version %>$3"
                }]
            }
        }
    });

    // -- Main Tasks ------------------------------------------------------------------
    // These plugins provide necessary tasks.
    require('load-grunt-tasks')(grunt, {
        pattern: ['grunt-*']
    });

    // Default task.
    grunt.registerTask('default', ['js', 'dist', 'css']);
    grunt.registerTask('dist', ['clean', 'concat', 'uglify']);
    grunt.registerTask('css', ['less', 'autoprefixer']);
    grunt.registerTask('js', ['jsbeautifier', 'jshint']);

    grunt.registerTask('version', [
        'replace:bower',
        'replace:jquery'
    ]);
};
