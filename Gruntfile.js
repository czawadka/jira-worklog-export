'use strict';

module.exports = function(grunt) {
	var BASE_DIR = "./";
	var SRC_DIR = BASE_DIR + "src/main/";
    var TARGET_DIR = BASE_DIR + "target/";

	grunt.initConfig({
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

	grunt.registerTask('compile', [ 'typescript' ]);
	grunt.registerTask('test', [ 'jshint', 'typescript', 'karma:chrome' ]);
    grunt.registerTask('run', [ 'compile', 'typescript', 'karma:chrome' ]);
	grunt.registerTask('default', [ 'test' ]);
};