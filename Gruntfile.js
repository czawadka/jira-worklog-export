'use strict';

module.exports = function(grunt) {
	var BASE_DIR = "./";
	var SRC_DIR = BASE_DIR + "src/main/";
    var TARGET_DIR = BASE_DIR + "target/";

	grunt.initConfig({
        exec: {
            run: {
                command: "node "+TARGET_DIR+'start.js'
            }
        },
        typescript: {
            source: {
                src: [SRC_DIR + 'ts/*.ts'],
                dest: TARGET_DIR,
                options: {
                    target: 'es3',
                    base_path: 'src/main/ts/',
                    sourcemap: true,
                    fullSourceMapPath: false,
                    declaration: false
                }
            }
        },
		watch: {
			scenarios: {
				files: [SRC_DIR + 'ts/*.ts'],
				tasks: ['compile']
			}
		},
		clean : {
			build: [TARGET_DIR]
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-internal');
	grunt.loadNpmTasks('grunt-typescript');
	grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-exec');

	grunt.registerTask('compile', [ 'typescript' ]);
	grunt.registerTask('test', [ 'jshint', 'compile', 'karma:chrome' ]);
    grunt.registerTask('run', [ 'compile', 'exec:run' ]);
	grunt.registerTask('default', [ 'test' ]);
};